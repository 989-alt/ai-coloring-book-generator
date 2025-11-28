import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateImageWithGemini = async (apiKey: string, prompt: string): Promise<string> => {
  // 1. Gemini 설정 (그림을 그리는 게 아니라, '프롬프트'를 영어로 멋지게 번역하는 역할)
  const genAI = new GoogleGenerativeAI(apiKey);
  // 리스트에 있던 가장 안정적인 모델 사용
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); 

  try {
    // 2. Gemini에게 "그림 주문서"를 작성하게 시킴
    // 한글로 "공룡"이라고 해도, Gemini가 "coloring book page of a cute dinosaur..."로 번역해줍니다.
    const textPrompt = `
      Translate and enhance the following user prompt into a detailed English prompt for an AI image generator to create a coloring book page.
      User Input: "${prompt}"
      
      Requirements for the output prompt:
      - Subject: Clear and cute.
      - Style: "Black and white line art", "coloring book page", "clean lines", "no shading", "white background".
      - Quality: "High quality", "detailed", "vector style".
      - Output: JUST the English prompt string. No explanations.
    `;

    // 만약 Gemini 키가 없거나 에러가 나면, 그냥 입력된 텍스트를 그대로 씁니다.
    let enhancedPrompt = prompt;
    try {
        if(apiKey) {
            const result = await model.generateContent(textPrompt);
            enhancedPrompt = result.response.text().trim();
        }
    } catch (e) {
        console.warn("Gemini 프롬프트 생성 실패, 원본 사용:", e);
    }

    console.log("생성된 프롬프트:", enhancedPrompt);

    // 3. Pollinations.ai (무료 이미지 생성 API) 호출
    // 랜덤 시드(seed)를 추가하여 매번 다른 그림이 나오게 함
    const seed = Math.floor(Math.random() * 1000000);
    // URL에 설정을 포함시킵니다 (width, height, nologo 등)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;

    // 4. 이미지를 받아와서 웹앱에서 쓸 수 있는 데이터(Blob)로 변환
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("이미지 서버 응답 오류");

    const blob = await response.blob();
    
    // Blob을 Base64 Data URL로 변환하여 반환
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  } catch (error: any) {
    console.error("Image Generation Error:", error);
    throw new Error("이미지 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }
};
