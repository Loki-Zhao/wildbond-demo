export type SpriteBase =
  | "ape"
  | "bear"
  | "bird"
  | "bug"
  | "bull"
  | "cat"
  | "crab"
  | "deer"
  | "dolphin"
  | "dragonfly"
  | "drake"
  | "eagle"
  | "fox"
  | "frog"
  | "golem"
  | "griffin"
  | "kirin"
  | "lizard"
  | "lion"
  | "mer"
  | "monkey"
  | "mouse"
  | "otter"
  | "panther"
  | "phoenix"
  | "pig"
  | "rabbit"
  | "rat"
  | "rhino"
  | "rooster"
  | "serpent"
  | "sheep"
  | "sparrow"
  | "turtle"
  | "vulture"
  | "weasel"
  | "whale"
  | "wolf";

export type SpritePattern =
  | "bands"
  | "clouds"
  | "crystal"
  | "flames"
  | "leaf"
  | "plates"
  | "runes"
  | "spots"
  | "stripes"
  | "thorns"
  | "waves"
  | "wool";

export type SpriteFeature =
  | "ancientAntlers"
  | "backSpines"
  | "blazeFangs"
  | "blueFins"
  | "brookWhiskers"
  | "bubbleTrail"
  | "chimeTail"
  | "cloudTail"
  | "coalSnout"
  | "copperShell"
  | "coralCrown"
  | "crystalCrown"
  | "featherTufts"
  | "flameCrown"
  | "flameTail"
  | "flowerEars"
  | "galeWing"
  | "giantMoss"
  | "golemRunes"
  | "honeyBud"
  | "jadeCrest"
  | "jiaoHorns"
  | "kirinHorn"
  | "lampTail"
  | "leafTail"
  | "magmaShell"
  | "meteorMane"
  | "mistEyes"
  | "moonPearl"
  | "mossBack"
  | "phoenixCrest"
  | "ridgeBack"
  | "rockHorn"
  | "roosterComb"
  | "rotorWings"
  | "roundWool"
  | "sandFrill"
  | "sandMask"
  | "shieldArm"
  | "stoneFangs"
  | "stormWings"
  | "swiftStripe"
  | "thornSpikes"
  | "thunderCrest"
  | "tideClaws"
  | "tinderAntlers"
  | "vineArmor"
  | "volcanoBack"
  | "waveBladeTail"
  | "whitePlumes";

export interface PetSpriteDesign {
  base: SpriteBase;
  pattern: SpritePattern;
  features: SpriteFeature[];
  bulk?: "small" | "normal" | "large" | "giant";
}

