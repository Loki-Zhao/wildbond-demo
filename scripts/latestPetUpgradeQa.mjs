import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("/Users/loki_cho/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const url = process.argv[2] ?? "http://127.0.0.1:5173/";
const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true
});

const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
await page.goto(url, { waitUntil: "networkidle" });

const result = await page.evaluate(async () => {
  const petsMod = await import("/src/data/pets.ts");
  const mapsMod = await import("/src/data/maps.ts");
  const combat = await import("/src/game/combat.ts");
  const fusion = await import("/src/game/fusion.ts");
  const stateMod = await import("/src/game/state.ts");
  const balance = await import("/src/game/balance.ts");
  const skillsMod = await import("/src/data/skills.ts");

  const failures = [];
  const note = {};
  const fail = (name, detail) => failures.push(`${name}${detail ? `: ${detail}` : ""}`);
  const byGrowth = (level) => petsMod.PETS.filter((pet) => pet.growthLevel === level);
  const living = (units) => units.filter((unit) => unit.currentHp > 0);
  const firstEnemy = (battle) => living(battle.enemies)[0]?.id;
  const weakestAlly = (battle) => living(battle.allies).sort((a, b) => a.currentHp / balance.getBattleUnitStats(a).hp - b.currentHp / balance.getBattleUnitStats(b).hp)[0];

  if (petsMod.PETS.length !== 50) fail("pet-count", String(petsMod.PETS.length));
  if (byGrowth(1).length !== 20) fail("junior-count", String(byGrowth(1).length));
  if (byGrowth(2).length !== 15) fail("middle-count", String(byGrowth(2).length));
  if (byGrowth(3).length !== 10) fail("advanced-count", String(byGrowth(3).length));
  if (byGrowth(4).length !== 5) fail("deity-count", String(byGrowth(4).length));
  if (!petsMod.STARTER_SPECIES_IDS.includes("stone-rat")) fail("starter-earth", "stone-rat missing");

  const starterState = stateMod.chooseStarter(stateMod.createInitialState(), "fire-lizard");
  if (starterState.party[0]?.rarity !== "rare" || starterState.party[0]?.expLevel !== 3) fail("starter-rarity-level");

  for (const map of mapsMod.MAPS) {
    const state = {
      ...stateMod.createInitialState(),
      activeMapId: map.id,
      position: { x: Math.max(0, map.boss.x - 8), y: Math.max(0, map.boss.y - 8) },
      party: [stateMod.createPetInstance(petsMod.STARTER_SPECIES_IDS[0], 3, "rare")]
    };
    for (let i = 0; i < 20; i += 1) {
      const battle = combat.createWildBattle(state);
      if (battle.enemies.some((enemy) => petsMod.getPetSpecies(enemy.speciesId).growthLevel > 2)) fail("wild-growth", map.id);
      if (battle.enemies.some((enemy) => !["weak", "normal", "rare"].includes(enemy.rarity))) fail("wild-rarity", map.id);
    }

    const bossBattle = combat.createBossBattle(state);
    const bossGrowths = bossBattle.enemies.map((enemy) => petsMod.getPetSpecies(enemy.speciesId).growthLevel).sort().join(",");
    if (bossGrowths !== "3,3,4") fail("boss-team", `${map.id}:${bossGrowths}`);
    if (bossBattle.enemies.some((enemy) => enemy.rarity !== "normal" || !enemy.isBoss)) fail("boss-rarity", map.id);
  }

  const fireHigh = byGrowth(3).filter((pet) => pet.element === "fire");
  const god = byGrowth(4).find((pet) => pet.element === "fire");
  const materialA = stateMod.createPetInstance(fireHigh[0].id, 10, "normal");
  const materialB = stateMod.createPetInstance(fireHigh[1].id, 10, "normal");
  const fusionState = {
    ...stateMod.createInitialState(),
    party: [],
    storage: [materialA, materialB],
    ownedSpecies: [materialA.speciesId, materialB.speciesId],
    discoveredSpecies: [materialA.speciesId, materialB.speciesId]
  };
  const deityFusion = fusion.fusePets(fusionState, materialA.uid, materialB.uid, () => 0.01);
  const fusedPet = [...deityFusion.state.party, ...deityFusion.state.storage][0];
  if (deityFusion.outcome !== "success" || petsMod.getPetSpecies(fusedPet.speciesId).growthLevel !== 4 || fusedPet.rarity !== "rare") {
    fail("deity-fusion-success", JSON.stringify({ outcome: deityFusion.outcome, speciesId: fusedPet?.speciesId, rarity: fusedPet?.rarity }));
  }
  if (fusion.canFuse(stateMod.createPetInstance(god.id, 10), stateMod.createPetInstance(god.id, 10)).ok) fail("deity-cannot-fuse");
  const waterHigh = byGrowth(3).filter((pet) => pet.element === "water");
  if (fusion.canFuse(stateMod.createPetInstance(fireHigh[0].id, 10), stateMod.createPetInstance(waterHigh[0].id, 10)).ok) fail("cross-element-advanced-fusion");
  if (balance.decomposeCrystalValue(stateMod.createPetInstance(god.id, 10)) !== 0) fail("deity-decompose-value");

  const windSkillState = {
    ...stateMod.createInitialState(),
    activeMapId: "meadow",
    party: [stateMod.createPetInstance("light-feather-cat", 10, "normal")]
  };
  const windSkillBattle = combat.createBossBattle(windSkillState);
  const windAlly = { ...windSkillBattle.allies[0], ap: 3 };
  const windSkillResult = combat.useSkill({ ...windSkillBattle, allies: [windAlly] }, windAlly.id, "glide-strike", windSkillBattle.enemies[0].id);
  const postWindAlly = windSkillResult.state.allies.find((unit) => unit.id === windAlly.id);
  if (!postWindAlly?.statuses.some((status) => status.id === "haste")) fail("attack-haste-on-caster");
  if (windSkillResult.state.enemies.some((unit) => unit.statuses.some((status) => status.id === "haste"))) fail("attack-haste-on-enemy");

  const pickAdvancedTeam = (mapElement) => {
    const counters = {
      forest: ["fire", "fire", "water"],
      water: ["forest", "forest", "water"],
      fire: ["water", "water", "forest"],
      earth: ["forest", "forest", "wind"],
      wind: ["earth", "earth", "water"]
    }[mapElement];
    return counters.map((element, index) => byGrowth(3).filter((pet) => pet.element === element)[index % byGrowth(3).filter((pet) => pet.element === element).length].id);
  };

  const pickDeityTeam = (mapElement) => {
    const counters = {
      forest: ["fire", "fire", "water"],
      water: ["forest", "forest", "water"],
      fire: ["water", "water", "forest"],
      earth: ["forest", "wind", "fire"],
      wind: ["earth", "earth", "water"]
    }[mapElement];
    return counters.map((element) => byGrowth(4).find((pet) => pet.element === element)?.id ?? byGrowth(3).find((pet) => pet.element === element).id);
  };

  const runBattle = (map, speciesIds, challengeLevel = 0) => {
    let state = {
      ...stateMod.createInitialState(),
      activeMapId: map.id,
      party: speciesIds.map((speciesId) => stateMod.createPetInstance(speciesId, 10, "normal"))
    };
    state.party = state.party.map((pet) => ({ ...pet, currentHp: balance.getMaxHp(pet) }));
    let battle = combat.createBossBattle(state, challengeLevel);
    let result = { state: battle };
    for (let turn = 0; turn < 160; turn += 1) {
      if (battle.enemies.length === 0) return { victory: true, rounds: battle.round };
      if (battle.allies.every((unit) => unit.currentHp <= 0)) return { victory: false, rounds: battle.round };
      const active = combat.getActiveUnit(battle);
      if (!active) {
        result = combat.advanceBattleTurn(battle);
      } else if (active.side === "enemy") {
        result = combat.enemyAct(battle);
      } else {
        const species = petsMod.getPetSpecies(active.speciesId);
        const skills = species.skillIds.map(skillsMod.getSkill).filter((skill) => skill.apCost <= active.ap);
        const ally = weakestAlly(battle);
        const heal = skills.find((skill) => skill.category === "heal" && ally && ally.currentHp / balance.getBattleUnitStats(ally).hp < 0.58);
        const shield = skills.find((skill) => skill.category === "defense" && living(battle.allies).some((unit) => unit.currentHp / balance.getBattleUnitStats(unit).hp < 0.45));
        const allAttack = skills.filter((skill) => skill.category === "attack" && skill.target === "allEnemies").sort((a, b) => (b.apCost - a.apCost) || ((b.power ?? 0) - (a.power ?? 0)))[0];
        const singleAttack = skills.filter((skill) => skill.category === "attack" && skill.target === "enemy").sort((a, b) => (b.apCost - a.apCost) || ((b.power ?? 0) - (a.power ?? 0)))[0];
        const chosen = heal ?? shield ?? (battle.enemies.length > 1 ? allAttack : undefined) ?? singleAttack ?? skills[0];
        const targetId = chosen.target === "enemy" ? firstEnemy(battle) : chosen.target === "ally" ? ally?.id : undefined;
        result = combat.useSkill(battle, active.id, chosen.id, targetId);
        if (!result.victory && !result.defeat) result = combat.advanceBattleTurn(result.state);
      }
      battle = result.state;
      if (result.victory || result.defeat) return { victory: Boolean(result.victory), rounds: battle.round };
    }
    return { victory: false, rounds: battle.round, timeout: true };
  };

  note.bossBalance = mapsMod.MAPS.map((map) => {
    const advanced = runBattle(map, pickAdvancedTeam(map.element), 0);
    const deity = runBattle(map, pickDeityTeam(map.element), 0);
    const deityChallenge = runBattle(map, pickDeityTeam(map.element), 1);
    return { map: map.id, advanced, deity, deityChallenge };
  });
  for (const item of note.bossBalance) {
    if (!item.advanced.victory) fail("advanced-vs-normal-boss", item.map);
    if (!item.deity.victory) fail("deity-vs-normal-boss", item.map);
  }

  return { ok: failures.length === 0, failures, note };
});

await browser.close();
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;
