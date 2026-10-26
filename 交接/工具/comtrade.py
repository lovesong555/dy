# 用法: python3 comtrade.py <报告国代码> <M进口|X出口> <YYYYMM>...  例: python3 comtrade.py 699 M 202601 202602   (699=印度, 156=中国; HS 281410=液氨, 改 cmdCode 换商品)
# 联合国 Comtrade 公开预览接口, 免注册; 中国(156)的月度数据常为空, 要改查中国海关或用对方国镜像数据
import json,urllib.request,time,sys
NAMES={0:'全球',512:'阿曼',360:'印尼',682:'沙特',634:'卡塔尔',156:'中国',458:'马来西亚',410:'韩国',764:'泰国',842:'美国',804:'乌克兰',792:'土耳其',826:'英国',48:'巴林',414:'科威特',784:'阿联酋',364:'伊朗',699:'印度',392:'日本',504:'摩洛哥',704:'越南',643:'俄罗斯',818:'埃及',586:'巴基斯坦',144:'斯里兰卡',50:'孟加拉',608:'菲律宾',36:'澳大利亚',124:'加拿大',528:'荷兰',76:'巴西',600:'巴拉圭',170:'哥伦比亚',490:'台湾'}
def get(rep,flow,p):
    u=f"https://comtradeapi.un.org/public/v1/preview/C/M/HS?reporterCode={rep}&period={p}&cmdCode=281410&flowCode={flow}"
    for _ in range(3):
        try: return json.load(urllib.request.urlopen(u,timeout=40)).get('data',[])
        except Exception as e: time.sleep(3)
    return None
out={}
rep,flow=int(sys.argv[1]),sys.argv[2]
for p in sys.argv[3:]:
    rows=get(rep,flow,p)
    if rows is None: print(p,'ERR');continue
    r=sorted([(NAMES.get(x['partnerCode'],x['partnerCode']),round((x.get('netWgt') or 0)/1000),round(x.get('primaryValue') or 0)) for x in rows],key=lambda z:-z[1])
    out[p]=r
    tot=[z for z in r if z[0]=='全球']
    print(p, '|', '; '.join(f"{a} {b}t ${c/1e6:.1f}M" for a,b,c in r[:9]), '| 单价', (round(tot[0][2]/tot[0][1]) if tot and tot[0][1] else '-'))
    time.sleep(1.5)
json.dump(out,open(f'ct_{rep}_{flow}.json','w'),ensure_ascii=False)
