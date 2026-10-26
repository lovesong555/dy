import re,os,glob,csv,subprocess,sys
from PIL import Image
SP='/tmp/claude-0/-home-user-dy/12422577-561d-516a-aacf-b65a94764a7f/scratchpad'
OUT=sys.argv[1]  # repo dir
DOC=SP+'/doc'; CH=SP+'/charts/out3'; HERO=SP+'/charts/heroout'
TAIL=[n for n in ('89_reasoning','90_dynamic_guide','91_format','94_huxiu','94b_huxiu_visual','92_footage','93_people','95_github','99_appendix') if os.path.exists(f'{DOC}/{n}.md')]
parts=[open(f'{DOC}/00_intro.md').read()]+[open(f'{DOC}/ep{i}.md').read() for i in range(1,9)]+[open(f'{DOC}/{n}.md').read() for n in TAIL]
md='\n\n'.join(parts)
# thumbnails for docx
TH=SP+'/build/thumb'; os.makedirs(TH,exist_ok=True)
def charts(n,mode):
    fs=sorted(glob.glob(f'{HERO}/横版/{n}_H0_*_横版.png'))+sorted(glob.glob(f'{CH}/横版/{n}_*_横版.png'))
    out=[]
    for f in fs:
        base=os.path.basename(f).replace('_横版.png','')
        code=base.split('_')[1]
        if mode=='md':
            sub='图表/主视觉/横版/' if '_H0_' in base else '图表/横版/'
            out.append(f'![]({sub+os.path.basename(f)})\n\n**▲ 图{n}-{code}** `{base}`\n')
        else:
            t=f'{TH}/{n}_{code}.jpg'
            if not os.path.exists(t) or os.path.getmtime(t)<os.path.getmtime(f):
                Image.open(f).convert('RGB').resize((1280,720)).save(t,quality=82)
            out.append(f'![]({t}){{width=15.5cm}}\n\n**▲ 图{n}-{code}** `{base}`\n')
    return '\n'.join(out)
md_repo=re.sub(r'\{\{CHARTS:(\d\d)\}\}',lambda m:charts(m.group(1),'md'),md)
md_doc=re.sub(r'\{\{CHARTS:(\d\d)\}\}',lambda m:charts(m.group(1),'doc'),md)
open(f'{OUT}/抖音中视频制作手册_v4.md','w').write(md_repo)
PB='\n```{=openxml}\n<w:p><w:r><w:br w:type="page"/></w:r></w:p>\n```\n'
md_doc=re.sub(r'(?m)^# (?!v4 改了什么)',PB+'# ',md_doc)
md_doc=re.sub(r'<(https?://[^>]+)>',lambda m:'[打开↗]('+m.group(1)+')',md_doc)
open(f'{SP}/build/doc.md','w').write(md_doc)
# CSV of links
rows=[]
ep=None
for line in md.splitlines():
    m=re.match(r'# 第(\d\d)期',line)
    if m: ep=m.group(1)
    m=re.match(r'\|\s*([SVP]\d-\d+)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|(?:\s*(.*?)\s*\|)?\s*$',line)
    if m and ep:
        links=re.findall(r'<(https?://[^>]+)>',m.group(3))
        kind={'S':'事实来源','V':'视频','P':'图片'}[m.group(1)[0]]
        rows.append([ep,kind,m.group(1),m.group(2),' ; '.join(links) or m.group(3),m.group(4) or ''])
with open(f'{OUT}/素材链接总表.csv','w',newline='',encoding='utf-8-sig') as f:
    w=csv.writer(f);w.writerow(['期数','类型','编号','内容','链接','授权/备注']);w.writerows(rows)
print('rows',len(rows))
