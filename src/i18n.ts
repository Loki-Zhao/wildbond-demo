import { PETS } from "./data/pets";
import { SKILLS } from "./data/skills";
import type { ElementType, GrowthLevel, Skill, StatusId } from "./game/types";

export type Language = "zh" | "ja";

export const LANGUAGE_STORAGE_KEY = "wildbond-demo-language";

export const readStoredLanguage = (): Language => {
  if (typeof window === "undefined") return "zh";
  try {
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === "ja" ? "ja" : "zh";
  } catch {
    return "zh";
  }
};

export const writeStoredLanguage = (language: Language): void => {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Keep the current in-memory language if storage is unavailable.
  }
};

const uiJa: Record<string, string> = {
  appTitle: "原野契約",
  demoVersion: "Demo v0.1",
  language: "言語",
  chinese: "中文",
  japanese: "日本語",
  save: "保存",
  reset: "最初から",
  party: "編成",
  storage: "倉庫",
  fusion: "合成",
  dex: "図鑑",
  maps: "マップ",
  captureStone: "捕獲石",
  healingFruit: "治療の実",
  crystal: "分解結晶",
  heal: "回復",
  enhance: "強化",
  maxEnhance: "強化上限",
  decompose: "分解",
  partyCannotDecompose: "出撃中のペットは分解できません",
  store: "預ける",
  deploy: "出撃",
  emptyStorage: "倉庫は空です。",
  starterPrompt: "最初の相棒を選んでください。",
  fusionHint: "同じ進化段階の Lv10 ペットを2体選択。初期体80%、進化体50%で成功し、失敗時は素材2体がLv1の1体になります。",
  canFuse: "合成できます。",
  confirmFusion: "合成する",
  unknown: "未発見",
  unknownEcology: "未知の生態",
  ownedProgress: "発見",
  initialFusion: "初期体合成",
  evolvedFusion: "進化体合成",
  done: "完了",
  notDone: "未完了",
  bossDefeated: "首領撃破済み",
  explorable: "探索可能",
  returnHome: "帰還",
  campHeal: "キャンプ回復",
  gameGuide: "遊び方",
  challengeBoss: "首領強化挑戦",
  bossChallengeLocked: "初回クリア後に解放",
  bossChallengeComplete: "強化挑戦完了",
  bossChallengeTitle: "首領強化挑戦 +{level}/{max}",
  bossBattle: "首領戦",
  wildBattle: "暗雷戦闘",
  wildPetsAppeared: "野生ペットが現れた",
  mapBossAppeared: "地図の首領が現れた",
  enhancedBossAppeared: "強化された首領が現れた",
  round: "第 {round} ターン",
  allyLine: "味方陣",
  enemyLine: "野生陣",
  boss: "首領",
  acted: "行動済み",
  stable: "安定",
  defense: "防御",
  damageOneThird: "被ダメ1/3",
  defenseTitle: "このターンは攻撃せず、受けるダメージを1/3にする",
  defeatTitle: "戦闘不能",
  defeatDetail: "編成は戦闘を続けられません。キャンプへ撤退します。",
  returnCamp: "キャンプへ戻る",
  chooseEnemyTarget: "敵の対象を選択",
  chooseAllyTarget: "味方の対象を選択",
  capture: "捕獲",
  endRound: "ターン終了",
  run: "逃走",
  runTitle: "逃走",
  currentTurn: "行動順",
  enemyActing: "敵が行動中",
  chooseAction: "行動を選択",
  close: "閉じる",
  dexDetail: "詳細を見る",
  baseLv1: "Lv1 基礎",
  baseLv10: "Lv10 基礎",
  hp: "HP",
  attack: "攻",
  defenseStat: "防",
  speed: "速",
  crit: "会心",
  exp: "経験",
  maxLevelFusion: "Lv10 上限、合成可能",
  elementDomain: "{element}域",
  unlockedMeadow: "初期開放",
  unlockedCoast: "青芽草原の首領を撃破",
  unlockedVolcano: "初期体合成を1回完了",
  unlockedCanyon: "潮汐海岸と赤砂火山の首領を撃破",
  unlockedHighland: "進化体合成を1回完了し岩牙峡谷の首領を撃破"
};

