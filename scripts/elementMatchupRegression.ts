import { calculateElementalAttackDamage, elementMultiplier } from "../src/game/balance";
import type { ElementType } from "../src/game/types";

const assertEqual = (actual: number, expected: number, label: string) => {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, received ${actual}`);
  }
};

const assertClose = (actual: number, expected: number, label: string) => {
  if (Math.abs(actual - expected) > 0.000001) {
    throw new Error(`${label}: expected ${expected}, received ${actual}`);
  }
};

const assertGreater = (actual: number, reference: number, label: string) => {
  if (actual <= reference) {
    throw new Error(`${label}: expected ${actual} to be greater than ${reference}`);
  }
};

const assertLess = (actual: number, reference: number, label: string) => {
  if (actual >= reference) {
    throw new Error(`${label}: expected ${actual} to be less than ${reference}`);
  }
};

const cases: Array<[ElementType, ElementType, number, string]> = [
  ["fire", "forest", 1.2, "fire beats forest"],
  ["water", "fire", 1.2, "water beats fire"],
  ["forest", "water", 1.2, "forest beats water"],
  ["earth", "wind", 1.2, "earth beats wind"],
  ["wind", "earth", 1.2, "wind beats earth"],
  ["fire", "water", 0.8, "fire is weak against water"],
  ["water", "forest", 0.8, "water is weak against forest"],
  ["forest", "fire", 0.8, "forest is weak against fire"],
  ["earth", "forest", 0.8, "earth is weak against forest"],
  ["wind", "fire", 0.8, "wind is weak against fire"],
  ["fire", "fire", 1, "same element is neutral"],
  ["fire", "earth", 1, "unrelated element is neutral"]
];

cases.forEach(([attacker, defender, expected, label]) => {
  assertEqual(elementMultiplier(attacker, defender), expected, label);
});

const neutralDamage = calculateElementalAttackDamage({
  skillPower: 12,
  skillMultiplier: 1,
  attackerAttack: 40,
  defenderDefense: 20,
  attackerElement: "fire",
  defenderElement: "earth"
});
const advantageDamage = calculateElementalAttackDamage({
  skillPower: 12,
  skillMultiplier: 1,
  attackerAttack: 40,
  defenderDefense: 20,
  attackerElement: "fire",
  defenderElement: "forest"
});
const disadvantageDamage = calculateElementalAttackDamage({
  skillPower: 12,
  skillMultiplier: 1,
  attackerAttack: 40,
  defenderDefense: 20,
  attackerElement: "fire",
  defenderElement: "water"
});
const sameElementDamage = calculateElementalAttackDamage({
  skillPower: 12,
  skillMultiplier: 1,
  attackerAttack: 40,
  defenderDefense: 20,
  attackerElement: "fire",
  defenderElement: "fire"
});

assertClose(neutralDamage, 40, "neutral damage includes skill power, attack and defense");
assertClose(advantageDamage, neutralDamage * 1.2, "advantage damage is 120 percent");
assertClose(disadvantageDamage, neutralDamage * 0.8, "disadvantage damage is 80 percent");
assertClose(sameElementDamage, neutralDamage, "same element damage is 100 percent");

const higherAttackDamage = calculateElementalAttackDamage({
  skillPower: 12,
  skillMultiplier: 1,
  attackerAttack: 50,
  defenderDefense: 20,
  attackerElement: "fire",
  defenderElement: "forest"
});
const higherDefenseDamage = calculateElementalAttackDamage({
  skillPower: 12,
  skillMultiplier: 1,
  attackerAttack: 40,
  defenderDefense: 30,
  attackerElement: "fire",
  defenderElement: "forest"
});

assertGreater(higherAttackDamage, advantageDamage, "attacker attack contributes before element advantage");
assertLess(higherDefenseDamage, advantageDamage, "defender defense reduces damage before element advantage");

console.log(JSON.stringify({ ok: true, neutralDamage, advantageDamage, disadvantageDamage, sameElementDamage }, null, 2));
