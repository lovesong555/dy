# 视频转文字稿工具与博主文案语料：GitHub / HuggingFace / Gitee 调研 + 本环境实测

调研日期：2026-10-23。star 数取自 shields.io 的 GitHub 徽章接口（会四舍五入，如 7.6k）。“最近更新”取自 `git clone --depth 1` 后最新一次提交的日期。表格中的仓库我都实际 clone 过或读过 README；没打开过的标“未验证”。

> 本环境的访问限制：github.com 网页和 api.github.com 都返回 403（会话只绑定了指定仓库），但 **`git clone` 和 `raw.githubusercontent.com` 都能用**。Gitee 的 API 连接被 reset，没法搜索。HuggingFace 的 API 和下载都能用。

---

## C. 本环境实测（最重要的部分）

### C1. B站：不登录，只用 curl 就能拿到“音频 + 关键帧拼图 + UP主合集列表”

测试用的 UA 和 Referer：
```bash
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
R="https://www.bilibili.com"
```

| 接口 | curl 结果 | 说明 |
|---|---|---|
| `x/web-interface/view?bvid=` | ❌ 412，返回 HTML 风控页 | 和你遇到的一样 |
| `x/web-interface/search/type` | ❌ 412 | 搜索走不通 |
| `x/space/wbi/arc/search`（UP主全部投稿，已做 WBI 签名） | ❌ 412 | 走不通 |
| **`x/player/pagelist?bvid=`** | ✅ code 0 | 能拿到 cid、分P标题、时长 |
| **`x/player/videoshot?bvid=&index=1`** | ✅ code 0 | 返回关键帧拼图 jpg，新视频每张 10×10 帧、每帧 480×270，图上能看清画面和烧录的字幕 |
| **`x/player/playurl?bvid=&cid=&fnval=16`** | ✅ code 0 | 返回 DASH 音频（30216/30232/30280）和视频（360P/480P）流地址 |
| 下载音频 m4s | ✅ | **主地址 `upos-sz-mirrorcosov.bilivideo.com` 很慢，会断流（约 40KB/s，curl 报 18/92 错误）；`backupUrl` 里的 `upos-hz-mirrorakam.akamaized.net` 只用 1 秒就下完 5.4MB**，所以优先用 akamaized |
| `x/player/v2` 或 `x/player/wbi/v2`（CC/AI 字幕） | ⚠️ code 0，但 `need_login_subtitle: true`，`subtitles: []` | **不登录拿不到字幕**，只能下音频自己转写 |
| **`x/web-interface/card?mid=`** | ✅ | 返回 UP主名、粉丝数、投稿数 |
| **`x/polymer/web-space/seasons_series_list?mid=`** | ✅ | 列出 UP主的全部合集和系列 |
| **`x/polymer/web-space/seasons_archives_list?mid=&season_id=`** | ✅ | 合集里的 bvid、标题、时长 |
| **`x/series/archives?mid=&series_id=`** | ✅ | 系列里的 bvid、标题、时长 |

**已用 card 接口核对过的 mid**（可以直接拿来列合集）：

| UP主 | mid | 粉丝 | 投稿 | 可列出的合集/系列（节选） |
|---|---|---|---|---|
| 小Lin说 | 520819684 | 757万 | 199 | 商业分析 33、宏观经济 40、财经大事件 21、硬核干货 43、随便聊聊 21 |
| 巫师财经 | 472747194 | 441万 | 133 | 宏观&行业&公司 36、明星与资本 17 |
| 所长林超 | 520155988 | 362万 | 130 | 宏观 39、商业原理 12、行业预测 20、政策解读 18、中国创新 18、代表作 7 等 |
| 硬核的半佛仙人 | 37663924 | 771万 | 580 | 我爱这个魔幻的世界 22、社会毒打爱好者 13、互联网B面 9 |
| 罗翔说刑法 | 517327498 | 3219万 | 505 | 经典领读 22、读评论 12、古代刑法 7 等 |
| 李永乐老师官方 | 9458053 | 349万 | 673 | — |
| 毕导 | 254463269 | 842万 | 176 | — |
| 老师好我叫何同学 | 163637592 | 1305万 | 101 | — |
| 影视飓风 | 946974 | 1873万 | 951 | — |
| 极客湾Geekerwan | 25876945 | 562万 | 645 | — |

（我猜测的“回形针 258150656”和“星球研究所 99157282”都不对，查到的是别的账号。温义飞、沈帅波、柴知道、差评君的 mid 还没核对，在浏览器打开 UP 主空间页，从 URL 里抄下来就行。）

