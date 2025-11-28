import { GoogleGenAI } from "@google/genai";

export const generateImageWithGemini = async (apiKey: string, prompt: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key가 필요합니다.");

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: "3:4" },
      },
    });

    let base64Data = null;
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Data = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Data) throw new Error("이미지 데이터가 없습니다.");
    return `data:image/png;base64,${base64Data}`;

  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error(error.message || "이미지 생성 실패");
  }
};