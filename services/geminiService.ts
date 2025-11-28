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
  
  // 1. Gemini 번역: 오직 "시각적 주제"만 영어로 번역
  let finalSubject = prompt;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // 번역할 때 "풍경"이나 "건물" 같은 단어를 멋대로 넣지 못하게 방어
      const translationPrompt = `
        Translate the user input into a simple English noun phrase describing the main subject.
        User Input: "${prompt}"
        Output example: "A cute cat in a spacesuit" (No extra words)
      `;
      const result = await model.generateContent(translationPrompt);
      finalSubject = result.response.text().trim();
    } catch (e) {
      console.warn("Gemini 번역 실패, 원본 사용");
    }
  }

  // 2. 모드 및 난이도별 "강력한" 프롬프트 설계
  let coreStructure = ""; // 주제를 어떻게 배치할지 결정

  if (styleMode === 'mandala') {
    // 🌀 [만다라 모드]
    // 주제 형태 안에 패턴을 채우는 방식
    coreStructure = `Vector line art of ${finalSubject}, filled with `;
    
    if (difficulty <= 3) {
      coreStructure += "very simple big geometric shapes, thick lines, easy coloring";
    } else if (difficulty <= 7) {
      coreStructure += "mandala patterns, zentangle details, floral elements";
    } else {
      coreStructure += "extremely complex microscopic mandala patterns, intricate lace design, masterpiece";
    }
  } else {
    // 🎨 [일반 도안 모드] - 여기가 문제였음!
    // 주제를 "Portrait(초상화)"나 "Character(캐릭터)"로 정의해서 배경이 주가 되는 것을 막음.
    
    if (difficulty <= 2) {
      // [난이도 1-2] 배경 완전 삭제, 캐릭터만 빡!
      coreStructure = `A simple cute outline drawing of ${finalSubject}, isolated on white background, thick lines, no background, minimal details, sticker style`;
    } else if (difficulty <= 4) {
      // [난이도 3-4] 약간의 장식
      coreStructure = `A coloring book page of ${finalSubject}, simple cartoon style, clean lines, white background, very few background details`;
    } else if (difficulty <= 6) {
      // [난이도 5-6] 표준 도안
      coreStructure = `A clear line art illustration of ${finalSubject}, centered composition, standard coloring book style, distinct lines`;
    } else if (difficulty <= 8) {
      // [난이도 7-8] 배경 추가 (단, 주제 뒤에)
      coreStructure = `A detailed professional illustration of ${finalSubject}, with background scenery behind the subject, dynamic pose, crisp line art`;
    } else {
      // [난이도 9-10] 복잡한 묘사
      coreStructure = `A masterpiece engraving style drawing of ${finalSubject}, highly detailed textures, complex background filling the page, fine ink lines`;
    }
  }

  // 3. 공통 "도면" 방지 태그
  // 'architecture', 'building' 등이 나오지 않도록 'organic', 'character design' 등의 뉘앙스 추가
  const safetyTags = ", coloring book, black and white, uncolored, no shading, high contrast, clean white background";
  
  // 최종 프롬프트 결합
  const fullPrompt = `${coreStructure}${safetyTags}`;
  
  console.log(`[요청] 난이도:${difficulty} | 프롬프트: ${fullPrompt}`);

  const encodedPrompt = encodeURIComponent(fullPrompt);
  const seed = Math.floor(Math.random() * 1000000);

  // ⭐ 핵심 수정: enhance=false 고정!
  // AI가 멋대로 "풍경화"로 바꾸는 것을 원천 차단합니다.
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