**完整可行的命令（实测已跑通）：**
```bash
# 1) 列出 UP主合集（以所长林超「宏观」系列为例）
curl -s -A "$UA" -e "$R" "https://api.bilibili.com/x/polymer/web-space/seasons_series_list?mid=520155988&page_num=1&page_size=20"
curl -s -A "$UA" -e "$R" "https://api.bilibili.com/x/series/archives?mid=520155988&series_id=3180816&pn=1&ps=100"
curl -s -A "$UA" -e "$R" "https://api.bilibili.com/x/polymer/web-space/seasons_archives_list?mid=520819684&season_id=373688&page_num=1&page_size=100"

# 2) 单个视频：音频 + 关键帧拼图 + meta（脚本只用标准库）
python3 -I /tmp/claude-0/-home-user-dy/12422577-561d-516a-aacf-b65a94764a7f/scratchpad/learn/scripts/bili_fetch.py BV1MY411v7bG <输出目录>
#   实测：13 分钟视频的音频 4.05MB，加上 2 张拼图（4800×2700），共用 11 秒

# 3) 转写（推荐 SenseVoice，HuggingFace 下载 int8 ONNX 模型 239MB）
python3 -m venv fwenv && fwenv/bin/pip install sherpa-onnx numpy
curl -L -o sv/model.int8.onnx https://huggingface.co/csukuangfj/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17/resolve/main/model.int8.onnx
curl -L -o sv/tokens.txt     https://huggingface.co/csukuangfj/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17/resolve/main/tokens.txt
curl -L -o silero_vad.onnx   https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/silero_vad.onnx
fwenv/bin/python -I /tmp/claude-0/-home-user-dy/12422577-561d-516a-aacf-b65a94764a7f/scratchpad/learn/scripts/sv_transcribe.py <音频.m4a> <输出.txt> <模型目录>
```

**转写引擎对比（4 核 CPU，罗翔视频 BV1Rin4zNEyU）：**

| 引擎 | 速度 | 质量（前几句） |
|---|---|---|
| SenseVoice int8（sherpa-onnx + silero VAD） | 11 分 09 秒的音频用 189 秒，**约 3.5 倍实时** | 带标点，ITN 正常；“认识错误”“张三”“走私毒品罪”都识别对了；少数错字，比如“强奸要蓄水”实为“强奸既遂” |
| faster-whisper small int8 | 120 秒音频用 97 秒，约 1.2 倍实时 | 没有标点；“认识筹务”“张山”“走势毒品罪”等错字更多 |

注意：本环境的 faster-whisper 1.2.1 和新版 PyAV 不兼容，会报 `open() got an unexpected keyword argument 'metadata_errors'`。解决办法是先用 ffmpeg 把音频解码成 numpy 数组再传进去，`learn/scripts/fw_test.py` 已经这样改好了。

结论：**本环境可以批量跑 “合集列表 → bvid → 音频（akamai 备用地址）→ SenseVoice 转写”，外加 videoshot 拼图来学画面形式。** 按 3.5 倍实时估算，一个 15 分钟的视频大约要 4–5 分钟 CPU 时间。

### C2. YouTube
- `youtube-transcript-api` 第一次请求成功（dQw4w9WgXcQ，61 条字幕），**几秒之后就被封 IP（RequestBlocked / IpBlocked）**，所以不可靠。
- `curl https://www.youtube.com/@xiao_lin_shuo/videos` 能拿到页面，解析出 channelId `UCilwQlk62k1z7aUEZPOB6yw` 和 30 个 videoId，但 RSS feed 是空的。
- 结论：YouTube 只能偶尔拿到一两条，**批量走不通**。

### C3. GitHub、HuggingFace 语料能不能下载
- `git clone --depth 1`：✅（lizheng-open-context 有 157MB，几十秒）。`--filter=blob:none --sparse`：✅。
- `raw.githubusercontent.com/<owner>/<repo>/<branch>/<path>`：✅ 200。
- api.github.com 和 github.com 网页：❌ 403。star 数改用 `https://img.shields.io/github/stars/<owner>/<repo>.json` 来查 ✅。
- HuggingFace `https://huggingface.co/api/datasets?search=` 和 `/resolve/main/<file>`：✅。gated 数据集（Jannchie、tiagozip、Emilia）要登录。
- Gitee API：❌（connection reset）。

---

## A. 视频原声转文字稿的开源项目（按实用性排序）

