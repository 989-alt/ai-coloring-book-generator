import { GoogleGenAI } from "@google/genai";

// 파일 변환 헬퍼
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

// 1. 이미지 분석 (Vision API)
export const analyzeImageForPrompt = async (apiKey: string, imageFile: File): Promise<string> => {
  if (!apiKey) throw new Error("API Key가 필요합니다.");

  try {
    const base64Data = await fileToBase64(imageFile);
    // @ts-ignore: 타입 에러 무시 (라이브러리 호환성)
    const ai = new GoogleGenAI({ apiKey });
    
    // 모델 호출
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', 
      contents: {
        parts: [
          { text: "Describe this image in extreme detail for a coloring book artist." },
          { inlineData: { mimeType: imageFile.type, data: base64Data } }
        ]
      }
    });
    
    // 응답 추출 (안전하게 처리)
    let description = "";
    // @ts-ignore
    if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        // @ts-ignore
        description = response.candidates[0].content.parts[0].text;
    } else {
        description = "Image description unavailable.";
    }
    
    return description;

  } catch (error: any) {
    console.error("Vision Error:", error);
    return ""; // 에러 발생 시 빈 문자열 반환 (앱이 멈추지 않도록)
  }
};

// 2. 이미지 생성
export const generateImageWithGemini = async (apiKey: string, prompt: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key가 필요합니다.");

  // @ts-ignore
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // 사용자가 지정한 모델
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: "3:4" },
      },
    });

    let base64Data = null;
    // @ts-ignore
    if (response.candidates && response.candidates[0].content.parts) {
      // @ts-ignore
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
    console.error("Gemini Generation Error:", error);
    throw new Error(error.message || "이미지 생성 실패");
  }
};
