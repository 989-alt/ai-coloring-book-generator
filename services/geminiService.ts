import { GoogleGenerativeAI } from "@google/generative-ai";

const POLLINATIONS_BASE_URL = "https://image.pollinations.ai/prompt/";

// 재시도 헬퍼 함수
const fetchWithRetry = async (url: string, retries: number = 3, delayMs: number = 2000): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); 
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

export const generateImageWithGemini = async (
  apiKey: string, 
  prompt: string, 
  difficulty: number,
  styleMode: 'normal' | 'mandala'
): Promise<string> => {
  
  // 1. Gemini 번역: "주제"만 명확하게 뽑아내도록 지시
  let finalSubject = prompt;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const translationPrompt = `
        Translate the user's input into a concise English description of the VISUAL SUBJECT only. 
        Do NOT add any style keywords like "coloring book" or "line art". Just describe the object/scene.
        User Input: "${prompt}"
      `;
      const result = await model.generateContent(translationPrompt);
      finalSubject = result.response.text().trim();
    } catch (e) {
      console.warn("Gemini 번역 실패, 원본 사용");
    }
  }

  // 2. 난이도 및 스타일 정밀 세분화 (5단계 시스템)
  let stylePrompt = "";

  if (styleMode === 'mandala') {
    // 🌀 [만다라 모드] - 패턴의 밀도 조절
    if (difficulty <= 2) {
      stylePrompt = ", very simple outline, big shapes, minimal patterns, thick lines, easy for toddlers, white background";
    } else if (difficulty <= 4) {
      stylePrompt = ", simple zentangle patterns, distinct sections, clean lines, fun patterns, easy coloring";
    } else if (difficulty <= 6) {
      stylePrompt = ", medium complexity mandala, floral and geometric patterns inside, standard adult coloring book style";
    } else if (difficulty <= 8) {
      stylePrompt = ", intricate mandala design, fine details, lace-like patterns, complex zentangle, dense composition";
    } else {
      stylePrompt = ", extreme complexity, microscopic mandala patterns, hyper-detailed, masterpiece, ultra-fine lines, kaleidoscope effect, no empty spaces";
    }
  } else {
    // 🎨 [일반 도안 모드] - 배경과 묘사의 사실성 조절
    if (difficulty <= 2) {
      stylePrompt = ", simple cartoon icon, very thick outlines, isolated subject, white background, no background details, for preschool";
    } else if (difficulty <= 4) {
      stylePrompt = ", cute character illustration, simple background elements (clouds, stars), standard line weight, clear shapes, storybook style";
    } else if (difficulty <= 6) {
      stylePrompt = ", detailed illustration, full scene background (forest/city/space), realistic proportions, standard coloring book page, crisp lines";
    } else if (difficulty <= 8) {
      stylePrompt = ", highly detailed pen drawing, textured fur/scales/feathers, complex background scenery, dynamic shading with lines, fine art style";
    } else {
      stylePrompt = ", hyper-realistic engraving style, extremely complex details, dense foliage/architecture, masterpiece illustration, museum quality line art, barely any empty white space";
    }
  }

  // 3. 주제 이탈 방지를 위한 프롬프트 구조화
  // Subject를 맨 앞에 배치하고, 가중치를 주는 느낌으로 강조
  // stylePrompt와 공통 태그를 뒤에 붙임
  const commonTags = ", black and white, line art only, uncolored, vector style, no shading, no grayscale, high contrast";
  
  // (중요) 프롬프트 순서: [주제] + [스타일/난이도] + [공통규칙]
  const fullPrompt = `${finalSubject}${stylePrompt}${commonTags}`;
  
  console.log(`[생성 요청] 난이도:${difficulty} | 프롬프트: ${fullPrompt}`);

  const encodedPrompt = encodeURIComponent(fullPrompt);
  const seed = Math.floor(Math.random() * 1000000);

  // enhance=false로 변경: AI가 제멋대로 해석해서 엉뚱한 그림(건물 등)을 그리는 것을 방지하고, 우리가 짠 프롬프트를 따르게 함
  // 단, 난이도가 높을 때(8 이상)는 enhance=true가 더 좋은 퀄리티를 줄 수도 있으므로 동적으로 처리
  const useEnhance = difficulty >= 8; 
  
  const imageUrl = `${POLLINATIONS_BASE_URL}${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux&enhance=${useEnhance}`;

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
