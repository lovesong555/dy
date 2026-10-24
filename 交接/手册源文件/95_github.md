# GitHub 调研：把博主视频变成文字稿

## 结论

1. **你点名的中文财经、科普博主，GitHub、HuggingFace、Gitee 上都没有现成的文字稿库。** 查过的有巫师财经、小Lin说、半佛仙人、回形针、所长林超、温义飞、罗翔、李永乐、何同学、影视飓风、毕导、星球研究所、柴知道、YJango、差评君、沈帅波、刘润，原因多半是版权。
2. **可行办法是自己转写**：B站音频 + 本地语音识别。这次已经跑通，36 篇文字稿都是这么来的。不需要登录，一期 15 分钟的视频大约 4–5 分钟就能转完。
3. B站官方 CC 字幕要登录才能拿；YouTube 批量抓会被封 IP；抖音接口会被拦，但大多数抖音财经博主都在 B站同步发布，直接用 B站版本即可。

## 推荐工具（按上手难度排序）

| 工具 | 适合谁 | 平台 | 输出 | 一句话用法 |
|---|---|---|---|---|
| [BiliNote](https://github.com/JefferyHcool/BiliNote)（⭐7.6k） | 不想碰命令行 | B站、抖音、YouTube、快手、本地 | 结构化 Markdown 笔记，可以插截图 | Docker 启动后打开网页，粘贴视频链接 |
| [bili2text](https://github.com/lanbinleo/bili2text)（⭐2k） | 批量转 B站 | B站 | 文字稿 | `bili2text tx "<B站链接>"`；批量用 `batch --file 链接清单.txt` |
| [VideoCaptioner](https://github.com/WEIFENG2333/VideoCaptioner)（⭐16k） | 本地视频、要字幕文件 | 本地、YouTube、B站 | srt / txt | `videocaptioner transcribe 视频.mp4` |
| [bilibili2text](https://github.com/KKKZOZ/bilibili2text) | 想直接要 Markdown | B站、YouTube、播客 | Markdown / PDF | `b2t "<B站链接>"` |
| [BiliBiliDecoder](https://github.com/Zhz2025/BiliBiliDecoder) | 按 UP 主整批下 | B站（整个空间） | .srt + .md | 在 list.txt 里放 UP 主空间链接（需要自己的 cookie） |
| [video-subtitle-extractor](https://github.com/YaoFANGUK/video-subtitle-extractor)（⭐9.6k） | 抖音这类字幕直接压在画面上的视频 | 本地视频 | srt | OCR 识别画面字幕，比语音识别更准 |
| [Douyin_TikTok_Download_API](https://github.com/Evil0ctal/Douyin_TikTok_Download_API)（⭐21k） | 下载抖音原片 | 抖音、TikTok、B站 | 视频 | 自己部署后调接口；下载后再交给上面的工具转写 |
| [bilibili-subtitle（vCaptions）](https://github.com/IndieKKY/bilibili-subtitle) | 已经登录 B站 | B站（浏览器插件） | 多种格式 | 装 Chrome 插件，在视频页右侧一键导出字幕 |
| [faster-whisper](https://github.com/SYSTRAN/faster-whisper) / [FunASR](https://github.com/modelscope/FunASR) | 想自己写脚本 | 本地音频 | 需要自己写 | 中文效果 FunASR / SenseVoice 更好 |

## 现成语料（不是你点名的博主，但可以参考）

| 语料 | 内容 | 用途 |
|---|---|---|
| [lizheng-open-context](https://github.com/sunyuzheng/lizheng-open-context) | 商业 / 增长博主“立正”的 400 多份视频字幕，CC BY 授权 | 学商业类口播 |
| [HF aipgpt/douyin_style](https://huggingface.co/datasets/aipgpt/douyin_style) | 严伯钧、EyeOpener、多多喂：“原稿 → 抖音风改写”配对，1,475 条 | 学同一内容怎么改写成抖音口吻 |
| [HF wencan2024/bilibili-masterpieces](https://huggingface.co/datasets/wencan2024/bilibili-masterpieces) | B站 1.1 万个代表作的标题、简介、播放量 | 学标题 |

## 你以后自己扩充学习库的步骤

1. 在浏览器打开博主的 B站空间，从地址栏抄下 mid。
2. 用 bili2text 或 BiliNote 批量转写，每位博主挑 5–10 期产业链或商业主题。
3. 文字稿放进 `研究记录/博主学习/<博主>/`。
4. 让 Claude 读完后更新 `.claude/skills/douyin-midvideo-script/SKILL.md`。
