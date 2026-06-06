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
  pet("fire-lizard", "焰尾狐", "fire", 1, "高速暴击", "攻击、速度、暴击", stats(31, 13, 6, 13, 10), ["fire-basic", "tail-flame-pounce"]),
  pet("coal-pig", "焦煤豚", "fire", 1, "耐久灼烧", "HP、攻击", stats(41, 11, 8, 6, 7), ["fire-basic", "coal-snort"]),
  pet("lamp-fox", "火鳞蜥", "fire", 1, "单体输出", "攻击、速度", stats(34, 14, 6, 10, 7), ["fire-basic", "fire-scale-claw"]),
  pet("red-rooster", "炎羽雏", "fire", 1, "先手攻击", "速度、攻击", stats(30, 12, 5, 14, 8), ["fire-basic", "ember-peck"]),
  pet("magma-turtle", "烬角狼", "fire", 2, "爆发输出", "攻击、速度、暴击", stats(56, 24, 12, 21, 15), ["fire-basic", "cinder-horn-rush", "chasing-bite"]),
  pet("blaze-panther", "熔甲虫", "fire", 2, "重甲反击", "HP、防御、攻击", stats(68, 18, 19, 10, 13), ["fire-basic", "molten-shell", "ground-fire"]),
  pet("tinder-deer", "炎角羊", "fire", 2, "稳定前排", "HP、攻击、防御", stats(64, 21, 16, 13, 12), ["fire-basic", "flame-horn", "heatwave-command"]),
  pet("flame-crown-drake", "烈鬃狮", "fire", 3, "单体爆发", "攻击、暴击、速度", stats(92, 38, 21, 28, 25), ["fire-basic", "blazing-mane-bite", "royal-fire-chase"]),
  pet("volcano-rhino", "火山岩犀", "fire", 3, "重装群攻", "HP、攻击、防御", stats(106, 34, 30, 18, 20), ["fire-basic", "volcanic-charge", "lava-burst"]),
  pet("scorch-phoenix", "赤焰神凰", "fire", 4, "神兽爆发", "攻击、速度、暴击", stats(116, 42, 26, 34, 32), ["fire-basic", "phoenix-flare-wheel", "divine-meteor-flame"]),

  pet("bubble-dolphin", "贝爪獭", "water", 1, "回复入门", "HP、暴击", stats(38, 8, 7, 8, 12), ["water-basic", "shellspring-heal"]),
  pet("tide-crab", "泡伞灵", "water", 1, "状态干扰", "暴击、速度", stats(32, 8, 6, 11, 14), ["water-basic", "jelly-tentacle"]),
  pet("bluefin-rabbit", "珊芽龟", "water", 1, "防御型", "防御、HP", stats(43, 8, 12, 5, 8), ["water-basic", "coral-shell"]),
  pet("mist-frog", "泡吻海豹", "water", 1, "均衡输出", "HP、攻击", stats(37, 11, 8, 8, 9), ["water-basic", "bubble-kiss-slap"]),
  pet("coral-turtle", "潮冠海马", "water", 2, "控制治疗", "速度、暴击", stats(56, 17, 13, 20, 21), ["water-basic", "tidecrest-lance", "returning-tide-song"]),
  pet("brook-cat", "浪纹幼兽", "water", 2, "速度输出", "攻击、速度", stats(55, 23, 12, 22, 16), ["water-basic", "wave-pattern-pounce", "rapid-current-chase"]),
  pet("wave-otter", "晶钳蟹", "water", 2, "防御破甲", "防御、HP、暴击", stats(68, 17, 20, 10, 19), ["water-basic", "crystal-pincer", "foam-wall"]),
  pet("crystal-whale", "蓝潮鲸", "water", 3, "群体治疗", "HP、防御、暴击", stats(112, 26, 27, 18, 34), ["water-basic", "whale-tide-press", "blue-tide-revive"]),
  pet("deep-tide-jiao", "霜鳍鲨", "water", 3, "控速输出", "攻击、速度、暴击", stats(92, 34, 22, 32, 30), ["water-basic", "frost-fin-cut", "cold-current-flow"]),
  pet("moon-bay-mer", "沧澜海龙", "water", 4, "神兽控场", "HP、暴击、速度", stats(120, 34, 29, 32, 38), ["water-basic", "azure-dragon-breath", "sea-god-tide"]),

  pet("grass-mouse", "芽角鹿", "forest", 1, "高速缠绕", "速度、防御", stats(33, 8, 7, 13, 11), ["forest-basic", "sprout-antler"]),
  pet("moss-turtle", "苔旋蜗", "forest", 1, "低速高防", "防御、HP", stats(42, 7, 12, 5, 8), ["forest-basic", "moss-shell-guard"]),
  pet("flower-deer", "花刺团", "forest", 1, "防御反击", "防御、暴击", stats(36, 9, 10, 8, 12), ["forest-basic", "flower-spine-roll"]),
  pet("leaf-monkey", "蘑耳兔", "forest", 1, "回复辅助", "速度、防御", stats(34, 8, 8, 11, 11), ["forest-basic", "mushroom-umbrella-heal"]),
  pet("vine-bear", "藤尾麟", "forest", 2, "高速控制", "速度、防御", stats(56, 18, 14, 22, 15), ["forest-basic", "vine-tail-lock", "forest-step"]),
  pet("honeybud-fox", "苔甲龟", "forest", 2, "团队守护", "防御、HP", stats(70, 15, 21, 10, 15), ["forest-basic", "moss-armor-wall", "root-regrowth"]),
  pet("thorn-panther", "叶冠雀", "forest", 2, "快速辅助", "速度、攻击", stats(54, 20, 13, 23, 14), ["forest-basic", "flying-leaf-cut", "pollen-drift"]),
  pet("ancient-stag", "枝冠鹿王", "forest", 3, "团队续航", "防御、速度、HP", stats(104, 27, 28, 25, 32), ["forest-basic", "crown-shelter", "ancient-forest-revival"]),
  pet("jade-eagle", "苔岭熊", "forest", 3, "压制前排", "HP、防御、攻击", stats(112, 35, 30, 19, 22), ["forest-basic", "moss-ridge-stomp", "forest-armor-command"]),
  pet("forest-giant-bear", "森环神鹿", "forest", 4, "神兽续航", "防御、速度、HP", stats(122, 32, 34, 31, 34), ["forest-basic", "myriad-leaf-wheel", "divine-forest-revive"]),

  pet("stone-rat", "沙尾狐", "earth", 1, "破甲入门", "攻击、速度", stats(34, 12, 8, 11, 6), ["earth-basic", "sand-tail-sweep"]),
  pet("sand-lizard", "岩甲穿山", "earth", 1, "防御型", "防御、HP", stats(42, 8, 12, 5, 7), ["earth-basic", "rolled-armor"]),
  pet("round-rock-sheep", "泥团熊", "earth", 1, "耐久输出", "HP、攻击", stats(40, 11, 10, 6, 7), ["earth-basic", "mud-paw-slam"]),
  pet("copper-bug", "陶耳鼠", "earth", 1, "降速干扰", "防御、速度", stats(36, 8, 10, 10, 8), ["earth-basic", "clay-bell-quake"]),
  pet("rock-horn-bull", "岩背狼", "earth", 2, "攻防战士", "攻击、防御、HP", stats(66, 22, 18, 12, 11), ["earth-basic", "rockback-raid", "shatter-howl"]),
  pet("sand-pattern-cat", "沙舟驼", "earth", 2, "团队承伤", "HP、防御", stats(72, 16, 21, 9, 12), ["earth-basic", "camel-bell-earth", "sandship-wall"]),
  pet("stone-shield-ape", "晶岩蟾", "earth", 2, "护盾干扰", "防御、HP、暴击", stats(64, 17, 20, 11, 18), ["earth-basic", "crystal-spike", "rockbreath-barrier"]),
  pet("ridge-giant-turtle", "岩铠牦牛", "earth", 3, "高防冲锋", "HP、防御、攻击", stats(112, 34, 31, 18, 20), ["earth-basic", "rock-armor-charge", "mountain-stance"]),
  pet("meteor-lion", "丘甲巨龟", "earth", 3, "团队防御", "HP、防御", stats(118, 28, 34, 16, 24), ["earth-basic", "hill-armor-press", "earth-greatwall"]),
  pet("ancient-golem", "玄岩神将", "earth", 4, "神兽坦克", "HP、防御、攻击", stats(130, 36, 40, 18, 28), ["earth-basic", "black-rock-array", "divine-mountain-guard"]),

  pet("wind-chime-sparrow", "云绒羊", "wind", 1, "轻盾辅助", "HP、速度", stats(34, 8, 7, 11, 10), ["wind-basic", "cloud-wool-guard"]),
  pet("cloud-rabbit", "霜羽狐", "wind", 1, "速度输出", "速度、攻击", stats(30, 13, 5, 14, 8), ["wind-basic", "frostwind-claw"]),
  pet("spin-dragonfly", "风羽雀", "wind", 1, "先手攻击", "速度、暴击", stats(30, 10, 6, 14, 12), ["wind-basic", "wind-feather-peck"]),
  pet("light-feather-cat", "风囊鼬", "wind", 1, "机动突击", "速度、攻击", stats(32, 12, 6, 13, 9), ["wind-basic", "glide-strike"]),
  pet("gale-wolf", "卷云兔", "wind", 2, "速度爆发", "攻击、速度", stats(54, 22, 11, 23, 15), ["wind-basic", "cloudcurl-leap", "tailwind-step"]),
  pet("white-feather-deer", "羽角鹿", "wind", 2, "团队辅助", "速度、暴击", stats(58, 16, 14, 22, 21), ["wind-basic", "feather-antler", "spiral-feather-veil"]),
  pet("swift-weasel", "岚爪兽", "wind", 2, "连击输出", "攻击、速度", stats(52, 24, 11, 23, 14), ["wind-basic", "storm-claw-combo", "formation-rush"]),
  pet("sky-thunder-vulture", "苍羽鹰", "wind", 3, "高速压制", "攻击、速度、暴击", stats(88, 36, 20, 36, 26), ["wind-basic", "azure-dive", "skywind-dance"]),
  pet("cloud-kirin", "云牙狼", "wind", 3, "团队加速", "速度、防御、攻击", stats(96, 30, 24, 34, 30), ["wind-basic", "cloudfang-gale", "high-sky-tailwind"]),
  pet("storm-griffin", "天岚神龙", "wind", 4, "神兽机动", "速度、攻击、暴击", stats(110, 40, 25, 42, 34), ["wind-basic", "sky-gale-dragonroll", "divine-wind-judgment"])
];

export const STARTER_SPECIES_IDS = ["fire-lizard", "bubble-dolphin", "grass-mouse", "stone-rat", "wind-chime-sparrow"];

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
  3: PETS.filter((petItem) => petItem.growthLevel === 3),
  4: PETS.filter((petItem) => petItem.growthLevel === 4)
};
