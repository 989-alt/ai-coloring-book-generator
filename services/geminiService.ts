import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

export const generateImageWithGemini = async (apiKey: string, prompt: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key가 필요합니다.");

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Updated to nano banana model for image generation
      contents: { parts: [{ text: prompt }] },
      config: {
        // Safety Settings: BLOCK_NONE is crucial for creative tasks to avoid false positives
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
      },
    });

    let base64Data = null;
    
    // Check for image generation response structure
    // The nano banana model returns inlineData in the response candidates.

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Data = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Data) {
       // If no inline data, check if there is text explaining why, or try a fallback logic if needed.
       console.error("No inlineData found in response:", response);
       throw new Error("이미지를 생성할 수 없습니다. (데이터 없음)");
    }

    return `data:image/png;base64,${base64Data}`;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    let errorMsg = error.message || "이미지 생성 실패";
    if (errorMsg.includes("SAFETY")) {
        errorMsg = "안전 정책에 의해 차단되었습니다. 주제를 변경해보세요.";
    }
    throw new Error(errorMsg);
  }
};