export const t = (language: Language, key: string, params: Record<string, string | number> = {}): string => {
  if (language === "zh") {
    const zh: Record<string, string> = {
      appTitle: "原野契约",
      demoVersion: "Demo v0.1",
      language: "语言",
      chinese: "中文",
      japanese: "日本語",
      save: "保存",
      reset: "重新开始",
      party: "队伍",
      storage: "仓库",
      fusion: "合成",
      dex: "图鉴",
      maps: "地图",
      captureStone: "捕获石",
      healingFruit: "治疗果",
      crystal: "分解水晶",
      heal: "治疗",
      enhance: "强化",
      maxEnhance: "强化上限",
      decompose: "分解",
      partyCannotDecompose: "出战中的宠物不可分解",
      store: "入库",
      deploy: "出战",
      emptyStorage: "仓库为空。",
      starterPrompt: "选择第一位同行伙伴。",
      fusionHint: "选择两只同阶段 Lv10 宠物。初始体成功率80%，进化体成功率50%；失败时两只材料会变为其中一只Lv1。",
      canFuse: "可以合成。",
      confirmFusion: "确认合成",
      unknown: "未发现",
      unknownEcology: "未知生态",
      ownedProgress: "已发现",
      initialFusion: "初始体合成",
      evolvedFusion: "进化体合成",
      done: "完成",
      notDone: "未完成",
      bossDefeated: "首领已击败",
      explorable: "可探索",
      returnHome: "一键回城",
      campHeal: "营地恢复",
      gameGuide: "游戏方式说明",
      challengeBoss: "首领强化挑战",
      bossChallengeLocked: "首次通关当前地图后解锁",
      bossChallengeComplete: "强化挑战完成",
      bossChallengeTitle: "首领强化挑战 +{level}/{max}",
      bossBattle: "首领战",
      wildBattle: "暗雷战斗",
      wildPetsAppeared: "野生宠物出现了",
      mapBossAppeared: "地图首领出现了",
      enhancedBossAppeared: "强化过的首领出现了",
      round: "第 {round} 回合",
      allyLine: "我方阵线",
      enemyLine: "野外阵线",
      boss: "首领",
      acted: "已行动",
      stable: "稳定",
      defense: "防御",
      damageOneThird: "伤害1/3",
      defenseTitle: "本回合不攻击，受到伤害降低到 1/3",
      defeatTitle: "队伍战败",
      defeatDetail: "出战宠物已经无法继续战斗，需要撤回营地恢复。",
      returnCamp: "返回营地",
      chooseEnemyTarget: "选择敌方目标",
      chooseAllyTarget: "选择我方目标",
      capture: "捕获",
      endRound: "结束回合",
      run: "逃跑",
      runTitle: "逃跑",
      currentTurn: "当前行动",
      enemyActing: "敌方行动中",
      chooseAction: "选择行动",
      close: "关闭",
      dexDetail: "查看详情",
      baseLv1: "Lv1 基础",
      baseLv10: "Lv10 基础",
      hp: "HP",
      attack: "攻",
      defenseStat: "防",
      speed: "速",
      crit: "暴击",
      exp: "经验",
      maxLevelFusion: "Lv10 已满，可参与合成",
      elementDomain: "{element}域",
      unlockedMeadow: "初始开放",
      unlockedCoast: "击败青芽草原首领",
      unlockedVolcano: "完成一次初始体合成",
      unlockedCanyon: "击败潮汐海岸与赤砂火山首领",
      unlockedHighland: "完成一次进化体合成并击败岩牙峡谷首领"
    };
    return format(zh[key] ?? key, params);
  }
  return format(uiJa[key] ?? key, params);
};

const replaceText = (value: string, from: string, to: string): string => value.split(from).join(to);

