import bili,sys,json
bv,out=sys.argv[1:3]
d=bili.wbi('https://api.bilibili.com/x/web-interface/wbi/view',{'bvid':bv})['data']
u=bili.wbi('https://api.bilibili.com/x/player/wbi/playurl',{'bvid':bv,'cid':d['cid'],'fnval':16,'qn':80})
vs=sorted(u['data']['dash']['video'],key=lambda x:(x['id'],x['bandwidth']))
v=[x for x in vs if x.get('codecs','').startswith('avc')][-1]
open(out,'wb').write(bili.get(v['baseUrl'],raw=True))
print(bv,d['title'],d['owner']['name'],v['width'],v['height'],d['duration'],d['pubdate'])
