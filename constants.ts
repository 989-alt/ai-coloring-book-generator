export const DEFAULT_IMAGE_COUNT = 3;
export const MAX_IMAGE_COUNT = 5;
export const MIN_IMAGE_COUNT = 1;

export const DEFAULT_DIFFICULTY = 3;
export const MIN_DIFFICULTY = 1;
export const MAX_DIFFICULTY = 5;

// [필수] Enum 정의 (이게 중복되거나 없으면 오류 발생)
export enum ArtStyle {
  CHARACTER = 'character',
  LANDSCAPE = 'landscape'
}

export enum AppMode {
  COLORING = 'coloring',
  MANDALA = 'mandala'
}

export const LOCAL_STORAGE_KEY_API = 'gemini_coloring_api_key';

const getDifficultyKeywords = (level: number): string => {
  switch (level) {
    case 1: return "Toddler Level. Simple clear outlines. No background.";
    case 2: return "Easy Level. Distinct lines. Minimal shading.";
    case 3: return "Standard Level. Realistic proportions. Balanced detail.";
    case 4: return "High Detail. Intricate etching style. Hatching.";
    case 5: return "Masterpiece. Hyper-realistic engraving. Micro-details.";
    default: return "Standard style";
  }
};

const REALISM_RULES = `
[RULES]
1. Realistic proportions. No 'chibi'.
2. Crisp black lines (#000000). No gray.
3. No text, letters, or signatures.
`;

export const COLORING_PROMPT_TEMPLATE = (
  userInput: string, 
  difficultyLevel: number, 
  style: ArtStyle,
  imageDescription?: string
) => {
  const diffKeywords = getDifficultyKeywords(difficultyLevel);
  
  const mainSubject = imageDescription 
    ? `Reference: ${imageDescription}\nModification: "${userInput}"`
    : `"${userInput}"`;

  const styleFocus = style === ArtStyle.CHARACTER 
    ? "**FOCUS**: Character & Anatomy." 
    : "**FOCUS**: Scenery & Perspective.";

  return `**Role**: Professional Ink Illustrator.
**Task**: Black and white coloring page line art.

**SUBJECT**: 
${mainSubject}

**CONFIG**:
- Mode: ${style}
- Difficulty: ${difficultyLevel}/5 (${diffKeywords})

${styleFocus}
${REALISM_RULES}

**NEGATIVE**: text, watermark, grayscale, blurry, distorted.`;
};

export const MANDALA_PROMPT_TEMPLATE = (userInput: string, difficultyLevel: number) => {
  const diffKeywords = getDifficultyKeywords(difficultyLevel);
  return `**Role**: Mandala Artist.
**Task**: Symmetrical Mandala based on "${userInput}".
**Difficulty**: ${difficultyLevel}/5 (${diffKeywords})

[Rules]
1. Radial Symmetry.
2. Incorporate realistic elements.
3. Crisp black lines.
${REALISM_RULES}`;
};