const format = (value: string, params: Record<string, string | number>): string =>
  Object.entries(params).reduce((text, [key, param]) => replaceText(text, `{${key}}`, String(param)), value);

const elementJa: Record<ElementType, string> = {
  fire: "火",
  water: "水",
  forest: "森",
  earth: "土",
  wind: "風"
};

const growthJa: Record<GrowthLevel, string> = {
  1: "初期体",
  2: "進化体",
  3: "完全体"
};

const statusJa: Record<StatusId, string> = {
  burn: "火傷",
  slick: "湿滑",
  bind: "絡みつき",
  stoneArmor: "岩甲",
  armorBreak: "防御低下",
  haste: "疾風",
  regen: "再生",
  guard: "守護",
  defending: "防御中"
};

const mapJa: Record<string, string> = {
  meadow: "青芽草原",
  coast: "潮汐海岸",
  volcano: "赤砂火山",
  canyon: "岩牙峡谷",
  highland: "風鳴高地"
};

const bossJa: Record<string, string> = {
  meadow: "古木鹿王の幻影",
  coast: "深潮蛟の幻影",
  volcano: "火山巨犀の幻影",
  canyon: "古岩魔像の幻影",
  highland: "風暴獅鷲の幻影"
};

const petJa: Record<string, string> = {
  "fire-lizard": "火花トカゲ",
  "coal-pig": "炭鼻ブタ",
  "lamp-fox": "灯尾キツネ",
  "red-rooster": "赤羽ニワトリ",
  "magma-turtle": "熔甲カメ",
  "blaze-panther": "烈牙ヒョウ",
  "tinder-deer": "火綿シカ",
  "flame-crown-drake": "炎冠竜",
  "volcano-rhino": "火山巨犀",
  "scorch-phoenix": "灼翼凰",
  "bubble-dolphin": "泡泡イルカ",
  "tide-crab": "潮殻カニ",
  "bluefin-rabbit": "青ヒレウサギ",
  "mist-frog": "霧眼カエル",
  "coral-turtle": "珊瑚カメ",
  "brook-cat": "渓影ネコ",
  "wave-otter": "浪牙カワウソ",
  "crystal-whale": "海晶クジラ",
  "deep-tide-jiao": "深潮蛟",
  "moon-bay-mer": "月湾マーメル",
  "grass-mouse": "草団ネズミ",
  "moss-turtle": "苔背カメ",
  "flower-deer": "花耳シカ",
  "leaf-monkey": "葉尾サル",
  "vine-bear": "藤甲クマ",
  "honeybud-fox": "蜜芽キツネ",
  "thorn-panther": "荊棘ヒョウ",
  "ancient-stag": "古木鹿王",
  "jade-eagle": "翠冠ワシ",
  "forest-giant-bear": "森霊巨熊",
  "stone-rat": "石牙ネズミ",
  "sand-lizard": "砂背トカゲ",
  "round-rock-sheep": "丸岩ヒツジ",
  "copper-bug": "銅殻ムシ",
  "rock-horn-bull": "岩角ウシ",
  "sand-pattern-cat": "砂紋ネコ",
  "stone-shield-ape": "石盾サル",
  "ridge-giant-turtle": "山脊巨亀",
  "meteor-lion": "隕石ライオン",
  "ancient-golem": "古岩ゴーレム",
  "wind-chime-sparrow": "風鈴スズメ",
  "cloud-rabbit": "雲尾ウサギ",
  "spin-dragonfly": "旋葉トンボ",
  "light-feather-cat": "軽羽ネコ",
  "gale-wolf": "嵐翼オオカミ",
  "white-feather-deer": "白羽シカ",
  "swift-weasel": "疾風イタチ",
  "sky-thunder-vulture": "天鳴ハゲワシ",
  "cloud-kirin": "雲嵐麒麟",
  "storm-griffin": "風暴グリフォン"
};

