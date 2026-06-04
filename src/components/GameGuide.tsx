import { X } from "lucide-react";
import { useState } from "react";
import type { Language } from "../i18n";

interface GuideSection {
  id: string;
  title: string;
  summary: string;
  points: string[];
}

const guideSections = (language: Language): GuideSection[] =>
  language === "ja"
    ? [
        {
          id: "goal",
          title: "冒険の流れ",
          summary: "まずは安全な場所で仲間を増やし、育成しながら新しい地図を開放します。",
          points: [
            "最初のペットを選んだら、キャンプ周辺で低レベルの野生ペットと戦います。",
            "捕獲石で仲間を増やし、出撃枠は最大3体まで使えます。",
            "ペットを Lv10 まで育てると、同じ進化段階の2体で次の段階へ合成できます。",
            "各地図の首領を倒すと、新しい探索先や次の目標に近づきます。"
          ]
        },
        {
          id: "map",
          title: "野外探索",
          summary: "キャンプから遠いほど敵は強くなり、複数出現しやすくなります。",
          points: [
            "キャンプ付近は初期体の低レベル敵が中心です。",
            "地図の中盤以降は敵レベルが上がり、進化体が混ざり始めます。",
            "首領地点付近は最終準備エリアです。回復してから進むと安定します。",
            "移動しても敵に出会わない場合、10から15歩ほどで遭遇しやすくなります。"
          ]
        },
        {
          id: "element",
          title: "属性相性",
          summary: "有利属性は与ダメージが増え、不利属性は下がります。",
          points: [
            "火は森に強く、水に弱いです。",
            "水は火に強く、森に弱いです。",
            "森は水に強く、火に弱いです。",
            "土は風に強く、森に弱いです。",
            "風は土に強く、火に弱いです。",
            "有利攻撃は120%、不利攻撃は80%、同属性や相性なしは100%です。"
          ]
        },
        {
          id: "battle",
          title: "戦闘の基本",
          summary: "速度、AP、対象選択を意識すると戦闘が安定します。",
          points: [
            "行動順は味方と敵を含めて速度の高い順です。同速なら味方が先に動きます。",
            "各ペットは0APの基本攻撃を持つため、APを温存しながら行動できます。",
            "強い技はAPを使います。敵が多い時は全体技、危険な敵には単体技が有効です。",
            "防御を選ぶとそのターンは攻撃しませんが、受けるダメージが1/3になります。",
            "捕獲は敵のHPが低いほど成功しやすく、進化段階や個体Lvが高いほど難しくなります。"
          ]
        },
        {
          id: "growth",
          title: "育成と合成",
          summary: "個体Lvと進化段階は別の成長軸です。",
          points: [
            "個体Lvは Lv1 から Lv10 まで上がります。Lv10 になると合成準備が整います。",
            "初期体 Lv10 同士で進化体へ、進化体 Lv10 同士で完全体へ進みます。",
            "合成成功率は初期体から進化体が80%、進化体から完全体が50%です。",
            "合成に失敗すると素材2体は消え、素材どちらか1体の Lv1 ペットが残ります。",
            "同属性同士の合成は同属性の次段階、異属性同士は次段階の全体プールからランダムです。",
            "完全体は分解結晶で +1 から +3 まで強化できます。成功率は +1 が80%、+2 が50%、+3 が30%です。",
            "強化に失敗しても現在の強化値は残りますが、使った分解結晶は戻りません。",
            "出撃中のペットは分解できません。倉庫に預けてから分解します。"
          ]
        },
        {
          id: "boss",
          title: "首領の準備",
          summary: "首領は捕獲できず、同じ地図属性の完全体3体で現れます。",
          points: [
            "挑む前にキャンプで回復し、3体の出撃枠を埋めておくと安全です。",
            "基本は有利属性を軸にしつつ、回復、防御、速度低下を混ぜると安定します。",
            "火山や高地の首領は圧力が高いので、純粋な火力だけでなく耐久役も役立ちます。",
            "普通の首領を倒した後、同じ地図で首領強化挑戦 +1 から +3 に進めます。"
          ]
        }
      ]
    : [
        {
          id: "goal",
          title: "冒险目标",
          summary: "先在安全区域收集伙伴，再培养、合成、挑战新地图。",
          points: [
            "选择初始宠物后，先在营地周边挑战低等级野生宠物。",
            "使用捕获石增加伙伴，出战队伍最多携带3只宠物。",
            "宠物练到个体 Lv10 后，可以和同进化阶段的另一只 Lv10 宠物合成到下一阶段。",
            "击败每张地图的首领，可以推进地图解锁和后续目标。"
          ]
        },
        {
          id: "map",
          title: "野外探索",
          summary: "离己方营地越远，敌人等级越高，也更容易出现多个敌人。",
          points: [
            "营地周边主要出现低等级初始体，适合开局练级和捕获。",
            "地图中段以后敌人等级会上升，并开始混入进化体。",
            "靠近首领点的区域强度最高，建议恢复后再深入。",
            "连续移动未遇敌时，10到15步内会越来越容易触发暗雷。"
          ]
        },
        {
          id: "element",
          title: "属性相克",
          summary: "优势属性会提高伤害，弱势属性会降低伤害。",
          points: [
            "火克森，火弱水。",
            "水克火，水弱森。",
            "森克水，森弱火。",
            "土克风，土弱森。",
            "风克土，风弱火。",
            "优势攻击造成120%伤害，弱势攻击造成80%伤害，同属性或无相克关系为100%。"
          ]
        },
        {
          id: "battle",
          title: "战斗基础",
          summary: "速度、AP、目标选择会明显影响战斗结果。",
          points: [
            "行动顺序由我方和敌方全部单位的速度决定，速度相同时我方优先。",
            "所有宠物都有0AP基础攻击，可以每回合行动并保留AP。",
            "高级技能需要消耗AP。敌人多时适合全体技，危险目标适合集火单体技。",
            "防御会跳过本回合攻击，但受到的伤害降低到1/3。",
            "捕获成功率受敌方HP、进化阶段、个体Lv影响；HP越低越容易捕获。"
          ]
        },
        {
          id: "growth",
          title: "培养合成",
          summary: "个体Lv和进化阶段是两条不同成长线。",
          points: [
            "个体Lv从 Lv1 到 Lv10。达到 Lv10 后才具备合成条件。",
            "初始体 Lv10 两两合成进化体；进化体 Lv10 两两合成完全体。",
            "合成成功率为：初始体到进化体80%，进化体到完全体50%。",
            "合成失败时，两只材料会消失，并留下材料中随机一只的 Lv1 个体。",
            "同属性合成会进入同属性下一阶段，异属性合成会从下一阶段全池随机。",
            "完全体可以使用分解水晶强化到 +1、+2、+3；成功率分别是80%、50%、30%。",
            "强化失败会保留当前强化等级，但消耗的分解水晶不会返还。",
            "出战中的宠物不能分解，需要先入库。"
          ]
        },
        {
          id: "boss",
          title: "首领准备",
          summary: "首领不可捕获，会以当前地图属性的3只完全体出现。",
          points: [
            "挑战前先在营地恢复，并尽量凑满3只出战宠物。",
            "基础思路是带优势属性，同时混入治疗、防御、降速或破甲手段。",
            "火山和高地压力较高，不建议只追求输出，耐久与恢复也很重要。",
            "首次击败普通首领后，同地图会开放 +1 到 +3 的首领强化挑战。"
          ]
        }
      ];

