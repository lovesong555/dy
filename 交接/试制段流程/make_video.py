#!/usr/bin/env python3
"""一条命令出片（省 token、省时间的固定流程）。

  python3 交接/试制段流程/make_video.py <chunks.json> <输出目录> <成片名> [--hv] [--force]（默认只出竖版）

做什么（每一步都有缓存，改一句只重做那一句）：
  1. 读音检查（check_pron.py）。有风险词就停下，除非加 --force。
  2. 配音：口播文字没变就复用旧的 mp3。
  3. 写分镜 JSON（宋玉模板：章节进度条按配音时长自动算）。
  4. 渲染：只重渲“内容或时长变了”的镜头（按镜头算指纹，引擎文件改了就全部重渲）；
     横竖各分两路并行，用进程句柄等待结束（不用 pgrep，避免匹配到自己）。
  5. 拼接 + 配音 + 字幕 → <输出目录>/<成片名>_竖版.mp4 / _横版.mp4
  6. 出一张审片小样（每 2 秒一帧拼成一张图）：<输出目录>/审片_竖版.jpg
只打印摘要。

依赖：图表源码/ 下起好 http.server 8765；仓库根目录有 src -> 图表源码 的软链接；edge-tts 在 PATH 里。
"""
import hashlib, json, os, subprocess, sys
here = os.path.dirname(os.path.abspath(__file__))
args = [a for a in sys.argv[1:] if not a.startswith('--')]
chunks, out, title = args[0], args[1], args[2]
# 只出竖版（2026-10-25 定）；要横版加 --hv
ORI = 'hv' if '--hv' in sys.argv else 'v'
os.makedirs(out, exist_ok=True)
# 渲染要用的本地网页服务：没开就自动开（会话重启后常被关掉）
import socket
with socket.socket() as _s:
    if _s.connect_ex(('127.0.0.1', 8765)):
        subprocess.Popen([sys.executable, '-m', 'http.server', '8765'], cwd='图表源码', stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
        import time; time.sleep(1)
if not os.path.exists('src'): os.symlink('图表源码', 'src')

# 1. 读音检查
r = subprocess.run([sys.executable, f'{here}/check_pron.py', chunks], capture_output=True, text=True)
print(r.stdout.strip().splitlines()[-1])
if r.returncode and '--force' not in sys.argv:
    print(r.stdout); sys.exit('读音检查没通过：改词，或确认后在该句加 pron_ok，再运行')

# 2–3. 配音 + 分镜（复用 make_segment 的逻辑，但不渲染、不合成）
env = dict(os.environ, SKIP_RENDER='1', SKIP_MUX='1')
subprocess.run([sys.executable, f'{here}/make_segment.py', '07', chunks, out], env=env, check=True, capture_output=True)
name = '07seg'
spec = json.load(open('src/scenes/07seg.json'))
engine = hashlib.md5(open('图表源码/scene.html', 'rb').read()).hexdigest()

# 4. 只渲染变了的镜头：横竖四路同时开，全部用进程句柄等待
procs, plan = [], []
for o, d in (('h', '横版'), ('v', '竖版')):
    if o not in ORI: continue
    fp_path = f'{out}/指纹_{o}.json'
    old = json.load(open(fp_path)) if os.path.exists(fp_path) else {}
    new, todo = {}, []
    for i, s in enumerate(spec['scenes'], 1):
        key = f"{name}_{i:02d}_{s['type']}"
        h = hashlib.md5((engine + json.dumps(s, sort_keys=True, ensure_ascii=False) + json.dumps({k: spec.get(k) for k in ('chapters', 'brand', 'cat', 'tagline')}, ensure_ascii=False)).encode()).hexdigest()
        new[key] = h
        if old.get(key) != h or not os.path.exists(f'{out}/{d}/镜头MP4/{key}.mp4'): todo.append(str(i))
    print(f'{d}：{len(spec["scenes"])} 个镜头，需要渲染 {len(todo)} 个')
    half = (len(todo) + 1) // 2
    for k, part in enumerate((todo[:half], todo[half:])):
        if part: procs.append(subprocess.Popen(['node', '图表源码/渲染脚本/render_scene.mjs', name, out, o, *part],
                                               env=dict(os.environ, NOCONCAT='1'), stdout=open(f'{out}/渲染日志_{o}{k}.txt', 'w'), stderr=subprocess.STDOUT))
    plan.append((o, d, fp_path, new))
if any(p.wait() for p in procs): sys.exit(f'渲染出错，看 {out}/渲染日志_*.txt')
for o, d, fp_path, new in plan:
    json.dump(new, open(fp_path, 'w'))
    open(f'{out}/{d}/concat.txt', 'w').write('\n'.join(f"file '镜头MP4/{k}.mp4'" for k in new))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', f'{out}/{d}/concat.txt', '-c', 'copy', f'{out}/{d}/{name}_整期预览_{d}.mp4'], check=True)

# 5. 合成（make_segment 的合成段）
env = dict(os.environ, SKIP_RENDER='1', ONLY=ORI)
r = subprocess.run([sys.executable, f'{here}/make_segment.py', '07', chunks, out], env=env, capture_output=True, text=True)
if r.returncode: sys.exit(r.stderr[-800:])
for o, d in (('h', '横版'), ('v', '竖版')):
    if o not in ORI: continue
    os.replace(f'{out}/第07期_试制段_{d}.mp4', f'{out}/{title}_{d}.mp4')
    # 6. 审片小样
    w = 216 if o == 'v' else 384
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{out}/{title}_{d}.mp4', '-vf', f'fps=1/2,scale={w}:-1,tile=10x{max(1, int(spec["total"] / 20) + 1)}', '-frames:v', '1', f'{out}/审片_{d}.jpg'], check=True)
    print(f'成片：{out}/{title}_{d}.mp4  审片小样：{out}/审片_{d}.jpg')
print('总时长', round(spec['total'], 1), '秒')
