import type { ElementType, GrowthLevel, PetSpecies, Stats } from "../game/types";

const stats = (hp: number, attack: number, defense: number, speed: number, crit: number): Stats => ({
  hp,
  attack,
  defense,
  speed,
  crit
});

const pet = (
  id: string,
  name: string,
  element: ElementType,
  growthLevel: GrowthLevel,
  role: string,
  statFocus: string,
  baseStats: Stats,
  skillIds: string[]
): PetSpecies => ({
  id,
  name,
  element,
  growthLevel,
  role,
  statFocus,
  baseStats,
  skillIds
});

export const PETS: PetSpecies[] = [
  pet("fire-lizard", "火花蜥", "fire", 1, "单体输出", "攻击、速度", stats(34, 13, 6, 11, 6), ["fire-basic", "spark-hit"]),
  pet("coal-pig", "炭鼻猪", "fire", 1, "稳定前排", "HP、攻击", stats(40, 12, 8, 6, 5), ["fire-basic", "ember-claw"]),
  pet("lamp-fox", "灯尾狐", "fire", 1, "灼烧骚扰", "速度、暴击", stats(32, 9, 6, 12, 11), ["fire-basic", "spark-hit"]),
  pet("red-rooster", "赤羽鸡", "fire", 1, "快速收割", "速度、攻击", stats(30, 14, 5, 13, 6), ["fire-basic", "ember-claw"]),
  pet("magma-turtle", "熔甲龟", "fire", 2, "防御反伤", "HP、防御", stats(66, 17, 19, 10, 13), ["fire-basic", "spark-hit", "heat-guard"]),
  pet("blaze-panther", "烈牙豹", "fire", 2, "高速爆发", "攻击、速度", stats(54, 24, 11, 21, 12), ["fire-basic", "ember-claw", "flame-chase"]),
  pet("tinder-deer", "火绒鹿", "fire", 2, "团队增益", "暴击、速度", stats(58, 17, 12, 18, 20), ["fire-basic", "spark-hit", "volcano-call"]),
  pet("flame-crown-drake", "炎冠龙", "fire", 3, "终局爆发", "攻击、HP", stats(100, 38, 22, 25, 20), ["fire-basic", "flame-chase", "meteor-flame"]),
  pet("volcano-rhino", "火山巨犀", "fire", 3, "重装压制", "HP、防御、攻击", stats(110, 34, 30, 18, 18), ["fire-basic", "heat-guard", "volcano-call"]),
  pet("scorch-phoenix", "灼翼凰", "fire", 3, "群体输出", "攻击、速度、暴击", stats(88, 36, 20, 33, 28), ["fire-basic", "volcano-call", "meteor-flame"]),

  pet("bubble-dolphin", "泡泡豚", "water", 1, "新手回复胚子", "HP、暴击", stats(38, 8, 7, 8, 13), ["water-basic", "spring-heal"]),
  pet("tide-crab", "潮壳蟹", "water", 1, "防御型", "防御、HP", stats(42, 9, 11, 5, 7), ["water-basic", "tide-slam"]),
  pet("bluefin-rabbit", "蓝鳍兔", "water", 1, "控速型", "速度、暴击", stats(32, 8, 6, 12, 12), ["water-basic", "water-shot"]),
  pet("mist-frog", "雾眼蛙", "water", 1, "状态干扰", "暴击、速度", stats(34, 9, 6, 11, 13), ["water-basic", "water-shot"]),
  pet("coral-turtle", "珊瑚龟", "water", 2, "守护治疗", "防御、暴击", stats(66, 15, 19, 10, 20), ["water-basic", "spring-heal", "bubble-barrier"]),
  pet("brook-cat", "溪影猫", "water", 2, "控速输出", "速度、攻击", stats(52, 21, 11, 21, 14), ["water-basic", "water-shot", "deep-silence"]),
  pet("wave-otter", "浪牙獭", "water", 2, "均衡战士", "攻击、HP", stats(64, 22, 14, 15, 14), ["water-basic", "tide-slam", "spring-heal"]),
  pet("crystal-whale", "海晶鲸", "water", 3, "团队治疗", "HP、暴击", stats(110, 25, 26, 18, 34), ["water-basic", "spring-heal", "sea-revive"]),
  pet("deep-tide-jiao", "深潮蛟", "water", 3, "控速输出", "暴击、速度", stats(92, 30, 22, 31, 33), ["water-basic", "tide-slam", "deep-silence"]),
  pet("moon-bay-mer", "月湾鲛", "water", 3, "辅助核心", "暴击、速度、防御", stats(88, 26, 28, 28, 34), ["water-basic", "bubble-barrier", "sea-revive"]),

  pet("grass-mouse", "草团鼠", "forest", 1, "快速缠绕", "速度、防御", stats(32, 8, 6, 12, 13), ["forest-basic", "vine-bind"]),
  pet("moss-turtle", "苔背龟", "forest", 1, "低阶肉盾", "防御、HP", stats(42, 8, 11, 5, 8), ["forest-basic", "pollen-guard"]),
  pet("flower-deer", "花耳鹿", "forest", 1, "回复胚子", "速度、防御", stats(34, 8, 7, 11, 13), ["forest-basic", "sprout"]),
  pet("leaf-monkey", "叶尾猴", "forest", 1, "敏捷输出", "速度、防御", stats(31, 13, 6, 13, 7), ["forest-basic", "vine-bind"]),
  pet("vine-bear", "藤甲熊", "forest", 2, "前排守护", "防御、速度", stats(68, 18, 19, 10, 15), ["forest-basic", "pollen-guard", "leaf-blade"]),
  pet("honeybud-fox", "蜜芽狐", "forest", 2, "回复辅助", "速度、防御", stats(54, 15, 12, 19, 21), ["forest-basic", "sprout", "forest-echo"]),
  pet("thorn-panther", "荆棘豹", "forest", 2, "缠绕输出", "速度、防御", stats(54, 23, 11, 20, 13), ["forest-basic", "vine-bind", "ancient-judgment"]),
  pet("ancient-stag", "古木鹿王", "forest", 3, "团队续航", "防御、速度、HP", stats(106, 27, 26, 23, 34), ["forest-basic", "forest-echo", "pollen-guard"]),
  pet("jade-eagle", "翠冠鹰", "forest", 3, "高速辅助", "速度、防御、攻击", stats(84, 32, 20, 34, 32), ["forest-basic", "vine-bind", "ancient-judgment"]),
  pet("forest-giant-bear", "森灵巨熊", "forest", 3, "压制前排", "防御、HP、攻击", stats(110, 36, 28, 19, 22), ["forest-basic", "pollen-guard", "ancient-judgment"]),

  pet("stone-rat", "石牙鼠", "earth", 1, "破甲入门", "攻击、速度", stats(34, 12, 8, 10, 6), ["earth-basic", "rock-chip"]),
  pet("sand-lizard", "沙背蜥", "earth", 1, "干扰", "速度、防御", stats(36, 9, 10, 11, 6), ["earth-basic", "sand-slap"]),
  pet("round-rock-sheep", "圆岩羊", "earth", 1, "稳定前排", "HP、防御", stats(42, 9, 11, 5, 7), ["earth-basic", "rock-armor"]),
  pet("copper-bug", "铜壳虫", "earth", 1, "防御胚子", "防御、HP", stats(40, 8, 11, 6, 7), ["earth-basic", "rock-armor"]),
  pet("rock-horn-bull", "岩角牛", "earth", 2, "重击前排", "HP、攻击", stats(68, 23, 17, 10, 11), ["earth-basic", "rock-chip", "earth-charge"]),
  pet("sand-pattern-cat", "砂纹猫", "earth", 2, "命中干扰", "速度、暴击", stats(52, 17, 12, 20, 19), ["earth-basic", "sand-slap", "rock-armor"]),
  pet("stone-shield-ape", "石盾猿", "earth", 2, "坦克", "防御、HP", stats(68, 17, 19, 11, 12), ["earth-basic", "rock-armor", "mountain-wall"]),
  pet("ridge-giant-turtle", "山脊巨龟", "earth", 3, "团队防御", "HP、防御", stats(110, 27, 30, 18, 22), ["earth-basic", "rock-armor", "mountain-wall"]),
  pet("meteor-lion", "陨石狮", "earth", 3, "破甲输出", "攻击、防御、HP", stats(100, 36, 28, 20, 20), ["earth-basic", "earth-charge", "meteor-quake"]),
  pet("ancient-golem", "古岩魔像", "earth", 3, "首领型坦克", "HP、防御、暴击", stats(110, 28, 30, 18, 30), ["earth-basic", "mountain-wall", "meteor-quake"]),

  pet("wind-chime-sparrow", "风铃雀", "wind", 1, "新手高速", "速度、暴击", stats(30, 8, 5, 13, 12), ["wind-basic", "wind-blade"]),
  pet("cloud-rabbit", "云尾兔", "wind", 1, "先手攻击", "速度、攻击", stats(30, 13, 5, 13, 7), ["wind-basic", "quick-peck"]),
  pet("spin-dragonfly", "旋叶蜓", "wind", 1, "闪避胚子", "速度、防御", stats(31, 9, 9, 13, 8), ["wind-basic", "tailwind"]),
  pet("light-feather-cat", "轻羽猫", "wind", 1, "快速输出", "速度、攻击", stats(30, 14, 5, 13, 6), ["wind-basic", "quick-peck"]),
  pet("gale-wolf", "岚翼狼", "wind", 2, "速度核心", "攻击、速度", stats(54, 23, 11, 21, 13), ["wind-basic", "wind-blade", "tailwind"]),
  pet("white-feather-deer", "白羽鹿", "wind", 2, "团队辅助", "暴击、速度", stats(56, 16, 13, 20, 21), ["wind-basic", "quick-peck", "cyclone-veil"]),
  pet("swift-weasel", "疾风鼬", "wind", 2, "连击输出", "速度、攻击", stats(50, 24, 10, 21, 12), ["wind-basic", "quick-peck", "break-rush"]),
  pet("sky-thunder-vulture", "天鸣鹫", "wind", 3, "先手压制", "攻击、速度", stats(86, 36, 20, 34, 23), ["wind-basic", "break-rush", "sky-dance"]),
  pet("cloud-kirin", "云岚麒麟", "wind", 3, "团队增益", "暴击、速度、HP", stats(98, 27, 24, 32, 34), ["wind-basic", "cyclone-veil", "tailwind"]),
  pet("storm-griffin", "风暴狮鹫", "wind", 3, "高速终结", "攻击、速度、暴击", stats(88, 37, 20, 34, 30), ["wind-basic", "break-rush", "sky-dance"])
];

export const STARTER_SPECIES_IDS = ["fire-lizard", "bubble-dolphin", "grass-mouse", "round-rock-sheep", "wind-chime-sparrow"];

export const getPetSpecies = (id: string): PetSpecies => {
  const species = PETS.find((item) => item.id === id);
  if (!species) {
    throw new Error(`Unknown pet species: ${id}`);
  }
  return species;
};

export const PETS_BY_LEVEL: Record<GrowthLevel, PetSpecies[]> = {
  1: PETS.filter((petItem) => petItem.growthLevel === 1),
  2: PETS.filter((petItem) => petItem.growthLevel === 2),
  3: PETS.filter((petItem) => petItem.growthLevel === 3)
};
