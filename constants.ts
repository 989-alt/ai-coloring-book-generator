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

// [핵심 1] 퀄리티 & 복잡도 향상을 위한 난이도별 스타일 정의
// 기존의 단순한 'Level' 개념을 넘어 '예술 기법'을 차등 적용
const getDifficultyKeywords = (level: number): string => {
  switch (level) {
    case 1: 
      // 1단계: 단순하지만 '고품질' 유지 (유아용)
      return "Toddler Art. Bold, uniform thick lines (marker style). Single central subject. No background. Large distinct shapes for easy coloring. Cute and rounded realism.";
    case 2: 
      // 2단계: 깔끔한 라인 (저학년)
      return "Clean Line Art. Medium line weight. Clear distinct outlines. Minimal background context. Focus on character/object clarity with slight realistic textures.";
    case 3: 
      // 3단계: 표준 (세밀화 시작)
      return "Standard Illustration. Balanced detail. Combination of thick outer lines and thin inner details. Full scene composition. Realistic proportions and natural poses.";
    case 4: 
      // 4단계: 고밀도 (성인 취미용)
      return "Intricate Etching Style. High density details. Use 'Hatching' and 'Stippling' for texture (but keep it black & white). Rich background scenery. Realistic botanical/anatomical accuracy.";
    case 5: 
      // 5단계: 초고밀도 (전문가용 마스터피스)
      return "Masterpiece Engraving. Extremely complex and dense. 'Horror Vacui' style (filling every space with detail). Fine art pen-and-ink quality. Micro-patterns on every surface. Hyper-realistic texture rendering.";
    default: 
      return "Standard coloring book style";
  }
};

// [핵심 2] 현실성(Realism)과 창의성(Creativity)의 균형을 잡는 공통 룰
const QUALITY_RULES = `
[VISUAL QUALITY RULES]
1. STYLE: Vintage scientific illustration meets modern line art. (Think: 19th-century encyclopedic etchings but cleaner).
2. REALISM: Use realistic proportions and anatomy. Do NOT use 'chibi', 'cartoonish', or 'caricature' distortion.
3. LINE WORK: Digital ink style. Crisp, sharp black strokes (#000000) on pure white (#FFFFFF). 
   - No gray, no shading gradients, no blurry sketches.
   - Use lines to suggest shadow (hatching), not gray colors.
4. CREATIVITY: Even if the subject is fantasy, render it with PHENOMENAL REALISM (e.g., if drawing a dragon, draw realistic scales and muscles).
5. NO TEXT: Absolutely NO words, letters, signatures, or watermarks.
`;

// [핵심 3] 도안 생성 프롬프트 (Coloring Mode)
export const COLORING_PROMPT_TEMPLATE = (userInput: string, difficultyLevel: number) => {
  const styleKeywords = getDifficultyKeywords(difficultyLevel);
  
  // 역할 부여를 '동화 작가'에서 '파인 아트 일러스트레이터'로 격상
  return `**Role**: You are a world-class Fine Art Illustrator specializing in pen-and-ink drawings.
**Task**: Create a high-complexity black and white coloring page.

**SUBJECT**: "${userInput}" 
(Focus on capturing the essence of the subject with artistic depth.)

**CONFIGURATION**:
- Complexity Level: ${difficultyLevel}/5
- Artistic Style: ${styleKeywords}

${QUALITY_RULES}

**COMPOSITION INSTRUCTIONS**:
- Center the main subject but extend the artwork to the edges (unless Level 1).
- For Level 3+, fill the negative space with thematic elements (leaves, clouds, geometric patterns) to increase complexity.
- Ensure all lines are closed (no gaps) for easier coloring.

**NEGATIVE PROMPT**:
text, watermark, grayscale, blurry, sketch, pencil rubbings, low quality, jpeg artifacts, distorted face, extra fingers, cartoonish, simple, minimalism (unless Level 1).`;
};

// [핵심 3] 만다라 생성 프롬프트 (Mandala Mode)
export const MANDALA_PROMPT_TEMPLATE = (userInput: string, difficultyLevel: number) => {
  const styleKeywords = getDifficultyKeywords(difficultyLevel);

  return `**Role**: You are a Master Sacred Geometry Artist.
**Task**: Create a highly detailed Symmetrical Mandala Coloring Page.

**THEME**: "${userInput}"
(Weave the visual elements of '${userInput}' seamlessly into the geometric pattern. Do not just paste the image in the center; integrate it.)

**CONFIGURATION**:
- Complexity Level: ${difficultyLevel}/5
- Pattern Style: ${styleKeywords}

${QUALITY_RULES}

**MANDALA SPECIFIC RULES**:
- Perfect Radial Symmetry.
- Line Consistency: Uniform line thickness appropriate for the difficulty level.
- Edge-to-Edge: The pattern should extend to the boundaries of the image.

**NEGATIVE PROMPT**:
text, broken symmetry, uneven lines, shading, filled colors, simplistic, boring.`;
};