export function GameGuide({ language, onClose }: { language: Language; onClose: () => void }) {
  const sections = guideSections(language);
  const [activeId, setActiveId] = useState(sections[0].id);
  const active = sections.find((section) => section.id === activeId) ?? sections[0];

  return (
    <div className="guide-backdrop">
      <section className="guide-panel" role="dialog" aria-modal="true" aria-label={language === "ja" ? "遊び方" : "游戏方式说明"}>
        <header className="guide-header">
          <div>
            <h2>{language === "ja" ? "遊び方" : "游戏方式说明"}</h2>
            <span>{language === "ja" ? "基本だけを確認して、細かい発見は冒険の中へ。" : "只整理基础上手信息，细节留给探索。"}</span>
          </div>
          <button className="square-button" type="button" onClick={onClose} aria-label={language === "ja" ? "閉じる" : "关闭"}>
            <X size={18} />
          </button>
        </header>

        <div className="guide-body">
          <nav className="guide-tabs" aria-label={language === "ja" ? "カテゴリ" : "玩法类别"}>
            {sections.map((section) => (
              <button className={section.id === active.id ? "active" : ""} key={section.id} type="button" onClick={() => setActiveId(section.id)}>
                {section.title}
              </button>
            ))}
          </nav>

          <article className="guide-detail">
            <h3>{active.title}</h3>
            <p>{active.summary}</p>
            <ul>
              {active.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </div>
  );
}
