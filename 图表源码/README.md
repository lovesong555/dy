# 图表源码

每个 `0X_Y_名称.html` 对应一张图表，数据直接写在文件里，改数字、改标题后重新导出即可。

## 预览
需要本地起一个服务器（地图要读取 json）：
```bash
cd 图表源码
python3 -m http.server 8765
# 浏览器打开 http://127.0.0.1:8765/02_A_同一台挖掘机两地价格.html?o=v   （o=v 竖版，o=h 横版）
```

## 导出 PNG 和动画 MP4
需要 Node.js、Playwright（Chromium）和 ffmpeg：
```bash
# 保持上面的服务器运行，另开终端
npm i playwright && npx playwright install chromium
node render.mjs . ../图表 --anim 02_A      # 只导出 02_A；不写名称则全部导出
```
`render.mjs` 第3–4行写的是本机 Playwright 的安装路径，换电脑时改成 `import { chromium } from 'playwright'` 即可。

## 字体
图表使用 Noto Sans CJK SC（思源黑体，SIL OFL 开源字体）。为控制仓库体积，字体文件没有放进来，请从
https://github.com/notofonts/noto-cjk/tree/main/Sans/OTF/SimplifiedChinese
下载 `NotoSansCJKsc-Regular/Medium/Bold/Black.otf`，放到本文件夹。

## 文件
- `base.css`：配色与版式（深色视频风）
- `lib.js` / `chartkit.js` / `mapkit.js` / `treekit.js`：柱状、条形、折线、瀑布、环形、地图、卡片等组件，全部支持 0→1 的动画进度
- `d3.min.js`、`topojson.min.js`、`countries-*.json`：D3 与世界地图数据（world-atlas，公有领域数据）
