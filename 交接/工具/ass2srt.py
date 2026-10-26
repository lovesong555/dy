import sys,re
src,dst=sys.argv[1:3];out=[];n=0
def t(x):
    h,m,s=x.split(':');s=float(s);return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s-int(s))*1000)):03d}"
for l in open(src):
    if l.startswith('Dialogue:'):
        p=l.rstrip('\n').split(',',9);n+=1;out.append(f"{n}\n{t(p[1])} --> {t(p[2])}\n{p[9]}\n")
open(dst,'w').write('\n'.join(out))
