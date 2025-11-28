import { GoogleGenerativeAI } from "@google/generative-ai";

const POLLINATIONS_BASE_URL = "https://image.pollinations.ai/prompt/";

// 재시도(Retry) 헬퍼 함수: 서버 과부하 시 자동으로 다시 시도합니다.
const fetchWithRetry = async (url: string, retries: number = 3, delayMs: number = 2000): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15초 타임아웃
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) return response;
      console.warn(`시도 ${i + 1} 실패... 재시도 중`);
    } catch (err) {
      console.warn(`네트워크 오류... 재시도 중`);
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  throw new Error("이미지 서버 응답 없음");
};

// 메인 생성 함수
export const generateImageWithGemini = async (
  apiKey: string, 
  prompt: string, 
  difficulty: number = 5 
): Promise<string> => {
  
  // 1. Gemini 번역 (API 키가 있을 때만 작동)
  let finalSubject = prompt;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // 가장 빠르고 안정적인 모델 사용
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const translationPrompt = `Translate the following text into English for an image prompt. Output ONLY the English text. Text: "${prompt}"`;
      const result = await model.generateContent(translationPrompt);
      finalSubject = result.response.text().trim();
    } catch (e) {
      console.warn("Gemini 번역 실패 (무시하고 원본 사용):", e);
    }
  }

  // 2. 난이도별 스타일 정의 (여기가 핵심!)
  // 난이도 숫자에 따라 프롬프트 뒤에 붙는 '스타일 태그'가 달라집니다.
  let styleKeywords = "";

  if (difficulty <= 3) {
    // [하: 1~3단계] 유아용 - 아주 단순하고 굵은 선, 배경 없음
    styleKeywords = ", simple vector line art, coloring book page, thick outlines, minimal detail, white background, no shading, cute style, isolated subject, easy to color";
  } else if (difficulty <= 7) {
    // [중: 4~7단계] 어린이용 - 적당한 배경, 동화책 스타일
    styleKeywords = ", vector line art, coloring book page, clean lines, detailed background, white background, no shading, storybook illustration, distinct shapes";
  } else {
    // [상: 8~10단계] 전문가용 - 젠탱글, 만다라, 꽉 찬 밀도
    styleKeywords = ", complex zentangle style, mandala patterns, intricate line art, dense composition, hyper-detailed background, adult coloring book masterpiece, full page illustration, no shading";
  }

  // 주제 + 난이도 스타일 결합
  const combinedPrompt = encodeURIComponent(finalSubject + styleKeywords);
  const seed = Math.floor(Math.random() * 1000000);

  // Pollinations URL 생성 (flux 모델 사용)
  const imageUrl = `${POLLINATIONS_BASE_URL}${combinedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;

  console.log(`[생성 요청] 난이도: ${difficulty}, URL: ${imageUrl}`);

  try {
    // 3. 재시도 로직으로 이미지 가져오기
    const response = await fetchWithRetry(imageUrl);
    const blob = await response.blob();
    
    // 에러 체크
    if (blob.type.includes("text") || blob.type.includes("html")) {
        throw new Error("서버 과부하로 인해 이미지 생성 실패");
    }

    // 4. Base64 변환 후 반환
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  } catch (error: any) {
    console.error("최종 이미지 생성 실패:", error);
    throw new Error("접속자가 많아 이미지를 가져오지 못했습니다. 잠시 후 다시 시도해주세요.");
  }
};