| # | 仓库 | ⭐ | 最近提交 | 平台 | 要不要 cookie | 输出 Markdown | 一句话用法 |
|---|---|---|---|---|---|---|---|
| 1 | [JefferyHcool/BiliNote](https://github.com/JefferyHcool/BiliNote) | 7.6k | 2026-09-01 | B站、YouTube、抖音、快手、本地 | B站字幕要登录态（插件同步浏览器 cookie）；转写音频不需要 | ✅ 结构化 Markdown 笔记，可插截图 | Docker 启动后网页贴链接；转写引擎可选 Fast-Whisper、MLX、Groq、BCut |
| 2 | [lanbinleo/bili2text](https://github.com/lanbinleo/bili2text) | 2k | 2026-06-16 | B站 | 不需要 | 文字稿（txt） | `uv run bili2text tx "<B站链接>"`，批量用 `batch --file sources.txt`；引擎可选 Whisper、SenseVoice、火山 |
| 3 | [WEIFENG2333/VideoCaptioner](https://github.com/WEIFENG2333/VideoCaptioner) | 16k | 2026-05-24 | YouTube、B站下载，本地 | 一般不需要 | srt/ass/txt | `pip install videocaptioner`，然后 `videocaptioner transcribe x.mp4`；有 faster-whisper 和免费的必剪/剪映接口，自带 Claude Code skill |
| 4 | [KKKZOZ/bilibili2text](https://github.com/KKKZOZ/bilibili2text) | 100 | 2026-09-29 | B站、YouTube、小宇宙、喜马拉雅、本地 | B站字幕要 cookie，ASR 兜底不需要 | ✅ Markdown/TXT/PDF/HTML | `uv run b2t "<B站链接>"`；ASR 用 Groq 或 DashScope（云端） |
| 5 | [Zhz2025/BiliBiliDecoder](https://github.com/Zhz2025/BiliBiliDecoder) | 5 | 2026-10-04 | B站（按 UP 主空间批量）、本地 | 现成字幕**必须** SESSDATA；没有字幕时回退 FunASR | ✅ .srt + .md（附简介） | `list.txt` 里写 UP 主空间链接，执行 `python -m bilibili_decoder video <url> --cookie-file cookie.txt`，输出按 UP 主分文件夹 |
| 6 | [inside-ziwu/video-transcript](https://github.com/inside-ziwu/video-transcript) | 0（fork 自 Backtthefuture/video-transcript，原仓库未验证） | 2026-10-04 | B站、抖音、小红书、YouTube、视频号、播客、本地 | 不需要（视频号需要元宝） | ✅ 整理稿 / PDF | Agent Skill；本地 FunASR，不用 API key |
| 7 | [Luo4507/video-to-text](https://github.com/Luo4507/video-to-text) | 0 | 2026-09-28 | 抖音、B站、YouTube、快手 | 不需要（抖音靠无头 Chromium 抓直链） | txt（带时间轴和纯文本两版） | `python scripts/video_to_text.py "<链接>" out --model small`（faster-whisper） |
| 8 | [cc1415926/shared-video-transcriber](https://github.com/cc1415926/shared-video-transcriber) | 0 | 2026-10-21 | 抖音、B站、YouTube、TikTok、本地 | 不需要 | 时间戳文字稿、SRT、摘要，**最多 24 张抽样截图** | 本地 FastAPI 网页，贴链接就能用；也提供 MCP |
| 9 | [YaoFANGUK/video-subtitle-extractor](https://github.com/YaoFANGUK/video-subtitle-extractor) | 9.6k | 2026-04-09 | 本地视频（硬字幕 OCR） | 不需要 | srt | 识别画面里烧录的字幕；对抖音这类“字幕压在画面上”的视频，比 ASR 更准 |
| 10 | [SYSTRAN/faster-whisper](https://github.com/SYSTRAN/faster-whisper) | 26k | 2026-10-16 | 本地音频 | — | 需要自己写 | `WhisperModel("small",compute_type="int8").transcribe(...)`；本环境实测可用（要绕开 PyAV 不兼容） |
| 11 | [modelscope/FunASR](https://github.com/modelscope/FunASR) | 21k | 2026-10-23 | 本地音频 | — | 需要自己写 | Paraformer/SenseVoice 中文效果最好；依赖 torch，比较重。本环境改用 sherpa-onnx 版 SenseVoice 已跑通 |
| 12 | [Huanshere/VideoLingo](https://github.com/Huanshere/VideoLingo) | 19k | 2026-10-01 | YouTube（yt-dlp）、本地 | YouTube 可能需要 | srt | 主打翻译和配音，默认 Qwen3-ASR；对“学文案”来说偏重 |
| 13 | [Evil0ctal/Douyin_TikTok_Download_API](https://github.com/Evil0ctal/Douyin_TikTok_Download_API) | 21k | 2026-10-21 | 抖音、TikTok、B站 | 自建时需要（自带身份池） | —（只下载） | `docker compose up` 后调 REST API 拿无水印视频，再接 ASR |
| 14 | [JoeanAmier/TikTokDownloader](https://github.com/JoeanAmier/TikTokDownloader) | 17k | 2026-09-16 | 抖音、TikTok | ✅ 需要 cookie | —（只下载） | `python main.py`，可批量下载账号作品、合集和热榜 |
| 15 | [nilaoda/BBDown](https://github.com/nilaoda/BBDown) | 14k | 2026-05-14 | B站 | 高画质或字幕需要 | 可下载 srt 字幕 | `BBDown <BV> --audio-only` / `--sub-only` |
| 16 | [IndieKKY/bilibili-subtitle](https://github.com/IndieKKY/bilibili-subtitle)（现名 vCaptions） | 1.2k | 2025-11-04 | B站（浏览器扩展） | 用浏览器自己的登录态 | 复制或下载多种格式 | 装 Chrome 扩展后，在视频页右侧面板导出字幕 |
| 17 | [xue1long/bilibili-subtitle-fetch](https://github.com/xue1long/bilibili-subtitle-fetch) | 0 | 2026-10-10 | B站（单视频、空间、收藏夹）、抖音、小红书 | ✅ 需要已登录的 Chrome（Playwright） | SRT 内容写进 .md，带 YAML frontmatter | `python scripts/cli.py --space-url <UP主空间> --asr-fallback` |
| 18 | [jdepoix/youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api) | 8.5k | 2026-10-20 | YouTube | 不需要（但本环境会被封 IP） | 需要自己写 | `YouTubeTranscriptApi().fetch(vid, languages=['zh-Hans'])` |
| 19 | [JimmyLv/BibiGPT-v1](https://github.com/JimmyLv/BibiGPT-v1) | 6.3k | 2026-05-04 | B站、YouTube | — | 总结 | 开源版只做摘要，主要功能已转向商业版 |
| 20 | [Nemo2011/bilibili-api](https://github.com/Nemo2011/bilibili-api) / [SocialSisterYi/bilibili-API-collect](https://github.com/SocialSisterYi/bilibili-API-collect) | 4.2k / 20k | 2026-07-06 / 2026-01-30 | B站 API 的 Python 封装 / 接口文档 | 视接口而定 | — | 自己写爬虫时查接口用（上面 C1 的接口都有文档） |

其他打开过、但不推荐作为首选的：yt-dlp/yt-dlp（200k，B站页面在本环境被风控）、m-bain/whisperX（25k）、modelscope/FunClip（6.4k）、NanmiCoder/MediaCrawler（68k，要登录）、Johnserf-Seed/f2（2.7k）、Ayanaminn/N46Whisper（1.7k，最近提交 2025-02）、caodoris471/self-media-content-base（1，是飞书加“对标博主全量扒取”的 SOP 模板，**正好对应“学对标博主”这个流程，可以参考它的流程设计**）、liunoly-design/Douyin2Text（0，用 f2 + whisper.cpp）、HanHanRin/video-transcript-summary（0）、xiaokeaijqx/VideoNote（48）、Tan-TanZi/bili-subtitle-downloader（4，油猴脚本）、linyiLYi/bilibot（3.1k，最近提交 2024-05，用的是评论数据）。chenqianhe/bilibili-whisper 不存在。

---

## B. 已经整理好的博主文案/字幕语料库

**总体结论：GitHub、HF、Gitee 上都没找到上述中文财经/科普博主（巫师财经、小Lin说、半佛、回形针、林超、温义飞、罗翔、李永乐、何同学、影视飓风、毕导、星球研究所、中科院物理所、柴知道、YJango、差评君、沈帅波、刘润）的现成文案或字幕合集。** 原因多半是版权。能找到的是下面这些“相近替代品”。

| # | URL | 包含的博主/内容 | 数量 | 格式 | 许可 | 最近更新 | 已下载 |
|---|---|---|---|---|---|---|---|
| 1 | [sunyuzheng/lizheng-open-context](https://github.com/sunyuzheng/lizheng-open-context)（⭐151） | **立正**（YouTube 上的华人商业/职业/增长博主）：本人主讲视频字幕 204 份 + 会员视频 215 份 + 对谈原文 364 份 + 课程文字稿 23 份 + 社区帖子 252 篇 | corpus/videos 下 428 个文件 | md（带时间码和 frontmatter） | 本人内容 CC BY 4.0；会员内容用“立正参考使用许可”（只能阅读和引用）；目录 CC0 | 2026-10-16 | ✅ `corpus_github/lizheng-open-context/`（157MB） |
| 2 | [HF aipgpt/douyin_style](https://huggingface.co/datasets/aipgpt/douyin_style) | 抖音博主**严伯钧**（655）、**EyeOpener**（432）、**多多喂**（388）的“原稿 → 博主风格改写”配对 | 1475 条 | jsonl（system/input/output） | MIT | 2025-04-16 | ✅ |
| 3 | [HF aipgpt/douyin_style_v2](https://huggingface.co/datasets/aipgpt/douyin_style_v2) | 同上，过滤后版本 | 837 条 | jsonl | 未声明 | 2025-04-29 | ✅ |
| 4 | [HF ddddavidhe/Bilibili-Videos_13k](https://huggingface.co/datasets/ddddavidhe/Bilibili-Videos_13k) | **罗翔说刑法 437 个 mp4**、阿菜、二老师、小文哥、狙击手麦克、安全警示录等 12 个 UP 主 + 首页，共 12,587 个 720p 视频（**没有文字稿**，但能下载原片来转写或学画面） | 12,587 | mp4 + jsonl（bvid/作者/标题） | 未声明 | 2025-10-11 | 只下了索引 jsonl（`hf_ddddavidhe_Bilibili-Videos_13k_index/`）；全集 717GB，单个视频约 38MB |
| 5 | [HF wencan2024/bilibili-masterpieces](https://huggingface.co/datasets/wencan2024/bilibili-masterpieces) | B站早期知名 UP 主代表作的元数据（标题、简介、分区、播放量），**没有正文** | 11,285 条 | jsonl | CC0 | 2024-08-24 | ✅（适合学标题） |
| 6 | [HF bendavidsteel/douyin](https://huggingface.co/datasets/bendavidsteel/douyin) | 抖音帖子元数据：desc/caption、点赞、播放、作者、话题，共 187 列，**没有口播稿** | 1,133,545 条 | parquet.zstd 分片 | CC BY-NC 4.0 | 2026-01-30 | ❌（太大，可以按需取分片筛财经作者和话题） |
| 7 | [wa3dbk/ScribeSalad](https://github.com/wa3dbk/ScribeSalad)（⭐90） | 英文 YouTube 频道字幕。目录里有 Wendover、PolyMatter、Johnny Harris、Vox、Bloomberg Quicktake 等，**但实测这些 vtt 都是 0 字节空文件**，只有 Kurzgesagt 的 100 个 txt + 100 个 srt 有内容；中文只有 TEDx 3 个和 SteveKaufmann 1 个，也是空的 | 有效文件 200 个 | txt/srt/vtt | README 写的是 open data，“随便用” | 2026-02-22 | ✅ 只保留了 Kurzgesagt（`ScribeSalad/`，2.5MB） |
| 8 | [HF MagicHub/domain-copywriting-generation](https://huggingface.co/datasets/MagicHub/domain-copywriting-generation) | 分领域文案生成示例，包括“金融”财经新闻 | 很少（41KB） | csv | CC BY 4.0 | 2023-08-18 | ✅ |
| 9 | [HF theblackcat102/bilibili_comments_sharegpt](https://huggingface.co/datasets/theblackcat102/bilibili_comments_sharegpt) / [helloollel/chat_dataset_bilibili](https://huggingface.co/datasets/helloollel/chat_dataset_bilibili) | 林亦LYi 的 B站评论区对话（来自 bilibot），**不是视频文案** | — | jsonl | 后者 Apache-2.0 | 2024-05 / 2024-08 | ❌ |
| 10 | [HF Himpq/kwext-bilibili-video-title-annotations](https://huggingface.co/datasets/Himpq/kwext-bilibili-video-title-annotations) | 5,000 个 B站视频标题的关键词标注 | 5,000 | — | 未看 | 2026-09-17 | ❌ |
| 11 | [chris-lovejoy/youtube-titles-and-transcripts](https://github.com/chris-lovejoy/youtube-titles-and-transcripts)（⭐22） | 英文 YouTube 标题 + 字幕 | 17,886（README 自述） | — | 未看 | 2025-05-10 | ❌ |
| 12 | [HF amphion/Emilia-Dataset](https://huggingface.co/datasets/amphion/Emilia-Dataset) | 从视频平台采集的野外语音 + 转写（含中文脱口秀、访谈），**不按博主分** | 很大 | 音频 + json | CC BY 4.0（gated，需要登录） | 2025-02-28 | ❌ 未验证内容 |
| 13 | [wenet-e2e/WenetSpeech](https://github.com/wenet-e2e/WenetSpeech)（⭐638） | 1 万小时中文 ASR 语料（来源包括 YouTube 和播客），转写需要申请 | — | — | 需要申请 | 2026-01-09 | ❌ |
| 14 | [HF Jannchie/bilibili-creator-stats](https://huggingface.co/datasets/Jannchie/bilibili-creator-stats) | B站 UP 主粉丝数统计 | — | parquet | CC BY-NC 4.0（gated） | 2026-10-14 | ❌ |

**各博主的查找结果：** 巫师财经、小Lin说、半佛仙人、回形针PaperClip、所长林超、温义飞、罗翔说刑法（只有 HF 上的 437 个 mp4 原片，没有文字稿）、李永乐、何同学、影视飓风、毕导、星球研究所、二次元的中科院物理所、柴知道、YJango、差评君、沈帅波、刘润：**都没找到现成的文字语料**。“B站/抖音爆款文案数据集”和“中文口播文案语料”：只找到第 2、3 项（抖音风格改写）和第 6 项（抖音元数据），都谈不上是“爆款口播全文”。另外，豆瓣有人提过“十三邀罗翔文字稿放在 GitHub”，但没给出链接，未验证。

---

## 建议路线（按本环境能不能跑通排序）

1. **主路线（已跑通）**：用 card 和 seasons_series_list 列出目标 UP 主的合集和系列，拿到 bvid → 用 `learn/scripts/bili_fetch.py` 下载音频（走 akamai 备用地址）和关键帧拼图 → 用 `learn/scripts/sv_transcribe.py`（SenseVoice）转写。财经类优先：小Lin说的「商业分析 / 宏观经济 / 财经大事件」，所长林超的「宏观 / 行业预测 / 商业原理」，巫师财经的「宏观&行业&公司」。
2. **画面形式**：videoshot 拼图每张 10×10 帧，能直接看出镜头节奏、图表/地图/新闻截图的占比和字幕样式。需要更高清时，playurl 也能给 360P/480P 的视频流。
3. **备用路线**：HF 上的 Bilibili-Videos_13k 原片（罗翔 437 个），HF 下载速度很快。
4. **现成文本**：lizheng-open-context（商业类口播，CC BY）可以直接读；aipgpt/douyin_style 可以用来学“同一内容的抖音博主化改写”。
5. **走不通的**：B站官方字幕（要登录）、YouTube 批量（封 IP）、Gitee 搜索。

## 本次产出的文件
- 语料：`/tmp/claude-0/-home-user-dy/12422577-561d-516a-aacf-b65a94764a7f/scratchpad/learn/corpus_github/`，包括 lizheng-open-context、hf_aipgpt_douyin_style、hf_aipgpt_douyin_style_v2、hf_wencan2024_bilibili-masterpieces、hf_ddddavidhe_Bilibili-Videos_13k_index、hf_MagicHub_domain-copywriting-generation、ScribeSalad（只有 Kurzgesagt）
- 脚本：`/tmp/claude-0/-home-user-dy/12422577-561d-516a-aacf-b65a94764a7f/scratchpad/learn/scripts/`，包括 bili_fetch.py、sv_transcribe.py、fw_test.py
- 样例：`/tmp/claude-0/-home-user-dy/12422577-561d-516a-aacf-b65a94764a7f/scratchpad/learn/samples/`，包括罗翔视频 SenseVoice 全文转写、faster-whisper 前 120 秒、所长林超视频关键帧拼图
- 模型和环境（不在 learn 里）：`/tmp/claude-0/-home-user-dy/12422577-561d-516a-aacf-b65a94764a7f/scratchpad/models/`（SenseVoice int8 + silero_vad），`/tmp/claude-0/-home-user-dy/12422577-561d-516a-aacf-b65a94764a7f/scratchpad/fwenv/`（装有 faster-whisper、sherpa-onnx、youtube-transcript-api 的 venv）
