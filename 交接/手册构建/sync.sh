set -e
S=/tmp/claude-0/-home-user-dy/12422577-561d-516a-aacf-b65a94764a7f/scratchpad; R=/home/user/dy
for d in 竖版 横版 动画_竖版 动画_横版 首尾帧; do mkdir -p $S/charts/out3/$d; cp $S/charts/hxout/$d/* $S/charts/out3/$d/ 2>/dev/null || true; done
for d in 绿幕_竖版 绿幕_横版; do mkdir -p $S/charts/out3/$d; cp $S/charts/out2/$d/* $S/charts/out3/$d/; done
cd $S/build && rm -rf thumb && python3 build.py $R
LANG=C.UTF-8 pandoc doc.md -o out.docx --reference-doc=ref.docx --toc --toc-depth=1 -M toc-title=目录
python3 post.py out.docx $R/抖音中视频制作手册_v4.docx
rm -f $R/六期抖音中视频_制作手册.docx $R/六期抖音中视频_制作手册.md $R/抖音中视频制作手册_v3.docx $R/抖音中视频制作手册_v3.md
for d in 竖版 横版 动画_竖版 动画_横版 首尾帧 绿幕_竖版 绿幕_横版; do mkdir -p $R/图表/$d; cp -u $S/charts/out3/$d/* $R/图表/$d/ 2>/dev/null || true; done
mkdir -p $R/图表/主视觉; cp -ru $S/charts/heroout/. $R/图表/主视觉/
cp $S/charts/chout2/* $R/章节条/
cp -u $S/charts/src/*.html $S/charts/src/*.js $S/charts/src/*.css $S/charts/src/chapters.json $R/图表源码/ 2>/dev/null || true
mkdir -p $R/图表源码/photos; cp -u $S/charts/src/photos/* $R/图表源码/photos/
cp $S/research/people_topics.md $R/研究记录/人物选题研究.md
cp $S/research/deep_ep1-3.md $R/研究记录/申论深挖_第01-03期.md
cp $S/research/deep_ep4-6.md $R/研究记录/申论深挖_第04-06期.md
cp $S/research/footage.md $R/研究记录/视频素材清单.md
mkdir -p $R/研究记录/博主学习/形式研究
cp $S/learn/C/format_report.md $R/研究记录/博主学习/形式研究/形式研究报告.md
for d in $S/learn/C/*/; do n=$(basename $d); mkdir -p $R/研究记录/博主学习/形式研究/$n; cp $d/frames_sheet.png $R/研究记录/博主学习/形式研究/$n/ 2>/dev/null || true; done
if [ -d $S/learn/Huxiu ]; then mkdir -p $R/研究记录/博主学习/虎嗅; cp $S/learn/Huxiu/*.md $R/研究记录/博主学习/虎嗅/ 2>/dev/null || true; find $S/learn/Huxiu -name '*sheet*.png' -o -name '*transcript*' -o -name '*.txt' | while read f; do b=$(basename $(dirname $f)); mkdir -p $R/研究记录/博主学习/虎嗅/$b; cp $f $R/研究记录/博主学习/虎嗅/$b/; done; fi
echo synced
mkdir -p $R/图表/证据截图; cp -ru $S/charts/evout/. $R/图表/证据截图/
cp $S/charts/*.mjs $R/图表源码/; rm -f $R/图表源码/_sec13d.html
mkdir -p $R/图表源码/evidence; cp -u $S/charts/src/evidence/* $R/图表源码/evidence/
echo synced2
mkdir -p $R/研究记录/博主学习/虎嗅画面; cp $S/learn/HuxiuV/*.md $S/learn/HuxiuV/*.png $S/learn/HuxiuV/notes.txt $R/研究记录/博主学习/虎嗅画面/ 2>/dev/null || true
for d in $S/learn/HuxiuV/BV*/; do n=$(basename $d); mkdir -p $R/研究记录/博主学习/虎嗅画面/$n; cp $d/frames_sheet.png $d/meta.json $R/研究记录/博主学习/虎嗅画面/$n/ 2>/dev/null || true; done
if [ -d $S/learn/D ]; then mkdir -p $R/研究记录/博主学习/深度学习_v4; cp $S/learn/D/*.md $R/研究记录/博主学习/深度学习_v4/ 2>/dev/null || true; for d in $S/learn/D/*/; do n=$(basename $d); mkdir -p "$R/研究记录/博主学习/深度学习_v4/$n"; cp "$d"*.md "$R/研究记录/博主学习/深度学习_v4/$n/" 2>/dev/null || true; done; fi
mkdir -p $R/研究记录; cp $S/research/ep8_person.md $R/研究记录/第08期_张茵玖龙研究.md 2>/dev/null || true
cp $S/charts/src/*.otf $S/charts/src/OFL_思源字体授权.txt $R/图表源码/ 2>/dev/null || true
echo synced3
