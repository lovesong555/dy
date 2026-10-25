#!/usr/bin/env python3
"""配音核对：把成片配音用语音识别转成文字，和稿子逐字比对，只打印有差异的地方。

  <装了 faster-whisper 的 python> 交接/试制段流程/check_asr.py <分镜.json> <配音 wav> <whisper 模型目录>

看结果的方法：
- 同音字（摩 / 魔、锂 / 理）是识别器自己写错，不用管；
- 要管的是：漏读、多读、数字读法不对（18650 读成“一万八千……”）、整个词变了。
- 识别器分不出声调，所以多音字最后还要人耳听一遍。
"""
import json, re, sys, difflib, subprocess
import numpy as np
from faster_whisper import WhisperModel
chunks, wav, model_dir = sys.argv[1:4]
C = json.load(open(chunks)); C = C['chunks'] if isinstance(C, dict) else C
ref = ''.join(c.get('tts', c['vo']) for c in C)
pcm = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', wav, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0
m = WhisperModel(model_dir, device='cpu', compute_type='int8')
segs, _ = m.transcribe(audio, language='zh', beam_size=1, vad_filter=True, initial_prompt='以下是普通话口播，使用简体中文。')
hyp = ''.join(s.text for s in segs)
try:
    import opencc; hyp = opencc.OpenCC('t2s').convert(hyp)
except Exception: pass
norm = lambda s: re.sub(r'[，。：；？！、“”《》\s,.?!:;"%·]', '', s)
r, h = norm(ref), norm(hyp)
sm = difflib.SequenceMatcher(None, r, h, autojunk=False)
n = 0
for op, a, b, c, d in sm.get_opcodes():
    if op != 'equal':
        n += 1; print(f'{op:7s} 稿：{r[max(0, a-5):b+5]}  |  听：{h[max(0, c-5):d+5]}')
print(f'一致度 {sm.ratio():.3f}，差异 {n} 处（同音字可忽略）')
