export const DEFAULT_IMAGE_COUNT = 3;
export const MAX_IMAGE_COUNT = 5;
export const MIN_IMAGE_COUNT = 1;

export const DEFAULT_DIFFICULTY = 5;
export const MIN_DIFFICULTY = 1;
export const MAX_DIFFICULTY = 10;

export const MIN_HIDDEN_ITEMS = 3;
export const MAX_HIDDEN_ITEMS = 10;
export const DEFAULT_HIDDEN_ITEMS = 5;

export enum AppMode {
  COLORING = 'coloring',
  HIDDEN_OBJECTS = 'hidden_objects'
}

// 50+ Distinct Items for Hidden Objects
export const HIDDEN_ITEM_POOL = [
  "Key", "Banana", "Moon", "Sock", "Hammer", "Leaf", "Star", "Bone", "Feather", "Spoon",
  "Glasses", "Umbrella", "Fish", "Envelope", "Mushroom", "Acorn", "Scissors", "Comb", "Bell", "Candle",
  "Crown", "Diamond", "Heart", "Anchor", "Balloon", "Butterfly", "Button", "Cactus", "Camera", "Carrot",
  "Cherry", "Clock", "Cloud", "Coin", "Compass", "Cupcake", "Donut", "Duck", "Egg", "Flower",
  "Fork", "Ghost", "Gift", "Guitar", "Hat", "Ice Cream", "Kite", "Lamp", "Lock", "Magnet"
];

const getDifficultyKeywords = (level: number): string => {
  if (level <= 2) {
    return "Toddler style, single large central object, very thick bold outlines, no background details, no patterns, vast white space, simple shapes, cute and friendly";
  } else if (level <= 5) {
    return "Elementary school coloring book style, moderate detail, simple background scene (e.g., clouds, hills), clear outlines, balanced complexity";
  } else {
    return "High complexity, zentangle style, mandala patterns, intricate textures, detailed shading lines, full page composition, for adults or high schoolers, masterpiece";
  }
};

const getCompositionInstruction = (level: number): string => {
  if (level <= 2) {
    return "Focus on a single, large central subject. Leave the background completely empty (pure white). Do NOT fill the page edge-to-edge.";
  } else {
    return "The image must cover the entire page (edge-to-edge). No plain white borders inside the drawing. Fill the background with thematic patterns or scenery related to the subject.";
  }
};

const getNegativeConstraints = (level: number): string => {
  const baseNegatives = "text, writing, letters, words, typography, signature, watermark, korean text, hangul, alphabet, numbers, color, shading, grayscale, blurry, filled, photo, realistic";
  if (level <= 2) {
    return `${baseNegatives}, intricate details, hatching, small patterns, texture on surfaces, complex background, noise, gradients, tiny dots, scenery`;
  }
  return baseNegatives;
};

// Mode 1: Coloring Page Prompt
export const COLORING_PROMPT_TEMPLATE = (userInput: string, difficultyLevel: number) => {
  const keywords = getDifficultyKeywords(difficultyLevel);
  const composition = getCompositionInstruction(difficultyLevel);
  const negatives = getNegativeConstraints(difficultyLevel);

  return `Draw a ${keywords} black and white coloring page line art of '${userInput}'. 
   
   [Strict Constraints]
   1. PURE ILLUSTRATION ONLY. Do not write the theme name.
   2. Style: ${keywords}
   3. Composition: ${composition}
   4. Negative Prompt (Avoid these): ${negatives}
   5. No shading, no gray, no colors, no text.
   6. Clear, crisp lines.
   7. Pure white background.`;
};

// Mode 2: Hidden Objects Prompt (Hard Mode & Zero Vanishing)
export const HIDDEN_PROMPT_TEMPLATE = (userInput: string, selectedItems: string[]) => {
  const count = selectedItems.length;
  const itemsString = selectedItems.join(", ");
  const rows = count <= 5 ? 1 : 2;
  const cols = Math.ceil(count / rows);

  return `Create a 'Seek and Find' puzzle for children. Line art only.
Theme: '${userInput}'.
MANDATORY OBJECTS to hide: [${itemsString}].

[LAYOUT STRUCTURE]
1. MAIN SCENE (Top 80%):
   - Draw a detailed '${userInput}' scene.
   - PRIORITY: You MUST draw the MANDATORY OBJECTS (${itemsString}) FIRST.
   - PLACEMENT: Place them in the FOREGROUND or MID-GROUND. Do NOT hide them deep in background texture.
   - CAMOUFLAGE: Make them part of the environment (e.g., a 'Spoon' pattern on a tree bark, a 'Cloud' shaped like a 'Car').
   - VISIBILITY: They should be disguised but COMPLETE shapes. Do not cut them off.

2. LEGEND (Bottom 20%):
   - Draw a grid (approx ${rows} rows x ${cols} columns).
   - Inside the grid, draw the EXACT same ${count} items: ${itemsString}.
   - Draw clear, isolated icons. NO TEXT labels.

[CRITICAL RULES]
1. EXACT COUNT: Hide exactly ${count} items.
2. NO TEXT: Pure visual icons only. No words.
3. NO DUPLICATES: One of each item.
4. STYLE: Clean black and white line art. No shading.`;
};

export const LOCAL_STORAGE_KEY_API = 'gemini_coloring_api_key';
