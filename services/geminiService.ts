import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export const generateImageWithGemini = async (apiKey: string, prompt: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key가 필요합니다.");

  const genAI = new GoogleGenerativeAI(apiKey);

  // 이미지 생성 전용 모델
  const model = genAI.getGenerativeModel({ 
    model: "models/gemini-2.5-flash-image-preview",
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ]
  });

  const modifiedPrompt = `
    A professional, high-quality coloring book page for children featuring: "${prompt}".
    Style: Clean black line art on a white background. No shading, no colors, just outlines ready to be colored in. Detailed and full composition.
  `;

  try {
    const result = await model.generateContent(modifiedPrompt);
    const response = await result.response;

    let base64Image = null;
    let mimeType = null;

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        // 🚨 수정된 부분: (part as any)를 추가하여 TypeScript 오류를 무시합니다.
        // 라이브러리 버전에 따라 inlineData 타입이 없을 수 있기 때문입니다.
        if ((part as any).inlineData) {
            base64Image = (part as any).inlineData.data;
            mimeType = (part as any).inlineData.mimeType;
            break;
        }
      }
    }

    if (!base64Image) {
       // 만약 이미지가 없으면 텍스트라도 확인해봅니다.
       const fallbackText = response.text ? response.text() : "데이터 없음";
       console.error("이미지 미수신. 텍스트 응답:", fallbackText);
       throw new Error("이미지가 생성되지 않았습니다. (모델이 텍스트만 반환함)");
    }

    return `data:${mimeType};base64,${base64Image}`;

  } catch (error: any) {
    console.error("Gemini Image API Error:", error);
    let msg = error.message;
    if (msg.includes("404") || msg.includes("not found")) {
        msg = "모델을 찾을 수 없습니다. (모델명 오타 또는 권한 문제)";
    }
    throw new Error(msg);
  }
};