export const PET_SPRITE_DESIGNS: Record<string, PetSpriteDesign> = {
  "fire-lizard": {
    base: "lizard",
    pattern: "flames",
    features: ["flameTail", "backSpines"],
    bulk: "small"
  },
  "coal-pig": {
    base: "pig",
    pattern: "spots",
    features: ["coalSnout"],
    bulk: "normal"
  },
  "lamp-fox": {
    base: "fox",
    pattern: "bands",
    features: ["lampTail"],
    bulk: "small"
  },
  "red-rooster": {
    base: "rooster",
    pattern: "flames",
    features: ["roosterComb"],
    bulk: "small"
  },
  "magma-turtle": {
    base: "turtle",
    pattern: "plates",
    features: ["magmaShell"],
    bulk: "large"
  },
  "blaze-panther": {
    base: "panther",
    pattern: "stripes",
    features: ["blazeFangs", "flameTail"],
    bulk: "normal"
  },
  "tinder-deer": {
    base: "deer",
    pattern: "flames",
    features: ["tinderAntlers"],
    bulk: "normal"
  },
  "flame-crown-drake": {
    base: "drake",
    pattern: "flames",
    features: ["flameCrown", "backSpines"],
    bulk: "large"
  },
  "volcano-rhino": {
    base: "rhino",
    pattern: "plates",
    features: ["volcanoBack", "rockHorn"],
    bulk: "giant"
  },
  "scorch-phoenix": {
    base: "phoenix",
    pattern: "flames",
    features: ["phoenixCrest", "stormWings"],
    bulk: "large"
  },

  "bubble-dolphin": {
    base: "dolphin",
    pattern: "waves",
    features: ["bubbleTrail"],
    bulk: "small"
  },
  "tide-crab": {
    base: "crab",
    pattern: "plates",
    features: ["tideClaws"],
    bulk: "normal"
  },
  "bluefin-rabbit": {
    base: "rabbit",
    pattern: "waves",
    features: ["blueFins"],
    bulk: "small"
  },
  "mist-frog": {
    base: "frog",
    pattern: "clouds",
    features: ["mistEyes"],
    bulk: "small"
  },
  "coral-turtle": {
    base: "turtle",
    pattern: "crystal",
    features: ["coralCrown"],
    bulk: "large"
  },
  "brook-cat": {
    base: "cat",
    pattern: "waves",
    features: ["brookWhiskers"],
    bulk: "small"
  },
  "wave-otter": {
    base: "otter",
    pattern: "waves",
    features: ["waveBladeTail"],
    bulk: "normal"
  },
  "crystal-whale": {
    base: "whale",
    pattern: "crystal",
    features: ["crystalCrown", "bubbleTrail"],
    bulk: "giant"
  },
  "deep-tide-jiao": {
    base: "serpent",
    pattern: "waves",
    features: ["jiaoHorns", "blueFins"],
    bulk: "large"
  },
  "moon-bay-mer": {
    base: "mer",
    pattern: "waves",
    features: ["moonPearl", "coralCrown"],
    bulk: "normal"
  },

  "grass-mouse": {
    base: "mouse",
    pattern: "leaf",
    features: ["leafTail"],
    bulk: "small"
  },
  "moss-turtle": {
    base: "turtle",
    pattern: "leaf",
    features: ["mossBack"],
    bulk: "normal"
  },
  "flower-deer": {
    base: "deer",
    pattern: "spots",
    features: ["flowerEars"],
    bulk: "small"
  },
  "leaf-monkey": {
    base: "monkey",
    pattern: "leaf",
    features: ["leafTail"],
    bulk: "small"
  },
  "vine-bear": {
    base: "bear",
    pattern: "leaf",
    features: ["vineArmor"],
    bulk: "large"
  },
  "honeybud-fox": {
    base: "fox",
    pattern: "spots",
    features: ["honeyBud", "leafTail"],
    bulk: "small"
  },
  "thorn-panther": {
    base: "panther",
    pattern: "thorns",
    features: ["thornSpikes"],
    bulk: "normal"
  },
  "ancient-stag": {
    base: "deer",
    pattern: "runes",
    features: ["ancientAntlers", "giantMoss"],
    bulk: "large"
  },
  "jade-eagle": {
    base: "eagle",
    pattern: "leaf",
    features: ["jadeCrest", "galeWing"],
    bulk: "large"
  },
  "forest-giant-bear": {
    base: "bear",
    pattern: "runes",
    features: ["giantMoss", "vineArmor"],
    bulk: "giant"
  },

  "stone-rat": {
    base: "rat",
    pattern: "plates",
    features: ["stoneFangs"],
    bulk: "small"
  },
  "sand-lizard": {
    base: "lizard",
    pattern: "bands",
    features: ["sandFrill"],
    bulk: "small"
  },
  "round-rock-sheep": {
    base: "sheep",
    pattern: "wool",
    features: ["roundWool"],
    bulk: "normal"
  },
  "copper-bug": {
    base: "bug",
    pattern: "plates",
    features: ["copperShell"],
    bulk: "small"
  },
  "rock-horn-bull": {
    base: "bull",
    pattern: "plates",
    features: ["rockHorn"],
    bulk: "large"
  },
  "sand-pattern-cat": {
    base: "cat",
    pattern: "bands",
    features: ["sandMask"],
    bulk: "small"
  },
  "stone-shield-ape": {
    base: "ape",
    pattern: "plates",
    features: ["shieldArm"],
    bulk: "large"
  },
  "ridge-giant-turtle": {
    base: "turtle",
    pattern: "plates",
    features: ["ridgeBack", "rockHorn"],
    bulk: "giant"
  },
  "meteor-lion": {
    base: "lion",
    pattern: "runes",
    features: ["meteorMane", "stoneFangs"],
    bulk: "large"
  },
  "ancient-golem": {
    base: "golem",
    pattern: "runes",
    features: ["golemRunes", "ridgeBack"],
    bulk: "giant"
  },

  "wind-chime-sparrow": {
    base: "sparrow",
    pattern: "clouds",
    features: ["chimeTail"],
    bulk: "small"
  },
  "cloud-rabbit": {
    base: "rabbit",
    pattern: "clouds",
    features: ["cloudTail"],
    bulk: "small"
  },
  "spin-dragonfly": {
    base: "dragonfly",
    pattern: "stripes",
    features: ["rotorWings"],
    bulk: "small"
  },
  "light-feather-cat": {
    base: "cat",
    pattern: "clouds",
    features: ["featherTufts"],
    bulk: "small"
  },
  "gale-wolf": {
    base: "wolf",
    pattern: "stripes",
    features: ["galeWing"],
    bulk: "normal"
  },
  "white-feather-deer": {
    base: "deer",
    pattern: "clouds",
    features: ["whitePlumes"],
    bulk: "normal"
  },
  "swift-weasel": {
    base: "weasel",
    pattern: "stripes",
    features: ["swiftStripe"],
    bulk: "small"
  },
  "sky-thunder-vulture": {
    base: "vulture",
    pattern: "clouds",
    features: ["thunderCrest", "galeWing"],
    bulk: "large"
  },
  "cloud-kirin": {
    base: "kirin",
    pattern: "clouds",
    features: ["kirinHorn", "whitePlumes"],
    bulk: "large"
  },
  "storm-griffin": {
    base: "griffin",
    pattern: "stripes",
    features: ["stormWings", "thunderCrest"],
    bulk: "large"
  }
};
