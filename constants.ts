export const DEFAULT_IMAGE_COUNT = 3;
export const MAX_IMAGE_COUNT = 5;
export const MIN_IMAGE_COUNT = 1;

// 난이도 1~5 단계 설정
export const DEFAULT_DIFFICULTY = 3;
export const MIN_DIFFICULTY = 1;
export const MAX_DIFFICULTY = 5;

// 앱 모드 변경: 숨은 그림 찾기 삭제 -> 만다라 추가
export enum AppMode {
  COLORING = 'coloring',
  MANDALA = 'mandala'
}

export const LOCAL_STORAGE_KEY_API = 'gemini_coloring_api_key';

// 난이도별 키워드 (공통 사용)
const getDifficultyKeywords = (level: number): string => {
  switch (level) {
    case 1: return "Toddler level. Huge simple shapes. Very thick bold lines. Minimal details. Vast white spaces.";
    case 2: return "Preschool level. Large distinct patterns. Thick clean lines. Easy to color. Simple composition.";
    case 3: return "Elementary level. Balanced details. Moderate line weight. Standard coloring book complexity.";
    case 4: return "High complexity. Detailed patterns. Thinner lines. Intricate textures and shading lines.";
    case 5: return "Expert level. Masterpiece complexity. Extremely intricate micro-details. Very thin, sharp, precise lines.";
    default: return "Standard coloring book style";
  }
};

// 공통: 벡터 스타일 품질 설정
const QUALITY_PROMPT = `
[Quality Rules]
- Style: Digital vector line art, Adobe Illustrator style.
- Lines: Crisp, sharp black strokes (#000000). No gray, no shading gradients.
- Background: Pure white (#FFFFFF).
- Finish: Professional, clean, anti-aliased.
`;

// 1. 일반 색칠공부 프롬프트
export const COLORING_PROMPT_TEMPLATE = (userInput: string, difficultyLevel: number) => {
  const diffKeywords = getDifficultyKeywords(difficultyLevel);
  
  return `Draw a black and white coloring page.
Theme: "${userInput}"
Difficulty: Level ${difficultyLevel}/5 (${diffKeywords})

[Instructions]
1. Draw a clear illustration of '${userInput}'.
2. Make it creative and dynamic.
3. Strict B&W line art only.
${QUALITY_PROMPT}`;
};

// 2. 만다라 프롬프트 (신규 추가)
export const MANDALA_PROMPT_TEMPLATE = (userInput: string, difficultyLevel: number) => {
  const diffKeywords = getDifficultyKeywords(difficultyLevel);

  return `Draw a symmetrical Mandala coloring page based on the theme: "${userInput}".
Difficulty: Level ${difficultyLevel}/5 (${diffKeywords})

[Mandala Rules]
1. COMPOSITION: Radial symmetry, circular or floral geometric arrangement.
2. THEME INTEGRATION: Incorporate elements of '${userInput}' into the repeating patterns (e.g., if theme is 'Cat', use cat silhouettes in the pattern).
3. If the theme is abstract, create a classic geometric mandala.
4. No text, no words.
${QUALITY_PROMPT}`;
};
