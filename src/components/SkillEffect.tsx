import type { ElementType, SkillCategory } from "../game/types";

interface SkillEffectProps {
  id: number;
  element: ElementType | "capture";
  category: SkillCategory | "capture";
  sourceSide: "ally" | "enemy";
}

export function SkillEffect({ id, element, category, sourceSide }: SkillEffectProps) {
  return (
    <div className={`skill-effect effect-${element} effect-${category} from-${sourceSide}`} key={id} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}
