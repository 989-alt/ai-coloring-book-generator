import { GoogleGenerativeAI } from "@google/generative-ai";

// 무료 이미지 생성 서비스 설정
const POLLINATIONS_BASE_URL = "https://image.pollinations.ai/prompt/";

// 재시도(Retry)를 위한 헬퍼 함수
const fetchWithRetry = async (url: string, retries: number = 3, delayMs: number = 2000): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      // 10초 타임아웃 설정 (너무 오래 걸리면 끊고 재시도)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) return response;
      
      console.warn(`시도 ${i + 1}/${retries} 실패: ${response.status}. ${delayMs}ms 후 재시도...`);
    } catch (err) {
      console.warn(`시도 ${i + 1}/${retries} 네트워크 오류. ${delayMs}ms 후 재시도...`);
    }
    // 대기 후 재시도
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  throw new Error("이미지 서버가 현재 응답하지 않습니다.");
};

export const generateImageWithGemini = async (apiKey: string, prompt: string): Promise<string> => {
  // 1. Gemini 번역 (API 키 있을 때만)
  let finalSubject = prompt;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // 모델명 안전장치: flash-latest가 안 되면 1.5-flash 사용
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const translationPrompt = `Translate the following text into English for an image prompt. Output ONLY the English text. Text: "${prompt}"`;
      const result = await model.generateContent(translationPrompt);
      finalSubject = result.response.text().trim();
    } catch (e) {
      console.warn("Gemini 번역 실패 (무시하고 원본 사용):", e);
    }
  }

  // 2. 강력한 스타일 프롬프트 (주제 + 스타일 강제)
  const styleKeywords = ", vector line art, coloring book page, black and white, clean lines, white background, no shading, minimalist, cute style";
  const combinedPrompt = encodeURIComponent(finalSubject + styleKeywords);
  
  // 랜덤 시드 (캐싱 방지)
  const seed = Math.floor(Math.random() * 1000000);

  // URL 생성 (flux 모델 사용, 로고 제거)
  // safe=true는 가끔 오작동하므로 제거하고 프롬프트로 제어
  const imageUrl = `${POLLINATIONS_BASE_URL}${combinedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;

  console.log("이미지 요청 시작:", imageUrl);

  try {
    // 3. 재시도 로직으로 이미지 가져오기
    const response = await fetchWithRetry(imageUrl);
    
    const blob = await response.blob();
    
    // 텍스트(에러 HTML)가 넘어왔는지 확인
    if (blob.type.includes("text") || blob.type.includes("html")) {
        throw new Error("서버 과부하로 인해 이미지 생성 실패");
    }

    // 4. Base64 변환
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  } catch (error: any) {
    console.error("최종 이미지 생성 실패:", error);
    // 사용자에게 보여줄 친절한 메시지
    throw new Error("접속자가 많아 이미지를 가져오지 못했습니다. (자동 재시도 실패). 잠시 후 다시 클릭해주세요.");
  }
};