const skillJa: Record<string, string> = {
  "fire-basic": "火苗撃",
  "water-basic": "水花撃",
  "forest-basic": "葉芽撃",
  "earth-basic": "礫石撃",
  "wind-basic": "微風撃",
  "spark-hit": "火花突撃",
  "ember-claw": "熾爪",
  "heat-guard": "熱波ガード",
  "flame-chase": "烈火追撃",
  "volcano-call": "火山号令",
  "meteor-flame": "隕火爆裂",
  "water-shot": "水珠弾",
  "tide-slam": "潮汐打撃",
  "spring-heal": "清泉癒し",
  "bubble-barrier": "泡沫バリア",
  "deep-silence": "深海沈黙",
  "sea-revive": "海潮再生",
  "leaf-blade": "葉刃",
  "vine-bind": "蔓絡み",
  sprout: "芽生え",
  "pollen-guard": "花粉守護",
  "forest-echo": "森の反響",
  "ancient-judgment": "古樹裁き",
  "rock-chip": "砕石撃",
  "sand-slap": "砂塵叩き",
  "rock-armor": "岩甲",
  "earth-charge": "地裂突進",
  "mountain-wall": "群山壁",
  "meteor-quake": "隕岩震動",
  "wind-blade": "風刃",
  "quick-peck": "迅速つつき",
  tailwind: "追い風",
  "cyclone-veil": "旋風ヴェール",
  "break-rush": "破陣疾襲",
  "sky-dance": "天風連舞"
};

const skillDescJa: Record<string, string> = {
  "fire-basic": "基礎火属性攻撃。APを消費しない",
  "water-basic": "基礎水属性攻撃。APを消費しない",
  "forest-basic": "基礎森属性攻撃。APを消費しない",
  "earth-basic": "基礎土属性攻撃。APを消費しない",
  "wind-basic": "基礎風属性攻撃。APを消費しない",
  "spark-hit": "単体ダメージ、確率で火傷",
  "ember-claw": "単体中高ダメージ、火傷中の対象に強い",
  "heat-guard": "自身に火炎の守護を付与",
  "flame-chase": "単体高ダメージ、低HP対象に追加ダメージ",
  "volcano-call": "敵全体に火炎ダメージ、確率で火傷",
  "meteor-flame": "敵全体に高ダメージ、確率で火傷",
  "water-shot": "単体ダメージ、確率で湿滑",
  "tide-slam": "単体安定ダメージ",
  "spring-heal": "味方単体を回復。回復量は使用者の攻撃に影響される",
  "bubble-barrier": "味方単体に泡の守護を付与",
  "deep-silence": "敵全体の速度を下げる",
  "sea-revive": "味方全体を回復。回復量は使用者の攻撃に影響される",
  "leaf-blade": "単体安定ダメージ",
  "vine-bind": "単体ダメージ、確率で絡みつき",
  sprout: "自身を少量回復し、再生を付与",
  "pollen-guard": "味方単体に強い守護を付与",
  "forest-echo": "味方全体を回復し、再生を付与",
  "ancient-judgment": "単体ダメージ、確率で防御低下",
  "rock-chip": "単体ダメージ、確率で防御低下",
  "sand-slap": "単体ダメージ、行動テンポを下げる",
  "rock-armor": "自身に岩甲を付与",
  "earth-charge": "単体ダメージ、防御低下を付与",
  "mountain-wall": "味方全体に岩甲の被ダメ軽減を付与",
  "meteor-quake": "敵全体ダメージ、確率で速度低下",
  "wind-blade": "単体小ダメージ、速度優位なら強化",
  "quick-peck": "素早い単体ダメージ",
  tailwind: "味方単体に疾風を付与",
  "cyclone-veil": "味方全体に軽い守護を付与",
  "break-rush": "単体高ダメージ、防御低下を付与。決定打向き",
  "sky-dance": "連続風刃で攻撃し加速"
};

