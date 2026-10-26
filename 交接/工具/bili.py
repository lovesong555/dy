import urllib.request, urllib.parse, json, hashlib, time, sys, http.cookiejar, os, ssl
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
cj=http.cookiejar.CookieJar()
ctx=ssl.create_default_context(cafile='/root/.ccr/ca-bundle.crt')
op=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj),urllib.request.HTTPSHandler(context=ctx))
def get(url,raw=False,ref='https://www.bilibili.com/'):
    r=urllib.request.Request(url,headers={'User-Agent':UA,'Referer':ref,'Origin':'https://www.bilibili.com'})
    d=op.open(r,timeout=60).read()
    return d if raw else d.decode('utf-8','replace')
_init=False
def init():
    global _init
    if _init: return
    get('https://www.bilibili.com/')
    try:
        s=json.loads(get('https://api.bilibili.com/x/frontend/finger/spi'))['data']
        for k,v in (('buvid3',s['b_3']),('buvid4',s['b_4'])):
            cj.set_cookie(http.cookiejar.Cookie(0,k,v,None,False,'.bilibili.com',True,True,'/',True,False,None,False,None,None,{}))
    except Exception as e: print('spi fail',e,file=sys.stderr)
    _init=True
MT=[46,47,18,2,53,8,23,32,15,50,10,31,58,3,45,35,27,43,5,49,33,9,42,19,29,28,14,39,12,38,41,13,37,48,7,16,24,55,40,61,26,17,0,1,60,51,30,4,22,25,54,21,56,59,6,63,57,62,11,36,20,34,44,52]
_mk=None
def mixin():
    global _mk
    if _mk: return _mk
    d=json.loads(get('https://api.bilibili.com/x/web-interface/nav'))['data']['wbi_img']
    o=d['img_url'].rsplit('/',1)[1].split('.')[0]+d['sub_url'].rsplit('/',1)[1].split('.')[0]
    _mk=''.join(o[i] for i in MT)[:32]; return _mk
def wbi(base,params):
    init(); p=dict(params); p['wts']=int(time.time())
    p=dict(sorted(p.items())); p={k:''.join(c for c in str(v) if c not in "!'()*") for k,v in p.items()}
    q=urllib.parse.urlencode(p); p['w_rid']=hashlib.md5((q+mixin()).encode()).hexdigest()
    return json.loads(get(base+'?'+urllib.parse.urlencode(p)))
def api(url):
    init(); return json.loads(get(url))
if __name__=='__main__':
    cmd=sys.argv[1]
    if cmd=='search':
        r=wbi('https://api.bilibili.com/x/web-interface/wbi/search/type',{'search_type':'video','keyword':sys.argv[2],'page':sys.argv[3] if len(sys.argv)>3 else 1})
        for v in r.get('data',{}).get('result',[]) or []:
            import re
            print(v['bvid'],v['author'],v['mid'],v['duration'],time.strftime('%Y-%m-%d',time.localtime(v['pubdate'])),v['play'],re.sub('<.*?>','',v['title']))
        if r.get('code'): print(r)
    elif cmd=='user':  # mid, page
        r=wbi('https://api.bilibili.com/x/space/wbi/arc/search',{'mid':sys.argv[2],'ps':50,'pn':sys.argv[3] if len(sys.argv)>3 else 1,'order':'click'})
        if r.get('code'): print(r); sys.exit()
        for v in r['data']['list']['vlist']:
            print(v['bvid'],v['length'],time.strftime('%Y-%m-%d',time.localtime(v['created'])),v['play'],v['title'])
    elif cmd=='view':
        r=wbi('https://api.bilibili.com/x/web-interface/wbi/view',{'bvid':sys.argv[2]})
        d=r.get('data') or r
        print(json.dumps({k:d.get(k) for k in ('bvid','title','duration','pubdate','owner','cid','desc')},ensure_ascii=False))
    elif cmd=='raw':
        print(get(sys.argv[2])[:3000])
def cid_of(bvid):
    r=wbi('https://api.bilibili.com/x/web-interface/wbi/view',{'bvid':bvid}); return r['data']
if __name__=='__main__' and sys.argv[1]=='probe':
    d=cid_of(sys.argv[2]); cid=d['cid']; print(d['title'],d['duration'],cid)
    p=wbi('https://api.bilibili.com/x/player/wbi/v2',{'bvid':sys.argv[2],'cid':cid})
    print('subs',json.dumps(p.get('data',{}).get('subtitle'),ensure_ascii=False)[:500])
    s=api(f'https://api.bilibili.com/x/player/videoshot?bvid={sys.argv[2]}&cid={cid}&index=1')
    print('shot',json.dumps(s.get('data'),ensure_ascii=False)[:400])
    u=wbi('https://api.bilibili.com/x/player/wbi/playurl',{'bvid':sys.argv[2],'cid':cid,'fnval':16})
    a=u.get('data',{}).get('dash',{}).get('audio') or []
    print('audio',[(x['id'],x['bandwidth'],x['baseUrl'][:80]) for x in a], u.get('code'))
