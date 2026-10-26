# 赛璐璐（cel-shading）人像处理：抠像 → 平涂色块 → 墨线描边 → 白色外描边；同时输出纯剪影版
# 用法：python cel.py 输入.jpg 输出前缀 [x0 y0 x1 y1 裁切框]
import sys, numpy as np, cv2
from rembg import remove, new_session
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
img = cv2.imread(src)
if len(sys.argv) > 3:
    x0,y0,x1,y1 = map(int, sys.argv[3:7]); img = img[y0:y1, x0:x1]
img = cv2.resize(img, None, fx=1200/img.shape[1], fy=1200/img.shape[1], interpolation=cv2.INTER_CUBIC)
sess = new_session('u2net_human_seg')
rgba = np.array(remove(Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB)), session=sess))
mask = (rgba[:,:,3] > 128).astype(np.uint8)*255
mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((5,5),np.uint8))
# 平涂：均值漂移得到大色块 → K-means 量化到 5 色（皮肤 2 阶、头发和衣服各 1–2 阶）
sm = cv2.pyrMeanShiftFiltering(img, 18, 36)
for _ in range(2): sm = cv2.bilateralFilter(sm, 9, 50, 50)
Z = sm[mask>0].reshape(-1,3).astype(np.float32)
_, lab, cen = cv2.kmeans(Z, 5, None, (cv2.TERM_CRITERIA_EPS+cv2.TERM_CRITERIA_MAX_ITER, 30, 1.0), 5, cv2.KMEANS_PP_CENTERS)
full = np.zeros(img.shape[:2], np.int32); full[mask>0] = lab.flatten()
full = cv2.medianBlur(full.astype(np.uint8), 9)
flat = cen[full].astype(np.uint8)
hsv = cv2.cvtColor(flat, cv2.COLOR_BGR2HSV).astype(np.float32); hsv[:,:,1]*=0.8; hsv[:,:,2]=np.clip(hsv[:,:,2]*1.06,0,255); flat = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
# 墨线：只描色块边界和五官（平滑图上的 Canny），线宽 2–3px
lines = cv2.Canny(full*50, 20, 60)
g = cv2.GaussianBlur(cv2.cvtColor(sm, cv2.COLOR_BGR2GRAY),(5,5),0)
lines = cv2.bitwise_or(lines, cv2.Canny(g, 40, 110))
lines = cv2.dilate(lines, np.ones((3,3),np.uint8))
cel = flat.copy(); cel[lines>0] = (40,37,42)
# 外描边：白边 + 墨边
outer = cv2.dilate(mask, np.ones((25,25),np.uint8)); ink = cv2.dilate(mask, np.ones((33,33),np.uint8))
res = np.zeros((img.shape[0], img.shape[1], 4), np.uint8)
res[ink>0] = (34,37,42,255); res[outer>0] = (255,255,255,255)
res[mask>0,:3] = cel[mask>0]; res[mask>0,3] = 255
cv2.imwrite(out+'_赛璐璐.png', res)
sil = np.zeros_like(res); sil[ink>0]=(34,37,42,255); sil[outer>0]=(255,255,255,255); sil[mask>0]=(42,37,34,255)
cv2.imwrite(out+'_剪影.png', sil)
print('ok', res.shape)