const roleJa: Record<string, string> = {
  "单体输出": "単体火力",
  "稳定前排": "安定前衛",
  "灼烧骚扰": "火傷妨害",
  "快速收割": "高速フィニッシャー",
  "防御反伤": "防御反撃",
  "高速爆发": "高速バースト",
  "团队增益": "チーム強化",
  "终局爆发": "終盤バースト",
  "重装压制": "重装圧制",
  "群体输出": "全体火力",
  "新手回复胚子": "回復入門",
  "防御型": "防御型",
  "控速型": "速度制御",
  "状态干扰": "状態妨害",
  "守护治疗": "守護回復",
  "控速输出": "速度制御火力",
  "均衡战士": "バランス戦士",
  "团队治疗": "チーム回復",
  "群体控制": "全体制御",
  "辅助核心": "支援コア",
  "快速缠绕": "高速絡み",
  "低阶肉盾": "低階タンク",
  "回复胚子": "回復素質",
  "敏捷输出": "敏捷火力",
  "前排守护": "前衛守護",
  "回复辅助": "回復支援",
  "缠绕输出": "絡み火力",
  "团队续航": "チーム継戦",
  "高速辅助": "高速支援",
  "压制前排": "前衛圧制",
  "破甲入门": "防御低下入門",
  "干扰": "妨害",
  "防御胚子": "防御素質",
  "重击前排": "重撃前衛",
  "命中干扰": "命中妨害",
  "坦克": "タンク",
  "团队防御": "チーム防御",
  "破甲输出": "防御低下火力",
  "首领型坦克": "首領級タンク",
  "新手高速": "高速入門",
  "先手攻击": "先手攻撃",
  "闪避胚子": "回避素質",
  "快速输出": "高速火力",
  "速度核心": "速度コア",
  "团队辅助": "チーム支援",
  "连击输出": "連撃火力",
  "先手压制": "先手圧制",
  "高速终结": "高速フィニッシュ"
};

const statFocusJa: Record<string, string> = {
  "攻击、速度": "攻撃・速度",
  "HP、攻击": "HP・攻撃",
  "速度、暴击": "速度・会心",
  "HP、防御": "HP・防御",
  "防御、HP": "防御・HP",
  "防御、速度": "防御・速度",
  "防御、速度、HP": "防御・速度・HP",
  "速度、防御、攻击": "速度・防御・攻撃",
  "防御、HP、攻击": "防御・HP・攻撃",
  "HP、防御、攻击": "HP・防御・攻撃",
  "攻击、HP": "攻撃・HP",
  "攻击、速度、暴击": "攻撃・速度・会心",
  "HP、暴击": "HP・会心",
  "防御、暴击": "防御・会心",
  "速度、攻击": "速度・攻撃",
  "攻击、防御、HP": "攻撃・防御・HP",
  "暴击、速度": "会心・速度",
  "暴击、速度、防御": "会心・速度・防御",
  "暴击、速度、HP": "会心・速度・HP",
  "速度、暴击、攻击": "速度・会心・攻撃",
  "HP、攻击、防御": "HP・攻撃・防御",
  "速度、防御": "速度・防御",
  "HP、防御、暴击": "HP・防御・会心"
};

export const elementLabel = (language: Language, element: ElementType): string =>
  language === "ja" ? elementJa[element] : ({ fire: "火", water: "水", forest: "森", earth: "土", wind: "风" } as Record<ElementType, string>)[element];

export const growthLabel = (language: Language, growth: GrowthLevel): string =>
  language === "ja" ? growthJa[growth] : ({ 1: "初始体", 2: "进化体", 3: "完全体" } as Record<GrowthLevel, string>)[growth];

export const statusLabel = (language: Language, id: StatusId, fallback: string): string =>
  language === "ja" ? statusJa[id] : fallback;

export const mapName = (language: Language, id: string, fallback: string): string =>
  language === "ja" ? mapJa[id] ?? fallback : fallback;

export const bossName = (language: Language, mapId: string, fallback: string): string =>
  language === "ja" ? bossJa[mapId] ?? fallback : fallback;

