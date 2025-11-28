import { GoogleGenerativeAI } from "@google/generative-ai";

const POLLINATIONS_BASE_URL = "https://image.pollinations.ai/prompt/";

// 재시도 헬퍼 함수
const fetchWithRetry = async (url: string, retries: number = 3): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15초 타임아웃
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) return response;
    } catch (err) {
      console.warn(`재시도 ${i + 1}/${retries}...`);
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  throw new Error("이미지 서버 응답 없음");
};

// ⭐ 함수 모양 변경: difficulty(난이도) 파라미터 추가!
export const generateImageWithGemini = async (
  apiKey: string, 
  prompt: string, 
  difficulty: number = 5 // 기본값 5
): Promise<string> => {
  
  // 1. Gemini 번역 및 내용 확장 (API 키 사용 시)
  let finalSubject = prompt;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // 프롬프트를 단순히 번역하는 게 아니라, '배경'을 묘사하도록 시킵니다.
      const enhancePrompt = `
        Translate and expand this prompt into English for an AI Image Generator.
        User Input: "${prompt}"
        
        Rules:
        1. Keep the main subject clear.
        2. If the user mentions a setting (like 'space', 'forest'), describe the background in detail.
        3. Output ONLY the English prompt string.
      `;
      const result = await model.generateContent(enhancePrompt);
      finalSubject = result.response.text().trim();
    } catch (e) {
      console.warn("Gemini 번역 실패, 원본 사용");
    }
  }

  // 2. 난이도별 스타일 정의 (여기가 핵심!)
  let styleKeywords = "";
  
  if (difficulty <= 3) {
    // [하] 단순하고 굵은 선, 캐릭터 중심
    styleKeywords = ", simple vector line art, thick outlines, minimal detail, white background, no shading, easy coloring page for toddlers";
  } else if (difficulty <= 7) {
    // [중] 적당한 배경과 묘사
    styleKeywords = ", vector line art, standard coloring book page, clean lines, detailed background, distinct shapes, storybook illustration style";
  } else {
    // [상] 젠탱글, 만다라, 꽉 찬 밀도
    styleKeywords = ", highly detailed zentangle style, mandala patterns, intricate line art, dense composition, hyper-detailed background, adult coloring book masterpiece, full page illustration";
  }

  // 주제 + 난이도 스타일 결합
  const combinedPrompt = encodeURIComponent(finalSubject + styleKeywords);
  const seed = Math.floor(Math.random() * 1000000);

  // enhance=true를 켜서 '우주' 같은 배경이 잘리거나 단순해지는 것을 방지합니다.
  const imageUrl = `${POLLINATIONS_BASE_URL}${combinedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux&enhance=true`;

  try {
    const response = await fetchWithRetry(imageUrl);
    const blob = await response.blob();
    
    if (blob.type.includes("text") || blob.type.includes("html")) {
        throw new Error("이미지 생성 실패");
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  } catch (error: any) {
    console.error("생성 에러:", error);
    throw new Error("서버 과부하로 실패했습니다. 잠시 후 다시 시도해주세요.");
  }
};
