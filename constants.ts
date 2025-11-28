export const DEFAULT_IMAGE_COUNT = 3;
export const MAX_IMAGE_COUNT = 5;
export const MIN_IMAGE_COUNT = 1;

export const DEFAULT_DIFFICULTY = 3;
export const MIN_DIFFICULTY = 1;
export const MAX_DIFFICULTY = 5;

// [중요] App.tsx와 Sidebar.tsx에서 사용하는 Enum 정의
export enum ArtStyle {
  CHARACTER = 'character',
  LANDSCAPE = 'landscape'
}

export enum AppMode {
  COLORING = 'coloring',
  MANDALA = 'mandala'
}

export const LOCAL_STORAGE_KEY_API = 'gemini_coloring_api_key';

// 난이도별 묘사 수준
const getDifficultyKeywords = (level: number): string => {
  switch (level) {
    case 1: return "Toddler Level. Simple clear outlines. No background. Large shapes.";
    case 2: return "Easy Level. Distinct lines. Minimal shading. Clear subject focus.";
    case 3: return "Standard Level. Realistic proportions. Balanced detail and texture.";
    case 4: return "High Detail. Intricate etching style. Fine hatching lines for shadow.";
    case 5: return "Masterpiece Level. Hyper-realistic engraving style. Extreme micro-details.";
    default: return "Standard style";
  }
};

// 공통 품질 룰
const REALISM_RULES = `
[REALISM & QUALITY RULES]
1. ANATOMY/PHYSICS: Use realistic proportions. No 'chibi' heads, no rubbery limbs. Gravity and perspective must be accurate.
2. LINE WORK: Professional Ink Illustration. Crisp black lines (#000000). No gray, no pencil sketches.
3. DEPTH: Use line density (hatching) to suggest depth, rather than leaving flat spaces.
4. NO TEXT: Absolutely NO words, letters, or signatures.
`;

// 도안 생성 프롬프트
export const COLORING_PROMPT_TEMPLATE = (userInput: string, difficultyLevel: number, style: ArtStyle) => {
  const diffKeywords = getDifficultyKeywords(difficultyLevel);
  
  let styleSpecificInstructions = "";
  
  if (style === ArtStyle.CHARACTER) {
    styleSpecificInstructions = `
    **FOCUS**: Character & Anatomy.
    - Draw the subject with realistic anatomical structure (muscles, fur texture, fabric folds).
    - Focus on facial expressions and dynamic poses.
    - Background should be minimal or atmospheric to highlight the character.`;
  } else {
    styleSpecificInstructions = `
    **FOCUS**: Scenery & Atmosphere.
    - Draw a wide-angle scene with realistic perspective (vanishing points).
    - Focus on textures of nature (leaves, bark, water ripples) or architecture (bricks, pillars).
    - The composition should feel immersive and vast.`;
  }

  return `**Role**: You are a master illustrator specializing in realistic pen-and-ink drawings.
**Task**: Create a high-quality black and white coloring page.

**SUBJECT**: "${userInput}"
**MODE**: ${style === ArtStyle.CHARACTER ? 'Character Portrait' : 'Landscape Scenery'}
**DIFFICULTY**: ${difficultyLevel}/5 (${diffKeywords})

${styleSpecificInstructions}

${REALISM_RULES}

**NEGATIVE PROMPT**:
text, watermark, grayscale, blurry, distorted face, extra fingers, cartoonish proportions, anime style, simple doodle, low resolution.`;
};

// 만다라 생성 프롬프트
export const MANDALA_PROMPT_TEMPLATE = (userInput: string, difficultyLevel: number) => {
  const diffKeywords = getDifficultyKeywords(difficultyLevel);
  return `**Role**: Mandala Master Artist.
**Task**: Create a symmetrical Mandala based on theme "${userInput}".
**Difficulty**: ${difficultyLevel}/5 (${diffKeywords})

[Rules]
1. Radial Symmetry.
2. Incorporate realistic elements of '${userInput}' into the pattern.
3. Crisp, sharp vector-like lines. No gray.
${REALISM_RULES}`;
};
