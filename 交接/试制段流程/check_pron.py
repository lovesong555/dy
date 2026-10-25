#!/usr/bin/env python3
"""配音前的读音检查：机器配音（edge-tts 等）容易读错的词、数字编号。

用法：python3 交接/试制段流程/check_pron.py <chunks.json>
- 只检查真正会进配音的文字（有 tts 字段就查 tts，否则查 vo）。
- 发现风险词就打印“第几句 / 哪个词 / 建议”，退出码 1；全部通过退出码 0。
- 已经确认没问题的，在那一句里加 "pron_ok": ["词1", "词2"] 跳过。

词表来源：本项目实际听出来的错误（同行）+ 常见多音字里机器配音容易读错的词。新发现的错误直接加进 RISK。
"""
import json, re, sys

# 词 → 建议。原则：能换词就换词（换成没有歧义的说法），换不了就在 tts 字段里写成同音字。
RISK = {
    '同行': '机器常读成 tóngxíng。改成“竞争对手 / 其他品牌 / 同类公司”',
    '一只': '“只”可能读成 zhǐ。量词改成“一个”',
    '这只': '同上，改成“这个”', '那只': '同上，改成“那个”',
    '少年': '“少”可能读成 shǎo。换说法，或 tts 里写成“哨年”',
    '重新': '确认读 chóng', '重复': '确认读 chóng',
    '还钱': '确认读 huán', '还款': '确认读 huán', '归还': '确认读 huán',
    '便宜': '确认读 pián', '自传': '确认读 zhuàn', '传记': '确认读 zhuàn',
    '差点': '确认读 chà', '差不多': '确认读 chà', '出差': '确认读 chāi',
    '调查': '确认读 diào', '调研': '确认读 diào', '单调': '确认读 diào',
    '着急': '确认读 zháo', '着火': '确认读 zháo', '睡着': '确认读 zháo',
    '朝阳': '地名读 cháo', '长大': '确认读 zhǎng', '行长': '确认读 háng zhǎng',
    '似的': '确认读 shì', '记载': '确认读 zǎi', '模样': '确认读 mú',
    '处理': '确认读 chǔ', '空闲': '确认读 kòng', '尽管': '确认读 jǐn',
    '曾子': '姓读 zēng', '单于': '读 chán', '仇': '姓读 qiú',
    '银行': '一般能读对，听一遍确认 háng', '行业': '一般能读对，听一遍确认 háng',
    '薄': '确认 báo / bó', '露': '确认 lù / lòu',
}
# 姓名、品牌：机器常按普通词读，第一次出现时提醒听一遍
NAMES = ['李彦', '胡依林', '曾', '单', '解', '查', '仇', '朴', '区', '盖', '乐']

def check(path):
    C = json.load(open(path))
    if isinstance(C, dict): C = C['chunks']
    bad = 0
    for i, c in enumerate(C, 1):
        t = c.get('tts', c['vo']); ok = set(c.get('pron_ok', []))
        for w, tip in RISK.items():
            if w in t and w not in ok:
                print(f'第{i:02d}句 「{w}」 {tip}'); bad += 1
        # 4 位以上的数字编号（不是年份、金额）：要按位读就写 tts
        for m in re.finditer(r'(?<![\d.])\d{4,}(?![\d.]*(年|万|亿|元|辆|台|吨|人|%|米|公里|美元))', t):
            if m.group() not in ok:
                print(f'第{i:02d}句 「{m.group()}」 数字编号？要按位读，就在 tts 里写成汉字（如 18650 → 一八六五零）'); bad += 1
    print('读音检查：' + ('通过' if not bad else f'{bad} 处需要处理（改词，或确认后写进 pron_ok）'))
    return bad

if __name__ == '__main__':
    sys.exit(1 if check(sys.argv[1]) else 0)
