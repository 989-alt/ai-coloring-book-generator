export const DEFAULT_IMAGE_COUNT = 3;
export const MAX_IMAGE_COUNT = 5;
export const MIN_IMAGE_COUNT = 1;

// [변경] 난이도 1~10 -> 1~5로 축소
export const DEFAULT_DIFFICULTY = 3; 
export const MIN_DIFFICULTY = 1;
export const MAX_DIFFICULTY = 5;

export const MIN_HIDDEN_ITEMS = 3;
export const MAX_HIDDEN_ITEMS = 10;
export const DEFAULT_HIDDEN_ITEMS = 5;

export enum AppMode {
  COLORING = 'coloring',
  HIDDEN_OBJECTS = 'hidden_objects'
}

export const HIDDEN_ITEM_POOL = [
  "Key", "Banana", "Moon", "Sock", "Hammer", "Leaf", "Star", "Bone", "Feather", "Spoon",
  "Glasses", "Umbrella", "Fish", "Envelope", "Mushroom", "Acorn", "Scissors", "Comb", "Bell", "Candle",
  "Crown", "Diamond", "Heart", "Anchor", "Balloon", "Butterfly", "Button", "Cactus", "Camera", "Carrot",
  "Cherry", "Clock", "Cloud", "Coin", "Compass", "Cupcake", "Donut", "Duck", "Egg", "Flower",
  "Fork", "Ghost", "Gift", "Guitar", "Hat", "Ice Cream", "Kite", "Lamp", "Lock", "Magnet"
];

// [변경] 난이도별 상세 정의 (1-5단계)
const getDifficultyKeywords = (level: number): string => {
  switch (level) {
    case 1: // 유아용: 매우 단순
      return "Toddler level. Single massive central object. Extremely thick, bold, uniform vector lines. No background (pure white). Cute, rounded shapes. No details inside the object.";
    case 2: // 유치원: 단순 + 약간의 배경
      return "Preschool level. Large distinct characters. Thick clean lines. Minimal background (e.g., just a floor line or simple sun). Easy to color large areas. Friendly and soft style.";
    case 3: // 초등 저학년: 표준
      return "Elementary school level. Standard coloring book style. Balanced detail. Clear subject with a full but simple background scene. Moderate line weight. Engaging action or story element.";
    case 4: // 초등 고학년: 디테일 추가
      return "Detailed style. Intricate patterns on clothes or objects. Dynamic shading lines (hatching). Full background scenery with textures (grass, bricks, leaves). Thinner, precise lines.";
    case 5: // 전문가/성인: 만다라/젠탱글
      return "Expert complexity. Zentangle and Mandala inspired style. Extremely intricate patterns, floral motifs, and geometric shapes filling the entire page. Very thin, sharp, high-precision lines. A masterpiece of line art.";
    default:
      return "Standard coloring book style";
  }
};

// [변경] 프롬프트 템플릿 고도화 (구조화된 프롬프트 사용)
export const COLORING_PROMPT_TEMPLATE = (userInput: string, difficultyLevel: number) => {
  const styleKeywords = getDifficultyKeywords(difficultyLevel);
  
  // 벡터 스타일과 라인 품질을 높이기 위한 공통 키워드
  const lineQuality = "Digital vector art style, adobe illustrator, high-resolution, anti-aliased, smooth curves, uniform line weight, crisp black strokes";

  return `You are a professional children's book illustrator. 
Task: Create a high-quality black and white coloring page based on the theme: "${userInput}".

[Configuration]
- Difficulty Level: ${difficultyLevel}/5
- Style Description: ${styleKeywords}
- Line Quality: ${lineQuality}

[Strict Composition Rules]
1. SUBJECT FOCUS: The main subject "${userInput}" must be clear, centered, and easily recognizable.
2. CREATIVITY: Do not just draw a static object. Give it a dynamic pose, emotion, or a whimsical twist to make it look natural and creative.
3. VECTOR LOOK: The lines must look like a vector image. No blurry edges, no sketchiness, no disconnects.
4. NO GRAYSCALE: Use ONLY pure black (#000000) and pure white (#FFFFFF). No gray, no shading gradients.

[Negative Prompt - Never Include]
Color, shading, gray tones, realistic photo, blurry lines, sketched lines, text, watermark, signature, double lines, distorted faces, cropped subject.`;
};

// 숨은 그림 찾기도 난이도 및 벡터 스타일 적용
export const HIDDEN_PROMPT_TEMPLATE = (userInput: string, selectedItems: string[]) => {
  const itemsString = selectedItems.join(", ");
  
  return `Create a high-quality 'Hidden Object Puzzle' (Seek and Find) for kids. Vector line art style.
Theme: '${userInput}'.
Hidden Items: [${itemsString}].

[Visual Style]
- Style: Professional vector line art, clear black outlines, white background.
- Line Quality: Smooth, continuous, unpixelated lines (like Adobe Illustrator).

[Layout Structure]
1. MAIN SCENE: A creative, full-page scene depicting '${userInput}'. The scene should be lively and natural.
2. HIDING LOGIC: The hidden items must be cleverly integrated into the line work (e.g., a 'Snake' forming a tree branch). They should be visible enough to find but disguised.
3. BOTTOM LEGEND: Draw a small row at the very bottom showing the isolated icons of the items to find.

[Constraints]
- No text/words inside the image.
- Black and white only.
- Exact item count matching the list.`;
};

export const LOCAL_STORAGE_KEY_API = 'gemini_coloring_api_key';
