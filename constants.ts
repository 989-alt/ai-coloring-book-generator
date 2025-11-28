export const DEFAULT_IMAGE_COUNT = 3;
export const MAX_IMAGE_COUNT = 5;
export const MIN_IMAGE_COUNT = 1;

export const DEFAULT_DIFFICULTY = 3;
export const MIN_DIFFICULTY = 1;
export const MAX_DIFFICULTY = 5;

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
    case 1: return "Toddler Level. Simple clear outlines. No background. Large shapes.";
    case 2: return "Easy Level. Distinct lines. Minimal shading. Clear subject focus.";
    case 3: return "Standard Level. Realistic proportions. Balanced detail and texture.";
    case 4: return "High Detail. Intricate etching style. Fine hatching lines for shadow.";
    case 5: return "Masterpiece Level. Hyper-realistic engraving style. Extreme micro-details.";
    default: return "Standard style";
  }
};

const REALISM_RULES = `
[REALISM & QUALITY RULES]
1. ANATOMY/PHYSICS: Use realistic proportions. No 'chibi' heads.
2. LINE WORK: Professional Ink Illustration. Crisp black lines (#000000). No gray.
3. DEPTH: Use line density (hatching) to suggest depth.
4. NO TEXT: Absolutely NO words, letters, or signatures.
`;

// [업데이트] 이미지 분석 결과가 있을 경우 합치는 함수
export const COLORING_PROMPT_TEMPLATE = (
  userInput: string, 
  difficultyLevel: number, 
  style: ArtStyle,
  imageDescription?: string // 선택적 파라미터 추가
) => {
  const diffKeywords = getDifficultyKeywords(difficultyLevel);
  
  // 이미지 분석 결과가 있으면 그것을 메인으로 삼음
  const mainSubject = imageDescription 
    ? `Main Reference: ${imageDescription}\nUser Modification Request: "${userInput}"`
    : `"${userInput}"`;

  let styleSpecificInstructions = "";
  if (style === ArtStyle.CHARACTER) {
    styleSpecificInstructions = "**FOCUS**: Character & Anatomy. Focus on facial expressions.";
  } else {
    styleSpecificInstructions = "**FOCUS**: Scenery & Atmosphere. Realistic perspective.";
  }

  return `**Role**: You are a master illustrator specializing in realistic pen-and-ink drawings.
**Task**: Create a high-quality black and white coloring page.

**SUBJECT CONTEXT**: 
${mainSubject}
(If a Main Reference is provided, reconstruct that scene closely but converted into clean line art. Apply User Modification if specified.)

**CONFIGURATION**:
- Mode: ${style === ArtStyle.CHARACTER ? 'Character' : 'Landscape'}
- Difficulty: ${difficultyLevel}/5 (${diffKeywords})

${styleSpecificInstructions}
${REALISM_RULES}

**NEGATIVE PROMPT**:
text, watermark, grayscale, blurry, distorted face, extra fingers, low resolution.`;
};

// 만다라 프롬프트
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
