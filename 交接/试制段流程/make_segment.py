#!/usr/bin/env python3
"""试制段一键流程：口播分句 + 镜头 → 临时配音 → 镜头时长对齐配音 → 渲染 → 字幕 + 音轨合成。

用法（在仓库根目录运行，需要先 ln -s 图表源码 src，并在 图表源码/ 里起好 http.server 8765）：
  python3 交接/试制段流程/make_segment.py 08 交接/试制段流程/08_chunks.json 样片/08试制段

依赖：pip install edge-tts（临时配音用；正式发布请用本人配音，或剪映自带的“文本朗读”）、ffmpeg（需带 libass）、Node + Playwright。
chunks.json 格式：[{"vo": "这一句口播", "scene": {...一个镜头，格式同 scenes/*.json...}}, ...]
"""
import json, os, re, subprocess, sys
ep, chunks_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out, exist_ok=True)
C = json.load(open(chunks_path))
VOICE = os.environ.get('TTS_VOICE', 'zh-CN-YunyangNeural'); RATE = os.environ.get('TTS_RATE', '+6%'); GAP = 0.45
def dur(f): return float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f],capture_output=True,text=True).stdout)
for i, c in enumerate(C, 1):
    mp3, srt = f'{out}/vo{i:02d}.mp3', f'{out}/vo{i:02d}.srt'
    txt_cache = f'{out}/vo{i:02d}.txt'
    # 口播改了就重新生成配音和字幕：用缓存的文字比对，避免“新字幕 + 旧声音”
    if os.path.exists(mp3) and (not os.path.exists(txt_cache) or open(txt_cache).read() != c['vo']):
        os.remove(mp3)
    if not os.path.exists(mp3):
        open(txt_cache, 'w').write(c['vo'])
        subprocess.run(['edge-tts','--voice',VOICE,f'--rate={RATE}','--text',c['vo'],'--write-media',mp3,'--write-subtitles',srt],check=True)
    c['dur'] = dur(mp3)
# 镜头时长 = 这句配音 + 停顿
scenes = []
for c in C:
    s = dict(c['scene']); s['d'] = round(c['dur'] + GAP, 2); scenes.append(s)
name = f'{ep}seg'
json.dump({"brand": f"商业档案 No.{ep}", "scenes": scenes}, open(f'src/scenes/{name}.json','w'), ensure_ascii=False, indent=0)
subprocess.run(['node','图表源码/渲染脚本/render_scene.mjs',name,out,'hv'],check=True)
# 音轨 + 字幕
def ts(x): return f"{int(x//3600)}:{int(x%3600//60):02d}:{x%60:05.2f}"
parts, events, t0 = [], [], 0.0
for i, c in enumerate(C, 1):
    d = round((c['dur'] + GAP) * 30) / 30
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'{out}/vo{i:02d}.mp3','-af',f'apad=whole_dur={d}','-ar','48000','-ac','2',f'{out}/pad{i:02d}.wav'],check=True)
    parts.append(f"file 'pad{i:02d}.wav'")
    for blk in open(f'{out}/vo{i:02d}.srt').read().strip().split('\n\n'):
        L = blk.split('\n'); a, b = L[1].split(' --> '); txt = ''.join(L[2:])
        f = lambda z: int(z[:2])*3600 + int(z[3:5])*60 + float(z[6:].replace(',','.'))
        sa, sb = f(a), f(b); merged, cur = [], ''
        for p in [p for p in re.split(r'(?<=[，。：；？！、])', txt) if p.strip()]:
            if len(cur) + len(p) <= 15: cur += p
            else:
                if cur: merged.append(cur)
                cur = p
        if cur: merged.append(cur)
        tot = sum(len(m) for m in merged); x = sa
        for m in merged:
            dd = (sb - sa) * len(m) / tot; events.append((t0 + x, t0 + x + dd, m.rstrip('，。；：、'))); x += dd
    t0 += d
open(f'{out}/audio.txt','w').write('\n'.join(parts))
subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',f'{out}/audio.txt','-c:a','pcm_s16le',f'{out}/vo_all.wav'],check=True)
for k, (W, H, fs, mv, d) in {'h': (1920,1080,58,70,'横版'), 'v': (1080,1920,62,400,'竖版')}.items():
    hdr = f"[Script Info]\nScriptType: v4.00+\nPlayResX: {W}\nPlayResY: {H}\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: D,Noto Sans CJK SC,{fs},&H00FFFFFF,&H00FFFFFF,&H00221E1D,&H64000000,-1,0,0,0,100,100,1,0,1,5,0,2,60,60,{mv},1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n"
    open(f'{out}/sub_{k}.ass','w').write(hdr + '\n'.join(f"Dialogue: 0,{ts(a)},{ts(b)},D,,0,0,0,,{t}" for a, b, t in events))
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'{out}/{d}/{name}_整期预览_{d}.mp4','-i',f'{out}/vo_all.wav','-vf',f"ass={out}/sub_{k}.ass:fontsdir=图表源码",'-c:v','libx264','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-shortest',f'{out}/第{ep}期_试制段_{d}.mp4'],check=True)
print('done', round(t0, 1), 's')
