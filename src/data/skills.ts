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

export const SKILLS: Skill[] = [
  {
    id: "spark-hit",
    name: "火星撞击",
    element: "fire",
    category: "attack",
    apCost: 1,
    target: "enemy",
    power: 8,
    multiplier: 0.95,
    status: { id: "burn", chance: 0.2, turns: 2 },
    description: "单体小伤害，概率灼烧"
  },
  {
    id: "ember-claw",
    name: "炽爪",
    element: "fire",
    category: "attack",
    apCost: 1,
    target: "enemy",
    power: 12,
    multiplier: 1.05,
    description: "单体中等伤害，目标灼烧时更强"
  },
  {
    id: "heat-guard",
    name: "热浪护体",
    element: "fire",
    category: "defense",
    apCost: 1,
    target: "self",
    shield: 12,
    buff: { id: "guard", turns: 2, value: 12 },
    description: "自身获得守护"
  },
  {
    id: "flame-chase",
    name: "烈焰追击",
    element: "fire",
    category: "attack",
    apCost: 2,
    target: "enemy",
    power: 18,
    multiplier: 1.25,
    description: "单体高伤害，低血目标伤害提高"
  },
  {
    id: "volcano-call",
    name: "火山号令",
    element: "fire",
    category: "support",
    apCost: 2,
    target: "allAllies",
    buff: { id: "haste", turns: 2, value: 0.15 },
    description: "全队获得进攻节奏"
  },
  {
    id: "meteor-flame",
    name: "陨火爆裂",
    element: "fire",
    category: "attack",
    apCost: 3,
    target: "allEnemies",
    power: 16,
    multiplier: 0.95,
    status: { id: "burn", chance: 0.35, turns: 2 },
    description: "敌方全体伤害，概率灼烧"
  },
  {
    id: "water-shot",
    name: "水珠弹",
    element: "water",
    category: "attack",
    apCost: 1,
    target: "enemy",
    power: 7,
    multiplier: 0.9,
    status: { id: "slick", chance: 0.2, turns: 2, value: 0.2 },
    description: "单体小伤害，概率湿滑"
  },
  {
    id: "tide-slam",
    name: "潮汐拍击",
    element: "water",
    category: "attack",
    apCost: 1,
    target: "enemy",
    power: 11,
    multiplier: 1,
    description: "单体中等伤害"
  },
  {
    id: "spring-heal",
    name: "清泉疗愈",
    element: "water",
    category: "heal",
    apCost: 1,
    target: "ally",
    heal: 12,
    multiplier: 0.8,
    description: "治疗我方单体"
  },
  {
    id: "bubble-barrier",
    name: "泡沫屏障",
    element: "water",
    category: "defense",
    apCost: 2,
    target: "ally",
    shield: 18,
    buff: { id: "guard", turns: 2, value: 18 },
    description: "我方单体获得守护"
  },
  {
    id: "deep-silence",
    name: "深海静默",
    element: "water",
    category: "support",
    apCost: 2,
    target: "allEnemies",
    status: { id: "slick", chance: 1, turns: 2, value: 0.25 },
    description: "敌方全体降速"
  },
  {
    id: "sea-revive",
    name: "海潮复苏",
    element: "water",
    category: "heal",
    apCost: 3,
    target: "allAllies",
    heal: 18,
    multiplier: 0.9,
    description: "我方全体恢复"
  },
  {
    id: "leaf-blade",
    name: "叶刃",
    element: "forest",
    category: "attack",
    apCost: 1,
    target: "enemy",
    power: 8,
    multiplier: 0.95,
    description: "单体小伤害"
  },
  {
    id: "vine-bind",
    name: "藤蔓缠击",
    element: "forest",
    category: "attack",
    apCost: 1,
    target: "enemy",
    power: 9,
    multiplier: 0.85,
    status: { id: "bind", chance: 0.25, turns: 1, value: 0.3 },
    description: "单体伤害，概率缠绕"
  },
  {
    id: "sprout",
    name: "芽生",
    element: "forest",
    category: "heal",
    apCost: 1,
    target: "self",
    buff: { id: "regen", turns: 2, value: 0.08 },
    description: "自身进入再生"
  },
  {
    id: "pollen-guard",
    name: "花粉守护",
    element: "forest",
    category: "defense",
    apCost: 2,
    target: "ally",
    shield: 16,
    buff: { id: "guard", turns: 2, value: 16 },
    description: "我方单体获得守护"
  },
  {
    id: "forest-echo",
    name: "林地回响",
    element: "forest",
    category: "heal",
    apCost: 2,
    target: "allAllies",
    buff: { id: "regen", turns: 2, value: 0.08 },
    description: "我方全体再生"
  },
  {
    id: "ancient-judgment",
    name: "古树裁决",
    element: "forest",
    category: "attack",
    apCost: 3,
    target: "enemy",
    power: 24,
    multiplier: 1.35,
    status: { id: "armorBreak", chance: 0.65, turns: 2, value: 0.25 },
    description: "单体高伤害，概率破甲"
  },
  {
    id: "rock-chip",
    name: "碎石击",
    element: "earth",
    category: "attack",
    apCost: 1,
    target: "enemy",
    power: 9,
    multiplier: 0.9,
    status: { id: "armorBreak", chance: 0.15, turns: 2, value: 0.25 },
    description: "单体小伤害，概率破甲"
  },
  {
    id: "sand-slap",
    name: "沙尘扑击",
    element: "earth",
    category: "attack",
    apCost: 1,
    target: "enemy",
    power: 8,
    multiplier: 0.85,
    status: { id: "slick", chance: 0.2, turns: 2, value: 0.15 },
    description: "单体伤害，降低节奏"
  },
  {
    id: "rock-armor",
    name: "岩甲",
    element: "earth",
    category: "defense",
    apCost: 1,
    target: "self",
    buff: { id: "stoneArmor", turns: 2, value: 0.25 },
    description: "自身获得石甲"
  },
  {
    id: "earth-charge",
    name: "地裂冲锋",
    element: "earth",
    category: "attack",
    apCost: 2,
    target: "enemy",
    power: 18,
    multiplier: 1.15,
    status: { id: "armorBreak", chance: 1, turns: 2, value: 0.25 },
    description: "单体中高伤害并破甲"
  },
  {
    id: "mountain-wall",
    name: "群山壁垒",
    element: "earth",
    category: "defense",
    apCost: 2,
    target: "allAllies",
    buff: { id: "stoneArmor", turns: 2, value: 0.2 },
    description: "我方全体减伤"
  },
  {
    id: "meteor-quake",
    name: "陨岩震荡",
    element: "earth",
    category: "attack",
    apCost: 3,
    target: "allEnemies",
    power: 15,
    multiplier: 1,
    status: { id: "slick", chance: 0.25, turns: 2, value: 0.2 },
    description: "敌方全体伤害，概率降速"
  },
  {
    id: "wind-blade",
    name: "风刃",
    element: "wind",
    category: "attack",
    apCost: 1,
    target: "enemy",
    power: 8,
    multiplier: 0.95,
    description: "单体小伤害，速度压制时更强"
  },
  {
    id: "quick-peck",
    name: "迅捷啄击",
    element: "wind",
    category: "attack",
    apCost: 1,
    target: "enemy",
    power: 10,
    multiplier: 0.9,
    description: "快速单体伤害"
  },
  {
    id: "tailwind",
    name: "顺风",
    element: "wind",
    category: "support",
    apCost: 1,
    target: "ally",
    buff: { id: "haste", turns: 2, value: 0.3 },
    description: "我方单体获得疾风"
  },
  {
    id: "cyclone-veil",
    name: "旋风护幕",
    element: "wind",
    category: "defense",
    apCost: 2,
    target: "allAllies",
    shield: 10,
    buff: { id: "guard", turns: 1, value: 10 },
    description: "我方全体获得轻护盾"
  },
  {
    id: "break-rush",
    name: "破阵疾袭",
    element: "wind",
    category: "attack",
    apCost: 2,
    target: "enemy",
    power: 18,
    multiplier: 1.2,
    description: "单体高伤害，偏向终结"
  },
  {
    id: "sky-dance",
    name: "天风连舞",
    element: "wind",
    category: "attack",
    apCost: 3,
    target: "allEnemies",
    power: 13,
    multiplier: 0.95,
    buff: { id: "haste", turns: 2, value: 0.2 },
    description: "连续风刃并提速"
  }
];

export const getSkill = (id: string): Skill => {
  const skill = SKILLS.find((item) => item.id === id);
  if (!skill) {
    throw new Error(`Unknown skill: ${id}`);
  }
  return skill;
};
