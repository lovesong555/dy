import sys, os, json, time
from faster_whisper import WhisperModel
import subprocess, numpy as np
try:
    import opencc
except ImportError:
    import opencc as opencc
def load(f):
    b=subprocess.run(['ffmpeg','-loglevel','error','-i',f,'-f','s16le','-ac','1','-ar','16000','-'],capture_output=True,check=True).stdout
    return np.frombuffer(b,np.int16).astype(np.float32)/32768.0
cc=opencc.OpenCC('t2s')
model_dir, = sys.argv[1:2]
files=sys.argv[2:]
m=WhisperModel(model_dir,device='cpu',compute_type='int8',cpu_threads=4)
for f in files:
    out=os.path.join(os.path.dirname(f),'asr.json')
    if os.path.exists(out): continue
    t=time.time()
    segs,info=m.transcribe(load(f),language='zh',beam_size=1,vad_filter=True,
        initial_prompt='以下是普通话的财经视频口播，使用简体中文和标点符号。',condition_on_previous_text=False)
    res=[{'s':round(s.start,1),'e':round(s.end,1),'t':cc.convert(s.text.strip())} for s in segs]
    json.dump(res,open(out,'w'),ensure_ascii=False)
    print('done',f,info.duration,round(time.time()-t),flush=True)
