import type { Skill, StatusId } from "../game/types";

export const STATUS_LABELS: Record<StatusId, string> = {
  burn: "灼烧",
  slick: "湿滑",
  bind: "缠绕",
  stoneArmor: "石甲",
  armorBreak: "破甲",
  haste: "疾风",
  regen: "再生",
  guard: "守护",
  defending: "防御中"
};

const skill = (entry: Skill): Skill => entry;

export const SKILLS: Skill[] = [
  skill({
    id: "fire-basic",
    name: "火苗击",
    element: "fire",
    category: "attack",
    apCost: 0,
    target: "enemy",
    power: 5,
    multiplier: 0.62,
    description: "基础火属性攻击，不消耗 AP"
  }),
  skill({
    id: "water-basic",
    name: "水花击",
    element: "water",
    category: "attack",
    apCost: 0,
    target: "enemy",
    power: 5,
    multiplier: 0.58,
    description: "基础水属性攻击，不消耗 AP"
  }),
  skill({
    id: "forest-basic",
    name: "叶芽击",
    element: "forest",
    category: "attack",
    apCost: 0,
    target: "enemy",
    power: 4,
    multiplier: 0.52,
    description: "基础森属性攻击，不消耗 AP"
  }),
  skill({
    id: "earth-basic",
    name: "砾石击",
    element: "earth",
    category: "attack",
    apCost: 0,
    target: "enemy",
    power: 5,
    multiplier: 0.5,
    description: "基础土属性攻击，不消耗 AP"
  }),
  skill({
    id: "wind-basic",
    name: "微风击",
    element: "wind",
    category: "attack",
    apCost: 0,
    target: "enemy",
    power: 4,
    multiplier: 0.58,
    description: "基础风属性攻击，不消耗 AP"
  }),

  skill({ id: "tail-flame-pounce", name: "尾焰扑击", element: "fire", category: "attack", apCost: 1, target: "enemy", power: 12, multiplier: 0.9, status: { id: "burn", chance: 0.25, turns: 2 }, description: "焰尾狐跃击目标，概率造成灼烧" }),
  skill({ id: "coal-snort", name: "煤鼻喷火", element: "fire", category: "attack", apCost: 1, target: "enemy", power: 11, multiplier: 0.82, status: { id: "burn", chance: 0.45, turns: 2 }, description: "喷出煤火，伤害稳定且更容易灼烧" }),
  skill({ id: "fire-scale-claw", name: "火鳞爪", element: "fire", category: "attack", apCost: 1, target: "enemy", power: 14, multiplier: 1.02, description: "以火鳞利爪造成单体高伤害" }),
  skill({ id: "ember-peck", name: "炎羽啄", element: "fire", category: "attack", apCost: 1, target: "enemy", power: 10, multiplier: 0.9, status: { id: "burn", chance: 0.2, turns: 2 }, description: "快速啄击，适合先手压低目标 HP" }),
  skill({ id: "cinder-horn-rush", name: "烬角冲", element: "fire", category: "attack", apCost: 1, target: "enemy", power: 15, multiplier: 1.0, status: { id: "burn", chance: 0.25, turns: 2 }, description: "用烬角冲撞，概率灼烧" }),
  skill({ id: "chasing-bite", name: "追焰咬", element: "fire", category: "attack", apCost: 2, target: "enemy", power: 22, multiplier: 1.18, description: "单体高伤害，目标已灼烧或低 HP 时收益更高" }),
  skill({ id: "molten-shell", name: "熔壳护体", element: "fire", category: "defense", apCost: 1, target: "self", shield: 16, multiplier: 0.65, buff: { id: "guard", turns: 2, value: 16 }, description: "自身获得熔壳守护" }),
  skill({ id: "ground-fire", name: "地火翻涌", element: "fire", category: "attack", apCost: 2, target: "allEnemies", power: 9, multiplier: 0.46, status: { id: "burn", chance: 0.28, turns: 2 }, description: "敌方全体火焰伤害，概率灼烧" }),
  skill({ id: "flame-horn", name: "炎角顶", element: "fire", category: "attack", apCost: 1, target: "enemy", power: 16, multiplier: 0.96, description: "稳定单体冲撞伤害" }),
  skill({ id: "heatwave-command", name: "热浪号令", element: "fire", category: "attack", apCost: 2, target: "allEnemies", power: 10, multiplier: 0.5, status: { id: "burn", chance: 0.24, turns: 2 }, description: "敌方全体中等火焰伤害" }),
  skill({ id: "blazing-mane-bite", name: "烈鬃撕咬", element: "fire", category: "attack", apCost: 2, target: "enemy", power: 25, multiplier: 1.25, status: { id: "burn", chance: 0.3, turns: 2 }, description: "高级火系单体爆发，概率灼烧" }),
  skill({ id: "royal-fire-chase", name: "王火追击", element: "fire", category: "attack", apCost: 3, target: "enemy", power: 36, multiplier: 1.45, description: "极高单体伤害，适合终结关键目标" }),
  skill({ id: "volcanic-charge", name: "火山撞击", element: "fire", category: "attack", apCost: 2, target: "enemy", power: 24, multiplier: 1.15, status: { id: "armorBreak", chance: 0.8, turns: 2, value: 0.22 }, description: "重装撞击并大概率破甲" }),
  skill({ id: "lava-burst", name: "熔岩爆裂", element: "fire", category: "attack", apCost: 3, target: "allEnemies", power: 18, multiplier: 0.72, status: { id: "burn", chance: 0.38, turns: 2 }, description: "高级全体高伤害，概率灼烧" }),
  skill({ id: "phoenix-flare-wheel", name: "凰焰回旋", element: "fire", category: "attack", apCost: 2, target: "allEnemies", power: 17, multiplier: 0.7, status: { id: "burn", chance: 0.32, turns: 2 }, description: "神凰卷起火环，攻击敌方全体" }),
  skill({ id: "divine-meteor-flame", name: "神凰陨火", element: "fire", category: "attack", apCost: 3, target: "allEnemies", power: 24, multiplier: 0.95, status: { id: "burn", chance: 0.55, turns: 2 }, description: "神兽级全体爆发，高概率灼烧" }),

  skill({ id: "shellspring-heal", name: "贝泉疗愈", element: "water", category: "heal", apCost: 1, target: "ally", heal: 9, multiplier: 0.58, description: "治疗我方单体，适合开局续航" }),
  skill({ id: "jelly-tentacle", name: "麻泡触须", element: "water", category: "attack", apCost: 1, target: "enemy", power: 9, multiplier: 0.72, status: { id: "slick", chance: 0.45, turns: 2, value: 0.28 }, description: "触须水泡造成伤害并概率湿滑" }),
  skill({ id: "coral-shell", name: "珊壳屏障", element: "water", category: "defense", apCost: 1, target: "self", shield: 13, multiplier: 0.7, buff: { id: "guard", turns: 2, value: 13 }, description: "自身获得珊壳守护" }),
  skill({ id: "bubble-kiss-slap", name: "泡吻拍击", element: "water", category: "attack", apCost: 1, target: "enemy", power: 12, multiplier: 0.9, description: "水泡拍击，单体稳定伤害" }),
  skill({ id: "tidecrest-lance", name: "潮冠水矛", element: "water", category: "attack", apCost: 1, target: "enemy", power: 13, multiplier: 0.85, status: { id: "slick", chance: 0.35, turns: 2, value: 0.25 }, description: "水矛刺击，概率降低目标速度" }),
  skill({ id: "returning-tide-song", name: "回潮歌", element: "water", category: "heal", apCost: 2, target: "ally", heal: 16, multiplier: 0.75, description: "中级单体治疗，恢复量较高" }),
  skill({ id: "wave-pattern-pounce", name: "浪纹扑击", element: "water", category: "attack", apCost: 1, target: "enemy", power: 15, multiplier: 0.95, description: "高速扑击，单体稳定输出" }),
  skill({ id: "rapid-current-chase", name: "急流追击", element: "water", category: "attack", apCost: 2, target: "enemy", power: 23, multiplier: 1.1, description: "单体高伤害，适合集火弱血目标" }),
  skill({ id: "crystal-pincer", name: "晶钳夹击", element: "water", category: "attack", apCost: 1, target: "enemy", power: 14, multiplier: 0.82, status: { id: "armorBreak", chance: 0.45, turns: 2, value: 0.22 }, description: "水晶钳破开防线" }),
  skill({ id: "foam-wall", name: "泡沫壁", element: "water", category: "defense", apCost: 2, target: "allAllies", shield: 11, multiplier: 0.48, buff: { id: "guard", turns: 2, value: 11 }, description: "我方全体获得轻护盾" }),
  skill({ id: "whale-tide-press", name: "鲸潮压浪", element: "water", category: "attack", apCost: 2, target: "allEnemies", power: 14, multiplier: 0.58, status: { id: "slick", chance: 0.32, turns: 2, value: 0.25 }, description: "高级全体水浪压制" }),
  skill({ id: "blue-tide-revive", name: "蓝潮复苏", element: "water", category: "heal", apCost: 3, target: "allAllies", heal: 13, multiplier: 0.46, description: "高级群体治疗，稳定恢复全队" }),
  skill({ id: "frost-fin-cut", name: "霜鳍斩", element: "water", category: "attack", apCost: 2, target: "enemy", power: 24, multiplier: 1.15, status: { id: "slick", chance: 0.5, turns: 2, value: 0.32 }, description: "高速单体高伤害并概率湿滑" }),
  skill({ id: "cold-current-flow", name: "寒潮切流", element: "water", category: "attack", apCost: 3, target: "allEnemies", power: 16, multiplier: 0.68, status: { id: "slick", chance: 0.6, turns: 2, value: 0.3 }, description: "全体中高伤害，并大概率降低速度" }),
  skill({ id: "azure-dragon-breath", name: "沧澜龙息", element: "water", category: "attack", apCost: 2, target: "allEnemies", power: 16, multiplier: 0.66, status: { id: "slick", chance: 0.55, turns: 2, value: 0.32 }, description: "神龙水息压制敌方全体" }),
  skill({ id: "sea-god-tide", name: "海神潮汐", element: "water", category: "heal", apCost: 3, target: "allAllies", heal: 15, multiplier: 0.52, shield: 10, buff: { id: "guard", turns: 2, value: 10 }, description: "神兽级群体治疗，并为全队附加守护" }),

  skill({ id: "sprout-antler", name: "嫩角突刺", element: "forest", category: "attack", apCost: 1, target: "enemy", power: 9, multiplier: 0.7, status: { id: "bind", chance: 0.42, turns: 1, value: 0.3 }, description: "嫩角刺击，概率缠绕" }),
  skill({ id: "moss-shell-guard", name: "苔壳守护", element: "forest", category: "defense", apCost: 1, target: "self", shield: 14, multiplier: 0.7, buff: { id: "guard", turns: 2, value: 14 }, description: "自身获得苔壳护盾" }),
  skill({ id: "flower-spine-roll", name: "花刺滚击", element: "forest", category: "attack", apCost: 1, target: "enemy", power: 10, multiplier: 0.72, status: { id: "armorBreak", chance: 0.3, turns: 2, value: 0.2 }, description: "花刺滚动攻击，概率破甲" }),
  skill({ id: "mushroom-umbrella-heal", name: "菌伞疗愈", element: "forest", category: "heal", apCost: 1, target: "ally", heal: 8, multiplier: 0.5, buff: { id: "regen", turns: 2, value: 0.08 }, description: "小幅治疗，并附加再生" }),
  skill({ id: "vine-tail-lock", name: "藤尾缠锁", element: "forest", category: "attack", apCost: 1, target: "enemy", power: 13, multiplier: 0.78, status: { id: "bind", chance: 0.55, turns: 1, value: 0.35 }, description: "藤尾缠住目标，概率缠绕" }),
  skill({ id: "forest-step", name: "林息步", element: "forest", category: "support", apCost: 2, target: "self", buff: { id: "haste", turns: 2, value: 0.25 }, description: "借林息提速，自身获得疾风" }),
  skill({ id: "moss-armor-wall", name: "苔甲壁", element: "forest", category: "defense", apCost: 1, target: "ally", shield: 16, multiplier: 0.72, buff: { id: "guard", turns: 2, value: 16 }, description: "为我方单体提供强韧苔甲守护" }),
  skill({ id: "root-regrowth", name: "根须再生", element: "forest", category: "heal", apCost: 2, target: "ally", heal: 13, multiplier: 0.55, buff: { id: "regen", turns: 2, value: 0.1 }, description: "治疗我方单体并附加再生" }),
  skill({ id: "flying-leaf-cut", name: "飞叶切", element: "forest", category: "attack", apCost: 1, target: "enemy", power: 14, multiplier: 0.85, description: "高速飞叶切割，单体稳定伤害" }),
  skill({ id: "pollen-drift", name: "花粉扰流", element: "forest", category: "attack", apCost: 2, target: "allEnemies", power: 8, multiplier: 0.38, status: { id: "slick", chance: 0.45, turns: 2, value: 0.22 }, description: "花粉扰乱敌方全体，概率降速" }),
  skill({ id: "crown-shelter", name: "树冠庇护", element: "forest", category: "defense", apCost: 2, target: "allAllies", shield: 13, multiplier: 0.55, buff: { id: "guard", turns: 2, value: 13 }, description: "高级群体守护" }),
  skill({ id: "ancient-forest-revival", name: "古林回春", element: "forest", category: "heal", apCost: 3, target: "allAllies", heal: 12, multiplier: 0.42, buff: { id: "regen", turns: 2, value: 0.1 }, description: "高级群体治疗，并附加再生" }),
  skill({ id: "moss-ridge-stomp", name: "苔岭重踏", element: "forest", category: "attack", apCost: 2, target: "enemy", power: 23, multiplier: 1.08, status: { id: "armorBreak", chance: 0.65, turns: 2, value: 0.25 }, description: "重踏目标并概率破甲" }),
  skill({ id: "forest-armor-command", name: "森甲号令", element: "forest", category: "defense", apCost: 3, target: "allAllies", shield: 17, multiplier: 0.65, buff: { id: "guard", turns: 2, value: 17 }, description: "高级全体强守护" }),
  skill({ id: "myriad-leaf-wheel", name: "万叶轮舞", element: "forest", category: "attack", apCost: 2, target: "allEnemies", power: 15, multiplier: 0.62, status: { id: "bind", chance: 0.55, turns: 1, value: 0.35 }, description: "神兽级全体森属性伤害，概率缠绕" }),
  skill({ id: "divine-forest-revive", name: "神森复苏", element: "forest", category: "heal", apCost: 3, target: "allAllies", heal: 15, multiplier: 0.5, buff: { id: "regen", turns: 2, value: 0.12 }, description: "神兽级群体治疗，并赋予强再生" }),

  skill({ id: "sand-tail-sweep", name: "沙尾扫击", element: "earth", category: "attack", apCost: 1, target: "enemy", power: 11, multiplier: 0.75, status: { id: "armorBreak", chance: 0.3, turns: 2, value: 0.2 }, description: "用沙尾扫击目标，概率破甲" }),
  skill({ id: "rolled-armor", name: "卷甲防御", element: "earth", category: "defense", apCost: 1, target: "self", buff: { id: "stoneArmor", turns: 3, value: 0.32 }, description: "自身获得石甲减伤" }),
  skill({ id: "mud-paw-slam", name: "泥掌拍击", element: "earth", category: "attack", apCost: 1, target: "enemy", power: 12, multiplier: 0.82, description: "稳定土属性单体攻击" }),
  skill({ id: "clay-bell-quake", name: "陶铃震", element: "earth", category: "attack", apCost: 1, target: "enemy", power: 9, multiplier: 0.65, status: { id: "slick", chance: 0.4, turns: 2, value: 0.2 }, description: "震动陶铃，概率降低目标速度" }),
  skill({ id: "rockback-raid", name: "岩背突袭", element: "earth", category: "attack", apCost: 1, target: "enemy", power: 15, multiplier: 0.9, status: { id: "armorBreak", chance: 0.35, turns: 2, value: 0.22 }, description: "岩背冲刺并概率破甲" }),
  skill({ id: "shatter-howl", name: "碎甲嚎", element: "earth", category: "attack", apCost: 2, target: "allEnemies", power: 9, multiplier: 0.42, status: { id: "armorBreak", chance: 0.55, turns: 2, value: 0.22 }, description: "震裂敌方全体护甲" }),
  skill({ id: "camel-bell-earth", name: "驼铃震地", element: "earth", category: "attack", apCost: 1, target: "enemy", power: 13, multiplier: 0.8, status: { id: "slick", chance: 0.35, turns: 2, value: 0.18 }, description: "驼铃震动地面，概率降速" }),
  skill({ id: "sandship-wall", name: "沙舟壁垒", element: "earth", category: "defense", apCost: 2, target: "allAllies", buff: { id: "stoneArmor", turns: 3, value: 0.28 }, description: "我方全体获得石甲减伤" }),
  skill({ id: "crystal-spike", name: "晶刺弹", element: "earth", category: "attack", apCost: 1, target: "enemy", power: 14, multiplier: 0.82, status: { id: "armorBreak", chance: 0.45, turns: 2, value: 0.24 }, description: "射出晶刺并概率破甲" }),
  skill({ id: "rockbreath-barrier", name: "岩息屏障", element: "earth", category: "defense", apCost: 2, target: "ally", shield: 20, multiplier: 0.85, buff: { id: "guard", turns: 2, value: 20 }, description: "为我方单体提供高额护盾" }),
  skill({ id: "rock-armor-charge", name: "岩铠冲锋", element: "earth", category: "attack", apCost: 2, target: "enemy", power: 24, multiplier: 1.08, status: { id: "armorBreak", chance: 0.75, turns: 2, value: 0.25 }, description: "高级单体冲锋，大概率破甲" }),
  skill({ id: "mountain-stance", name: "群山守势", element: "earth", category: "defense", apCost: 3, target: "allAllies", buff: { id: "stoneArmor", turns: 3, value: 0.38 }, description: "全体获得强力石甲减伤" }),
  skill({ id: "hill-armor-press", name: "丘甲重压", element: "earth", category: "attack", apCost: 2, target: "allEnemies", power: 13, multiplier: 0.55, status: { id: "slick", chance: 0.35, turns: 2, value: 0.18 }, description: "高级全体压制，概率降速" }),
  skill({ id: "earth-greatwall", name: "大地壁垒", element: "earth", category: "defense", apCost: 3, target: "allAllies", shield: 18, multiplier: 0.72, buff: { id: "guard", turns: 2, value: 18 }, description: "高级全体高护盾" }),
  skill({ id: "black-rock-array", name: "玄岩裂阵", element: "earth", category: "attack", apCost: 2, target: "allEnemies", power: 15, multiplier: 0.62, status: { id: "armorBreak", chance: 0.75, turns: 2, value: 0.28 }, description: "神兽级全体破甲压制" }),
  skill({ id: "divine-mountain-guard", name: "神岳镇守", element: "earth", category: "defense", apCost: 3, target: "allAllies", shield: 20, multiplier: 0.78, buff: { id: "guard", turns: 2, value: 20 }, description: "神兽级全体守护，极大提升承伤能力" }),

  skill({ id: "cloud-wool-guard", name: "云绒护", element: "wind", category: "defense", apCost: 1, target: "ally", shield: 10, multiplier: 0.52, buff: { id: "guard", turns: 2, value: 10 }, description: "为我方单体提供轻护盾" }),
  skill({ id: "frostwind-claw", name: "霜风爪", element: "wind", category: "attack", apCost: 1, target: "enemy", power: 11, multiplier: 0.9, status: { id: "slick", chance: 0.25, turns: 2, value: 0.18 }, description: "速度型单体攻击，概率降速" }),
  skill({ id: "wind-feather-peck", name: "风羽啄", element: "wind", category: "attack", apCost: 1, target: "enemy", power: 10, multiplier: 0.86, description: "迅捷啄击，适合先手输出" }),
  skill({ id: "glide-strike", name: "滑翔突击", element: "wind", category: "attack", apCost: 1, target: "enemy", power: 10, multiplier: 0.82, buff: { id: "haste", turns: 2, value: 0.2 }, description: "突击后自身获得疾风" }),
  skill({ id: "cloudcurl-leap", name: "卷云跃击", element: "wind", category: "attack", apCost: 1, target: "enemy", power: 14, multiplier: 0.95, description: "高速跃击，单体稳定伤害" }),
  skill({ id: "tailwind-step", name: "顺风步", element: "wind", category: "support", apCost: 2, target: "ally", buff: { id: "haste", turns: 2, value: 0.32 }, description: "我方单体获得疾风" }),
  skill({ id: "feather-antler", name: "羽角刺", element: "wind", category: "attack", apCost: 1, target: "enemy", power: 13, multiplier: 0.82, status: { id: "armorBreak", chance: 0.35, turns: 2, value: 0.2 }, description: "羽角刺击，概率破甲" }),
  skill({ id: "spiral-feather-veil", name: "旋羽护幕", element: "wind", category: "defense", apCost: 2, target: "allAllies", shield: 10, multiplier: 0.48, buff: { id: "guard", turns: 2, value: 10 }, description: "全体获得轻护盾" }),
  skill({ id: "storm-claw-combo", name: "岚爪连击", element: "wind", category: "attack", apCost: 1, target: "enemy", power: 15, multiplier: 0.92, description: "快速连爪，单体稳定输出" }),
  skill({ id: "formation-rush", name: "破阵疾袭", element: "wind", category: "attack", apCost: 2, target: "enemy", power: 23, multiplier: 1.16, status: { id: "armorBreak", chance: 0.85, turns: 2, value: 0.24 }, description: "高伤害并大概率破甲" }),
  skill({ id: "azure-dive", name: "苍羽俯冲", element: "wind", category: "attack", apCost: 2, target: "enemy", power: 24, multiplier: 1.18, description: "高级高速单体压制" }),
  skill({ id: "skywind-dance", name: "天风连舞", element: "wind", category: "attack", apCost: 3, target: "allEnemies", power: 17, multiplier: 0.72, buff: { id: "haste", turns: 2, value: 0.25 }, description: "全体风刃攻击，并让自身加速" }),
  skill({ id: "cloudfang-gale", name: "云牙裂风", element: "wind", category: "attack", apCost: 2, target: "enemy", power: 23, multiplier: 1.08, status: { id: "armorBreak", chance: 0.65, turns: 2, value: 0.25 }, description: "裂风撕咬，概率破甲" }),
  skill({ id: "high-sky-tailwind", name: "高天顺风", element: "wind", category: "support", apCost: 3, target: "allAllies", buff: { id: "haste", turns: 2, value: 0.28 }, description: "全队获得疾风，大幅提升行动速度" }),
  skill({ id: "sky-gale-dragonroll", name: "天岚龙卷", element: "wind", category: "attack", apCost: 2, target: "allEnemies", power: 16, multiplier: 0.66, status: { id: "slick", chance: 0.55, turns: 2, value: 0.28 }, description: "神兽级全体龙卷，概率降速" }),
  skill({ id: "divine-wind-judgment", name: "神风裁决", element: "wind", category: "attack", apCost: 3, target: "allEnemies", power: 22, multiplier: 0.88, buff: { id: "haste", turns: 2, value: 0.3 }, description: "神兽级全体高伤害，并让自身获得疾风" })
];

export const getSkill = (id: string): Skill => {
  const skillItem = SKILLS.find((item) => item.id === id);
  if (!skillItem) {
    throw new Error(`Unknown skill: ${id}`);
  }
  return skillItem;
};
