import { GoogleGenerativeAI } from "@google/generative-ai";

const POLLINATIONS_BASE_URL = "https://image.pollinations.ai/prompt/";

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
  
  // 1. Gemini 번역
  let finalSubject = prompt;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const translationPrompt = `
        Translate user input to English. Output ONLY the noun describing the main subject.
        User Input: "${prompt}"
        Example Output: "A cute cat"
      `;
      const result = await model.generateContent(translationPrompt);
      finalSubject = result.response.text().trim();
    } catch (e) {
      console.warn("Gemini 번역 실패, 원본 사용");
    }
  }

  // 2. 선명도 및 스타일 정의 (핵심 수정!)
  let stylePrompt = "";

  if (styleMode === 'mandala') {
    // 🌀 [만다라 모드] - 선이 번지지 않게 "Stained Glass(스테인드글라스)"나 "Stencil(스텐실)" 느낌 강조
    if (difficulty <= 3) {
      stylePrompt = ", very simple outline, thick black markers, no tiny details, easy coloring, distinct edges";
    } else if (difficulty <= 7) {
      stylePrompt = ", zentangle patterns, clean ink lines, sharp edges, high contrast, distinct sections";
    } else {
      // 고난이도에서도 뭉개짐 방지: "Fine Liner Pen(파인 라이너 펜)" 스타일
      stylePrompt = ", complex mandala, fine liner pen style, sharp geometric details, crisp vector lines, no blurring, high precision";
    }
  } else {
    // 🎨 [일반 도안 모드]
    if (difficulty <= 3) {
      stylePrompt = ", simple cartoon outline, bold lines, isolated subject, white background, sticker art style";
    } else if (difficulty <= 7) {
      stylePrompt = ", clean line art illustration, storybook style, clear background elements, sharp contours";
    } else {
      stylePrompt = ", highly detailed pen and ink drawing, engraving style, fine cross-hatching (but clean), masterpiece line art";
    }
  }

  // 3. 선명도 부스터 태그 (흐릿함 방지)
  // 'vector', 'sharp focus', 'high contrast'가 핵심입니다.
  const sharpnessTags = ", vector style, black and white only, pure black lines on pure white background, high contrast, 8k resolution, sharp focus, no shading, no gradients, no blurring, crisp edges, professional coloring book page";
  
  const fullPrompt = `${finalSubject}${stylePrompt}${sharpnessTags}`;
  
  console.log(`[요청] 난이도:${difficulty} | 프롬프트: ${fullPrompt}`);

  const encodedPrompt = encodeURIComponent(fullPrompt);
  const seed = Math.floor(Math.random() * 1000000);

  // enhance=false 고정 (주제 이탈 방지)
  // nologo=true (로고 제거)
  const imageUrl = `${POLLINATIONS_BASE_URL}${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux&enhance=false`;

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
