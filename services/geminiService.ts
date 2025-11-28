import { GoogleGenAI } from "@google/genai";

// Base64 변환 헬퍼
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result?.toString();
      const base64String = result?.split(',')[1] || '';
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

// 이미지 분석
export const analyzeImageForPrompt = async (apiKey: string, imageFile: File): Promise<string> => {
  if (!apiKey) return "";

  try {
    const base64Data = await fileToBase64(imageFile);
    // @ts-ignore
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', 
      contents: {
        parts: [
          { text: "Describe this image in detail for a coloring book artist." },
          { inlineData: { mimeType: imageFile.type, data: base64Data } }
        ]
      }
    });
    
    // @ts-ignore
    return response.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error("Vision Error:", error);
    return ""; 
  }
};

// 이미지 생성
export const generateImageWithGemini = async (apiKey: string, prompt: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key가 필요합니다.");

  // @ts-ignore
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "3:4" } },
    });

    // @ts-ignore
    const parts = response.candidates?.[0]?.content?.parts || [];
    let base64Data = null;
    
    for (const part of parts) {
      if (part.inlineData) {
        base64Data = part.inlineData.data;
        break;
      }
    }

    if (!base64Data) throw new Error("이미지 데이터 없음");
    return `data:image/png;base64,${base64Data}`;
  } catch (error: any) {
    console.error("Gen Error:", error);
    throw new Error(error.message || "생성 실패");
  }
};