export const petName = (language: Language, id: string, fallback: string): string =>
  language === "ja" ? petJa[id] ?? fallback : fallback;

export const skillName = (language: Language, id: string, fallback: string): string =>
  language === "ja" ? skillJa[id] ?? fallback : fallback;

export const skillDescription = (language: Language, id: string, fallback: string): string =>
  language === "ja" ? skillDescJa[id] ?? fallback : fallback;

const targetText = (language: Language, target: Skill["target"]): string => {
  const zh: Record<Skill["target"], string> = {
    enemy: "敌方单体",
    ally: "我方单体",
    self: "自身",
    allEnemies: "敌方全体",
    allAllies: "我方全体"
  };
  const ja: Record<Skill["target"], string> = {
    enemy: "敵単体",
    ally: "味方単体",
    self: "自身",
    allEnemies: "敵全体",
    allAllies: "味方全体"
  };
  return language === "ja" ? ja[target] : zh[target];
};

export const skillTooltip = (language: Language, skill: Skill): string => {
  const name = skillName(language, skill.id, skill.name);
  const description = skillDescription(language, skill.id, skill.description);
  const parts: string[] = [];
  if (language === "ja") {
    parts.push(`${name} / ${skill.apCost} AP / ${targetText(language, skill.target)}`);
    parts.push(description);
    if (skill.category === "attack" && skill.power) {
      parts.push(
        `ダメージ: 基礎${skill.power} + 攻撃x${skill.multiplier ?? 1} - 対象防御x0.6。属性有利120%、不利80%、会心時x1.5。`
      );
    }
    if (skill.category === "heal" && skill.heal) {
      parts.push(`回復: 基礎${skill.heal} + 使用者攻撃x${skill.multiplier ?? 0.45} + 対象最大HPの${skill.target === "allAllies" ? 10 : 16}%。`);
    }
    if (skill.shield) parts.push(`守護: 基礎${skill.shield} + 使用者防御x${skill.multiplier ?? 0.5} 分のダメージを吸収。`);
    if (skill.buff) parts.push(`付与: ${statusLabel(language, skill.buff.id, skill.buff.id)} ${skill.buff.turns}ターン。`);
    if (skill.status) parts.push(`追加効果: ${statusLabel(language, skill.status.id, skill.status.id)} ${Math.round(skill.status.chance * 100)}%、${skill.status.turns}ターン。`);
    return parts.join("\n");
  }
  parts.push(`${name} / ${skill.apCost} AP / ${targetText(language, skill.target)}`);
  parts.push(description);
  if (skill.category === "attack" && skill.power) {
    parts.push(`伤害：基础${skill.power} + 攻击x${skill.multiplier ?? 1} - 目标防御x0.6；属性优势120%，劣势80%；暴击时伤害x1.5。`);
  }
  if (skill.category === "heal" && skill.heal) {
    parts.push(`恢复：基础${skill.heal} + 施放者攻击x${skill.multiplier ?? 0.45} + 目标最大HP的${skill.target === "allAllies" ? 10 : 16}%。`);
  }
  if (skill.shield) parts.push(`守护：基础${skill.shield} + 施放者防御x${skill.multiplier ?? 0.5} 的伤害吸收。`);
  if (skill.buff) parts.push(`增益：${statusLabel(language, skill.buff.id, skill.buff.id)}，持续${skill.buff.turns}回合。`);
  if (skill.status) parts.push(`附加：${statusLabel(language, skill.status.id, skill.status.id)}，${Math.round(skill.status.chance * 100)}%概率，持续${skill.status.turns}回合。`);
  return parts.join("\n");
};

export const roleText = (language: Language, value: string): string => (language === "ja" ? roleJa[value] ?? value : value);

export const statFocusText = (language: Language, value: string): string =>
  language === "ja"
    ? statFocusJa[value] ??
      replaceText(replaceText(replaceText(replaceText(replaceText(value, "攻击", "攻撃"), "防御", "防御"), "速度", "速度"), "暴击", "会心"), "、", "・")
    : value;

