import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateImageWithGemini = async (apiKey: string, prompt: string): Promise<string> => {
  // Gemini는 이제 복잡한 생각을 하지 않고, 단순 번역기로만 사용합니다.
  const genAI = new GoogleGenerativeAI(apiKey);
  // 가장 빠르고 기초적인 모델 사용 (복잡한 창의성 불필요)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 

  try {
    // 1. Gemini에게 단순 영작 요청
    // "공룡 그려줘" -> "A dinosaur" 정도로만 짧게 번역하게 합니다.
    const textPrompt = `Translate the following text into English. Returns only the translated text, no explanations. Text: "${prompt}"`;

    let translatedSubject = prompt; // API 키가 없거나 실패할 경우를 대비한 기본값
    try {
        if(apiKey) {
            const result = await model.generateContent(textPrompt);
            translatedSubject = result.response.text().trim();
        }
    } catch (e) {
        console.warn("Gemini 번역 실패, 원본 사용:", e);
    }

    console.log("번역된 주제:", translatedSubject);

    // 2. 프롬프트 강제 결합 (핵심!)
    // AI에게 맡기지 않고, 코드가 직접 스타일 태그를 때려 박습니다.
    // 이렇게 해야 '건물' 같은 엉뚱한 그림이 안 나옵니다.
    const styleTags = ", coloring book page, black and white line art, no shading, white background, clean lines, vector style, minimalist";
    const finalPrompt = translatedSubject + styleTags;

    console.log("최종 요청 프롬프트:", finalPrompt);

    // 3. Pollinations.ai 호출
    const seed = Math.floor(Math.random() * 1000000);
    // model=flux를 제거하여 기본 모델(Stable Diffusion 계열)을 사용합니다. 선화에는 이게 더 안정적입니다.
    // enhance=false를 추가하여 Pollinations가 제멋대로 프롬프트를 바꾸지 못하게 합니다.
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=768&height=1024&seed=${seed}&nologo=true&enhance=false`;

    // 4. 이미지 받아오기
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`이미지 서버 응답 오류: ${response.status}`);

    const blob = await response.blob();
    if (blob.type.includes("html")) throw new Error("이미지 생성 실패 (서버 과부하)");

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  } catch (error: any) {
    console.error("Image Generation Error:", error);
    // 사용자에게 보여줄 친절한 에러 메시지
    throw new Error("일시적인 이미지 서버 오류입니다. 3초 뒤에 다시 시도해주세요.");
  }
};
