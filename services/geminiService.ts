import { GoogleGenerativeAI } from "@google/generative-ai";

const POLLINATIONS_BASE_URL = "https://image.pollinations.ai/prompt/";

const fetchWithRetry = async (url: string, retries: number = 3, delayMs: number = 2000): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20초 타임아웃
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) return response;
    } catch (err) {
      console.warn(`재시도 ${i + 1}...`);
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  throw new Error("이미지 서버 응답 없음");
};

// ⭐ 수정 포인트: styleMode 파라미터 추가
export const generateImageWithGemini = async (
  apiKey: string, 
  prompt: string, 
  difficulty: number,
  styleMode: 'normal' | 'mandala' // 'normal' 또는 'mandala'
): Promise<string> => {
  
  // 1. Gemini 번역 및 묘사 강화
  let finalSubject = prompt;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const translationPrompt = `
        Translate the user input into a detailed English prompt for an AI Image Generator.
        User Input: "${prompt}"
        
        Guidelines:
        - Output ONLY the English text.
        - If the style is 'mandala', focus on the subject's shape.
        - If the style is 'normal', describe the scene, pose, and background details.
      `;
      const result = await model.generateContent(translationPrompt);
      finalSubject = result.response.text().trim();
    } catch (e) {
      console.warn("Gemini 번역 실패, 원본 사용");
    }
  }

  // 2. 스타일 및 난이도별 프롬프트 조합 (핵심!)
  let styleDetails = "";

  if (styleMode === 'mandala') {
    // 🌀 [만다라 모드]
    // 난이도가 높을수록 패턴이 촘촘해지고 복잡해짐
    if (difficulty <= 3) {
      styleDetails = ", simple zentangle patterns, big shapes, thick lines, easy to color, cute style, white background";
    } else if (difficulty <= 7) {
      styleDetails = ", detailed mandala patterns inside the subject, floral and geometric elements, clean lines, creative coloring page, vector style";
    } else {
      styleDetails = ", highly complex mandala, hyper-detailed zentangle, intricate geometric patterns filling the entire subject, masterpiece, ultra-thin lines, professional adult coloring book";
    }
  } else {
    // 🎨 [일반 도안 모드]
    // 난이도가 높을수록 배경 묘사와 사물 디테일이 살아남 (만다라 아님!)
    if (difficulty <= 3) {
      styleDetails = ", simple cartoon style, thick outlines, isolated subject, no background, minimal details, cute and easy, for toddlers";
    } else if (difficulty <= 7) {
      styleDetails = ", illustrative style, distinct lines, detailed background environment (trees, clouds, etc), storybook quality, standard coloring book page";
    } else {
      styleDetails = ", highly detailed professional illustration, dense background scenery, realistic textures (fur, scales) depicted in line art, dynamic composition, masterpiece, intricate line work, for advanced coloring";
    }
  }

  // 공통 고퀄리티 태그 (건물만 나오는 버그 방지 및 선명도 향상)
  const commonTags = ", black and white, uncolored, line art only, vector style, white background, no shading, no grayscale, crisp lines, high quality";
  
  const finalPrompt = encodeURIComponent(finalSubject + styleDetails + commonTags);
  const seed = Math.floor(Math.random() * 1000000);

  // enhance=true를 사용하여 AI가 프롬프트를 더 풍성하게 해석하도록 유도
  const imageUrl = `${POLLINATIONS_BASE_URL}${finalPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux&enhance=true`;

  console.log(`[요청] 모드:${styleMode}, 난이도:${difficulty}, URL:${imageUrl}`);

  try {
    const response = await fetchWithRetry(imageUrl);
    const blob = await response.blob();
    
    if (blob.type.includes("text") || blob.type.includes("html")) {
        throw new Error("서버 오류");
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  } catch (error: any) {
    throw new Error("이미지 생성 실패. 잠시 후 다시 시도해주세요.");
  }
};