export const fusionReason = (language: Language, reason?: string): string | undefined => {
  if (language === "zh" || !reason) return reason;
  const reasons: Record<string, string> = {
    "不能选择同一只宠物": "同じペットは選択できません",
    "需要同一进化阶段": "同じ進化段階が必要です",
    "完全体不可继续合成": "完全体はこれ以上合成できません",
    "两只宠物都需要达到 Lv10": "2体とも Lv10 が必要です",
    "合成对象不存在。": "合成対象が存在しません。",
    "无法合成。": "合成できません。"
  };
  return reasons[reason] ?? translateLog(language, reason);
};

const replaceKnownTerms = (text: string): string => {
  let next = text;
  const replacements: Array<[string, string]> = [
    ...PETS.map((pet): [string, string] => [pet.name, petJa[pet.id] ?? pet.name]),
    ...SKILLS.map((skill): [string, string] => [skill.name, skillJa[skill.id] ?? skill.name]),
    ["青芽草原", mapJa.meadow],
    ["潮汐海岸", mapJa.coast],
    ["赤砂火山", mapJa.volcano],
    ["岩牙峡谷", mapJa.canyon],
    ["风鸣高地", mapJa.highland],
    ["古木鹿王投影", bossJa.meadow],
    ["深潮蛟投影", bossJa.coast],
    ["火山巨犀投影", bossJa.volcano],
    ["古岩魔像投影", bossJa.canyon],
    ["风暴狮鹫投影", bossJa.highland],
    ["暴击", "会心"],
    ["效果拔群", "効果抜群"],
    ["效果较弱", "効果はいまひとつ"],
    ["正常命中", "通常命中"],
    ["灼烧", statusJa.burn],
    ["湿滑", statusJa.slick],
    ["缠绕", statusJa.bind],
    ["石甲", statusJa.stoneArmor],
    ["破甲", statusJa.armorBreak],
    ["疾风", statusJa.haste],
    ["再生", statusJa.regen],
    ["守护", statusJa.guard],
    ["防御中", statusJa.defending],
    ["初始体", growthJa[1]],
    ["进化体", growthJa[2]],
    ["完全体", growthJa[3]]
  ];
  replacements.sort((a, b) => b[0].length - a[0].length).forEach(([from, to]) => {
    next = replaceText(next, from, to);
  });
  return next;
};

