// 简笔画图标库（全部原创 SVG，墨线 #2A2522，填色走档案纸色板），用于“把一个东西拆成组成它的部分”
// 用法：ICONS.log()  返回 <svg> 字符串；viewBox 统一 0 0 120 120
const INK='#2A2522',PAPER='#fbf8f2',KRAFT='#CDB08A',RED='#C8372D',TEAL='#5E8C83',WOOD='#c49a6c',WOOD2='#e6c99a';
const sv=(b)=>`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${b}</svg>`;
const ICONS={
 // 原木：三根木头堆
 log:()=>sv(`<rect x="22" y="58" width="80" height="22" rx="4" fill="${WOOD}"/><ellipse cx="22" cy="69" rx="9" ry="11" fill="${WOOD2}"/><circle cx="22" cy="69" r="4"/>
  <rect x="30" y="80" width="80" height="22" rx="4" fill="${WOOD}"/><ellipse cx="30" cy="91" rx="9" ry="11" fill="${WOOD2}"/><circle cx="30" cy="91" r="4"/>
  <rect x="34" y="36" width="70" height="22" rx="4" fill="${WOOD}"/><ellipse cx="34" cy="47" rx="9" ry="11" fill="${WOOD2}"/><circle cx="34" cy="47" r="4"/>`),
 // 一棵树
 tree:()=>sv(`<path d="M60 14 L30 62 H48 L26 92 H94 L72 62 H90 Z" fill="${TEAL}"/><rect x="54" y="92" width="12" height="18" fill="${WOOD}"/>`),
 // 木片：一堆小碎片
 chips:()=>sv(`<path d="M18 96 Q60 56 102 96 Z" fill="${WOOD2}"/>${[[40,80,10],[58,70,-20],[74,82,25],[50,90,40],[66,92,-10],[84,92,15],[32,92,-30]].map(([x,y,r])=>`<rect x="${x-7}" y="${y-4}" width="14" height="8" rx="1" fill="${WOOD}" transform="rotate(${r} ${x} ${y})"/>`).join('')}`),
 // 纸浆包：白色方块 + 捆带
 pulp:()=>sv(`<path d="M20 44 L60 30 L100 44 L60 58 Z" fill="#fff"/><path d="M20 44 V88 L60 102 V58 Z" fill="${PAPER}"/><path d="M100 44 V88 L60 102 V58 Z" fill="#e9e2d2"/><path d="M40 37 L80 51 V95 M40 37 V81 L80 95" stroke="${RED}" stroke-width="3"/>`),
 // 废纸包：压扁的纸箱打成捆
 waste:()=>sv(`<rect x="18" y="34" width="84" height="64" rx="3" fill="${KRAFT}"/><path d="M18 50 H102 M18 66 H102 M18 82 H102" stroke-width="2" opacity=".55"/><path d="M42 34 V98 M78 34 V98" stroke-width="5"/><path d="M26 40 l10 4 M88 72 l-8 6 M30 88 l12 -4" stroke-width="2"/>`),
 // 纸箱
 carton:()=>sv(`<path d="M22 46 L60 32 L98 46 V92 L60 106 L22 92 Z" fill="${KRAFT}"/><path d="M22 46 L60 60 L98 46 M60 60 V106"/><path d="M41 39 L79 53" stroke-width="3"/>`),
 // 纸卷
 roll:()=>sv(`<rect x="30" y="34" width="60" height="62" fill="${PAPER}"/><ellipse cx="60" cy="34" rx="30" ry="10" fill="#fff"/><ellipse cx="60" cy="34" rx="8" ry="3" fill="${KRAFT}"/><path d="M30 96 Q60 106 90 96"/>`),
 // 集装箱船
 ship:()=>sv(`<path d="M10 70 H110 L96 98 H24 Z" fill="${INK}"/><rect x="24" y="48" width="18" height="22" fill="${RED}"/><rect x="44" y="48" width="18" height="22" fill="${TEAL}"/><rect x="64" y="48" width="18" height="22" fill="${KRAFT}"/><rect x="88" y="34" width="12" height="36" fill="${PAPER}"/><path d="M8 106 q8 -6 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0" stroke-width="3"/>`),
 // 空集装箱
 container:()=>sv(`<rect x="14" y="40" width="92" height="50" fill="${TEAL}"/><path d="M28 40 V90 M42 40 V90 M56 40 V90 M70 40 V90 M84 40 V90" stroke-width="2"/><text x="60" y="72" font-size="18" font-weight="900" text-anchor="middle" fill="#fff" stroke="none">空</text>`),
 // 工厂 / 纸厂
 factory:()=>sv(`<path d="M14 100 V58 L38 70 V58 L62 70 V58 L86 70 V30 H102 V100 Z" fill="${PAPER}"/><rect x="24" y="80" width="12" height="12" fill="${KRAFT}"/><rect x="48" y="80" width="12" height="12" fill="${KRAFT}"/><rect x="72" y="80" width="12" height="12" fill="${KRAFT}"/><path d="M94 26 q-6 -8 2 -14 q8 -6 2 -12" stroke-width="3"/>`),
 // 挖掘机（小挖）
 excavator:()=>sv(`<rect x="18" y="80" width="62" height="16" rx="8" fill="${INK}"/><rect x="24" y="56" width="44" height="24" fill="#e3a33a"/><rect x="28" y="40" width="22" height="18" fill="#fff"/><path d="M66 60 L88 34 L106 64" stroke-width="6"/><path d="M98 64 h14 l-4 12 h-12 z" fill="${INK}"/>`),
 // 矿卡
 minetruck:()=>sv(`<path d="M16 50 H82 L96 66 V80 H16 Z" fill="#e3a33a"/><path d="M20 50 L30 32 H74 L82 50" fill="${KRAFT}"/><circle cx="34" cy="86" r="12" fill="${INK}"/><circle cx="82" cy="86" r="12" fill="${INK}"/>`),
 // 金条
 gold:()=>sv(`<path d="M20 86 L32 62 H70 L82 86 Z" fill="#e3b54a"/><path d="M40 62 L50 42 H84 L94 62 H70" fill="#f0cb6a"/><path d="M50 86 L62 62" stroke-width="2"/>`),
 // 奶牛
 cow:()=>sv(`<rect x="24" y="44" width="62" height="36" rx="12" fill="#fff"/><path d="M36 50 q8 6 2 14 M64 48 q-6 10 6 14" stroke-width="6"/><rect x="80" y="36" width="24" height="22" rx="8" fill="#fff"/><path d="M84 36 l-4 -8 M100 36 l4 -8"/><path d="M32 80 V98 M44 80 V98 M68 80 V98 M80 80 V98"/><ellipse cx="56" cy="84" rx="8" ry="4" fill="#f4c0c0"/>`),
 // 大豆粒
 soy:()=>sv(`<ellipse cx="46" cy="64" rx="22" ry="17" fill="#e2c98f" transform="rotate(-20 46 64)"/><ellipse cx="78" cy="58" rx="20" ry="16" fill="#e2c98f" transform="rotate(15 78 58)"/><ellipse cx="62" cy="86" rx="20" ry="15" fill="#e2c98f"/><path d="M40 64 q6 -4 12 0 M72 58 q6 -4 12 0 M56 86 q6 -4 12 0" stroke-width="2"/>`),
 // 奶桶
 milkcan:()=>sv(`<path d="M34 36 H86 L82 102 H38 Z" fill="${PAPER}"/><rect x="28" y="26" width="64" height="12" rx="3" fill="#d8cdb8"/><path d="M46 26 q0 -16 28 0"/><path d="M38 60 H82" stroke-width="2"/>`),
 // 变压器
 transformer:()=>sv(`<rect x="26" y="44" width="68" height="56" fill="${TEAL}"/><path d="M34 44 V100 M44 44 V100 M76 44 V100 M86 44 V100" stroke-width="2"/><path d="M42 44 V26 M60 44 V20 M78 44 V26" stroke-width="5"/><circle cx="42" cy="24" r="4" fill="#fff"/><circle cx="60" cy="18" r="4" fill="#fff"/><circle cx="78" cy="24" r="4" fill="#fff"/>`),
 // 地铁车厢
 metro:()=>sv(`<rect x="12" y="38" width="96" height="52" rx="10" fill="${PAPER}"/><rect x="22" y="48" width="18" height="16" fill="${TEAL}"/><rect x="46" y="48" width="18" height="16" fill="${TEAL}"/><rect x="70" y="48" width="18" height="16" fill="${TEAL}"/><path d="M12 74 H108" stroke="${RED}" stroke-width="4"/><circle cx="34" cy="96" r="6" fill="${INK}"/><circle cx="86" cy="96" r="6" fill="${INK}"/>`),
 // 汽车
 car:()=>sv(`<path d="M14 80 V64 L30 46 H78 L96 62 L106 66 V80 Z" fill="${PAPER}"/><path d="M36 50 H58 V62 H28 Z M64 50 H76 L88 62 H64 Z" fill="${TEAL}"/><circle cx="34" cy="84" r="10" fill="${INK}"/><circle cx="88" cy="84" r="10" fill="${INK}"/>`),
 // 锅炉
 boiler:()=>sv(`<rect x="30" y="24" width="60" height="78" rx="6" fill="#d8cdb8"/><path d="M30 44 H90 M30 64 H90 M30 84 H90" stroke-width="2"/><path d="M60 24 V10" stroke-width="6"/><circle cx="60" cy="74" r="8" fill="${RED}"/>`),
 // 钱
 money:()=>sv(`<rect x="16" y="42" width="88" height="46" rx="4" fill="#cfe0c8"/><circle cx="60" cy="65" r="13" fill="#fff"/><text x="60" y="71" font-size="17" font-weight="900" text-anchor="middle" fill="${INK}" stroke="none">¥</text>`),
 // 文件 / 公告
 doc:()=>sv(`<path d="M30 14 H76 L92 30 V106 H30 Z" fill="#fff"/><path d="M76 14 V30 H92"/><path d="M40 44 H82 M40 58 H82 M40 72 H70" stroke-width="3"/><circle cx="74" cy="90" r="11" stroke="${RED}" stroke-width="4"/>`),
 // 禁止
 ban:()=>sv(`<circle cx="60" cy="60" r="40" stroke="${RED}" stroke-width="8" fill="#fff"/><path d="M32 32 L88 88" stroke="${RED}" stroke-width="8"/>`),
 // 美国 / 中国 小旗不用（避免国旗图形），用地名牌
};
if(typeof module!=='undefined') module.exports=ICONS;
