import { GoogleGenAI } from "@google/genai";

// 이미지를 Base64로 변환하는 헬퍼 함수
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // "data:image/png;base64," 부분 제거하고 순수 데이터만 추출
      const base64String = reader.result?.toString().split(',')[1]; 
      resolve(base64String || '');
    };
    reader.onerror = (error) => reject(error);
  });
};

// 1. 이미지 분석 (Vision API)
export const analyzeImageForPrompt = async (apiKey: string, imageFile: File): Promise<string> => {
  if (!apiKey) throw new Error("API Key가 필요합니다.");

  // 주의: 구버전 SDK가 아닌 최신 @google/genai 사용 시 문법이 다를 수 있으나,
  // 여기서는 호환성을 위해 google-generative-ai 스타일로 작성하되
  // 사용자 환경(@google/genai)에 맞춰 유연하게 처리합니다.
  
  // 만약 @google/generative-ai 패키지를 쓴다면 코드가 달라지지만, 
  // 현재 환경을 고려해 기존에 작동하던 방식을 확장합니다.
  
  try {
    const base64Data = await fileToBase64(imageFile);
    const ai = new GoogleGenAI({ apiKey });
    
    // 비전 분석에는 1.5-flash 모델이 가장 빠르고 정확함
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', 
      contents: {
        parts: [
          { text: "Describe this image in extreme detail so a blind artist could recreate its composition as a black and white coloring page line art. Focus on subject, pose, and background elements." },
          { inlineData: { mimeType: imageFile.type, data: base64Data } }
        ]
      }
    });
    
    // 응답 텍스트 추출
    const description = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!description) throw new Error("이미지 분석 실패");
    
    return description;

  } catch (error: any) {
    console.error("Vision API Error:", error);
    throw new Error("이미지를 분석할 수 없습니다. (모델이 지원하지 않거나 키 오류)");
  }
};

// 2. 이미지 생성 (기존 유지)
export const generateImageWithGemini = async (apiKey: string, prompt: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key가 필요합니다.");

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // 사용자가 설정한 모델 유지
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
    console.error("Gemini Generation Error:", error);
    throw new Error(error.message || "이미지 생성 실패");
  }
};
