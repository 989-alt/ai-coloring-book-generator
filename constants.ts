
export const DEFAULT_IMAGE_COUNT = 1;
export const MAX_IMAGE_COUNT = 3;
export const MIN_IMAGE_COUNT = 1;

export const DEFAULT_DIFFICULTY = 5;
export const MIN_DIFFICULTY = 1;
export const MAX_DIFFICULTY = 10;

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

// Coloring Page Prompt
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

export const LOCAL_STORAGE_KEY_API = 'gemini_coloring_api_key';
