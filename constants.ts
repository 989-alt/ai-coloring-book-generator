export const DEFAULT_IMAGE_COUNT = 3;
export const MAX_IMAGE_COUNT = 5;
export const MIN_IMAGE_COUNT = 1;

// 난이도 1~5 단계 설정
export const DEFAULT_DIFFICULTY = 3;
export const MIN_DIFFICULTY = 1;
export const MAX_DIFFICULTY = 5;

export enum AppMode {
  COLORING = 'coloring',
  MANDALA = 'mandala'
}

export const LOCAL_STORAGE_KEY_API = 'gemini_coloring_api_key';

// [핵심 1] 난이도별 시각적 복잡도 정의 강화
const getDifficultyKeywords = (level: number): string => {
  switch (level) {
    case 1: return "Toddler level. Single massive central object. Extremely thick outlines (5px). No background. No internal details.";
    case 2: return "Preschool level. Large distinct patterns. Thick clean lines. Minimal background elements (e.g., simple sun).";
    case 3: return "Elementary level. Balanced composition. Moderate line weight. Clear subject with context.";
    case 4: return "High complexity. Detailed textures. Thinner lines. Full background scenery.";
    case 5: return "Expert level. Masterpiece complexity. Micro-details, zentangle patterns, very thin precision lines.";
    default: return "Standard coloring book style";
  }
};

// [핵심 3] 테두리 깔끔하게 (벡터 스타일) & [핵심 1] 글자 절대 제외
const QUALITY_RULES = `
[STRICT VISUAL RULES]
1. NO TEXT: Do not include any text, letters, numbers, signatures, or words. Pure visual art only.
2. LINE QUALITY: Digital vector art style. Lines must be crisp, sharp black strokes (#000000) on pure white background (#FFFFFF).
3. CLEAN EDGES: No blurry edges, no sketching lines, no shading, no grayscale. High contrast.
4. FINISH: Professional Adobe Illustrator style. Anti-aliased smooth curves.
`;

// [핵심 2] 주제 관련성 높이기 - Coloring Mode
export const COLORING_PROMPT_TEMPLATE = (userInput: string, difficultyLevel: number) => {
  const diffKeywords = getDifficultyKeywords(difficultyLevel);
  
  // 프롬프트 구조를 "역할 부여 - 명확한 지시 - 제약 사항" 순으로 배치하여 AI가 주제를 놓치지 않게 함
  return `**Role**: You are a professional children's book illustrator.
**Task**: Draw a black and white coloring page line art.

**SUBJECT**: "${userInput}" 
(Draw ONLY the subject specified above. Make it the clear central focus.)

**CONFIGURATION**:
- Difficulty: Level ${difficultyLevel}/5
- Style Details: ${diffKeywords}

${QUALITY_RULES}

**NEGATIVE PROMPT (Avoid at all costs)**:
text, words, alphabet, watermark, grayscale, shading, colors, blurry, pixelated, cropped subject, distorted lines, double lines.`;
};

// [핵심 2] 주제 관련성 높이기 - Mandala Mode
export const MANDALA_PROMPT_TEMPLATE = (userInput: string, difficultyLevel: number) => {
  const diffKeywords = getDifficultyKeywords(difficultyLevel);

  return `**Role**: You are a mandala artist.
**Task**: Create a symmetrical Mandala coloring page.

**THEME**: "${userInput}"
(Integrate visual elements of '${userInput}' into the radial patterns. e.g., if theme is 'Lion', use lion shapes in the geometry.)

**CONFIGURATION**:
- Difficulty: Level ${difficultyLevel}/5
- Pattern Density: ${diffKeywords}

${QUALITY_RULES}
- Composition: Radial symmetry, circular arrangement.

**NEGATIVE PROMPT**:
text, words, letters, uneven lines, broken symmetry, shading, filled colors, realistic photo style.`;
};