export const translateLog = (language: Language, line: string): string => {
  if (language === "zh") return line;
  let text = replaceKnownTerms(line);
  const direct: Record<string, string> = {
    "原野的风从营地吹过。": "原野の風がキャンプを吹き抜けた。",
    "读取了本地进度。": "ローカル進行状況を読み込みました。",
    "队伍状态已恢复。": "チームの状態が回復しました。",
    "队伍需要恢复后才能继续探索。": "探索を続けるにはチームの回復が必要です。",
    "捕获石不足。": "捕獲石が足りません。",
    "治疗果不足。": "治療の実が足りません。",
    "使用了治疗果。": "治療の実を使いました。",
    "至少保留一只出战宠物。": "出撃ペットを最低1体残してください。",
    "出战队伍已满。": "出撃編成がいっぱいです。",
    "脱离了战斗。": "戦闘から離脱しました。",
    "战斗胜利。": "戦闘勝利。",
    "队伍撤回营地，宠物恢复到少量 HP。": "チームはキャンプへ撤退し、ペットは少量の HP を回復しました。",
    "行动单位不可用。": "行動できるユニットがありません。",
    "这只宠物本回合已经行动。": "このペットはこのターンすでに行動しました。",
    "AP 不足。": "AP が足りません。",
    "没有可用目标。": "選択できる対象がありません。",
    "该目标不可捕获。": "この対象は捕獲できません。"
  };
  if (direct[line]) return direct[line];
  text = text
    .replace(/^抵达(.+)。$/, "$1に到着しました。")
    .replace(/^返回(.+)营地。$/, "$1のキャンプへ帰還しました。")
    .replace(/^(.+)加入出战队伍。$/, "$1が出撃編成に加わりました。")
    .replace(/^(.+)加入队伍。$/, "$1が編成に加わりました。")
    .replace(/^(.+)进入仓库。$/, "$1を倉庫に預けました。")
    .replace(/^(.+)与你结下第一份契约。$/, "$1と最初の契約を結びました。")
    .replace(/^野生宠物出现了：(.+)。$/, "野生ペットが現れた：$1。")
    .replace(/^(.+)挡在祭坛前。$/, "$1が祭壇の前に立ちはだかりました。")
    .replace(/^(.+)进入防御姿态，本回合受到伤害降低到 1\/3。$/, "$1は防御姿勢に入り、このターンの被ダメージが1/3になります。")
    .replace(/^(.+)使用(.+)，(.+)，对(.+)造成(\d+)点伤害。$/, "$1は$2を使用。$3。$4に$5ダメージ。")
    .replace(/^(.+)的守护抵消了(\d+)点伤害。$/, "$1の守護が$2ダメージを防ぎました。")
    .replace(/^(.+)使用(.+)，(.+)恢复(\d+)点 HP。$/, "$1は$2を使用。$3が HP を$4回復。")
    .replace(/^(.+)获得(.+)。$/, "$1は$2を得ました。")
    .replace(/^(.+)陷入(.+)。$/, "$1は$2状態になりました。")
    .replace(/^(.+)倒下了。$/, "$1は倒れました。")
    .replace(/^(.+)受到火傷伤害 (\d+)。$/, "$1は火傷で$2ダメージ。")
    .replace(/^(.+)再生恢复 (\d+)。$/, "$1は再生で$2回復。")
    .replace(/^第 (\d+) 回合。$/, "第 $1 ターン。")
    .replace(/^捕获(.+)失败。$/, "$1の捕獲に失敗しました。")
    .replace(/^捕获成功：(.+)，仍可继续捕获剩余野生宠物。$/, "捕獲成功：$1。残りの野生ペットも捕獲できます。")
    .replace(/^捕获成功：(.+)。$/, "捕獲成功：$1。")
    .replace(/^获得治疗果 x1。$/, "治療の実 x1 を入手。")
    .replace(/^获得捕获石 x1。$/, "捕獲石 x1 を入手。")
    .replace(/^(.+)获得 (\d+) 经验。$/, "$1は経験値 $2 を獲得。")
    .replace(/^(.+)升级到 Lv(\d+)。$/, "$1は Lv$2 に上がりました。")
    .replace(/^(.+)被击败。$/, "$1を撃破しました。")
    .replace(/^(.+)分解为分解水晶 x(\d+)。$/, "$1を分解し、分解結晶 x$2 を獲得。")
    .replace(/^(.+)强化到 \+(\d+)。$/, "$1を +$2 に強化しました。")
    .replace(/^(.+)强化失败，消耗分解水晶 x(\d+)，当前仍为 \+(\d+)。$/, "$1の強化に失敗。分解結晶 x$2 を消費し、現在も +$3 です。")
    .replace(/^只有完全体宠物可以强化。$/, "完全体ペットのみ強化できます。")
    .replace(/^强化已经达到上限。$/, "強化はすでに上限です。")
    .replace(/^分解水晶不足。$/, "分解結晶が足りません。")
    .replace(/^出战中的宠物不可分解。$/, "出撃中のペットは分解できません。")
    .replace(/^合成成功，获得(.+)(.+) Lv1。$/, "合成成功、$1$2 Lv1 を獲得。")
    .replace(/^合成失败，两只材料消失，留下(.+) Lv1。$/, "合成失敗。素材2体は消え、$1 Lv1 が残りました。")
    .replace(/^合成成功：(.+) Lv1$/, "合成成功：$1 Lv1")
    .replace(/^合成失败：留下(.+) Lv1$/, "合成失敗：$1 Lv1 が残りました");
  return text;
};
