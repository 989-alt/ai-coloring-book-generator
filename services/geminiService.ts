import { GoogleGenerativeAI } from "@google/generative-ai";

// 무료 이미지 생성 서비스 (Pollinations) 설정
// flux 모델이 지시 이행력이 좋아서 다시 채택하되, 선화 스타일에 맞게 튜닝합니다.
const POLLINATIONS_BASE_URL = "https://image.pollinations.ai/prompt/";

export const generateImageWithGemini = async (apiKey: string, prompt: string): Promise<string> => {
  // 1. Gemini를 이용한 스마트 번역 (선택 사항)
  // API 키가 있으면 더 정확한 영어 프롬프트를 만들고, 없으면 입력한 한글을 그대로 씁니다.
  let finalSubject = prompt;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // 가장 빠르고 기초적인 모델 사용
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const translationPrompt = `Translate the following user text into simple, descriptive English for an image generator subject. User text: "${prompt}". Output ONLY the translated English text.`;
      const result = await model.generateContent(translationPrompt);
      finalSubject = result.response.text().trim();
      console.log(`Gemini 번역 결과: ${finalSubject}`);
    } catch (e) {
      console.warn("Gemini 번역 실패, 원본 프롬프트 사용:", e);
      // 번역 실패시 한글 그대로 진행
    }
  }

  // 2. "절대 명령" 프롬프트 조합 (핵심!)
  // 주제를 맨 앞에 두고, 스타일을 강력하게 강제합니다.
  // "vector line art"와 "clean minimalist"가 깔끔한 선의 핵심입니다.
  const styleImperative = ", vector line art style, coloring book page, clean black outline, white background, no shading, high contrast, thick lines, minimalist kids illustration";
  
  // 최종 프롬프트 예시: "A cat traveling in space, vector line art style, coloring book page..."
  const combinedPrompt = encodeURIComponent(finalSubject + styleImperative);
  
  // 매번 다른 이미지를 위한 랜덤 시드
  const seed = Math.floor(Math.random() * 1000000);

  // URL 생성 (모델 flux 지정, 로고 제거, nsfw 필터링)
  const imageUrl = `${POLLINATIONS_BASE_URL}${combinedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux&safe=true`;

  console.log("생성 요청 URL:", imageUrl);

  try {
    // 3. 이미지 데이터 fetch 및 Blob 변환
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`이미지 서버 오류 (${response.status})`);

    const blob = await response.blob();
    if (blob.type.includes("text") || blob.type.includes("html")) {
        throw new Error("이미지 생성 실패 (서버가 올바른 이미지를 반환하지 않음)");
    }

    // 4. Blob을 Base64 Data URL로 변환하여 반환
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  } catch (error: any) {
    console.error("이미지 생성 단계 에러:", error);
    throw new Error("잠시 후 다시 시도해주세요. (이미지 서버 과부하)");
  }
};
