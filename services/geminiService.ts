import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

export const generateImageWithGemini = async (apiKey: string, prompt: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key가 필요합니다.");

  const ai = new GoogleGenAI({ apiKey });

  // 1. 프롬프트 강화: 무조건 SVG 코드로만 답하도록 강제합니다.
  const modifiedPrompt = `${prompt}. 
  Please create a clean, black and white line art coloring page for children.
  IMPORTANT: Return ONLY valid SVG code. Do not include markdown code blocks (like \`\`\`xml). 
  Start directly with <svg ...> and end with </svg>.
  Ensure the SVG has a white background rectangle (<rect width="100%" height="100%" fill="white"/>) as the first element.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', 
      contents: { parts: [{ text: modifiedPrompt }] },
      config: {
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
      },
    });

    // 2. 응답 처리 방식 변경: 이미지가 아닌 '텍스트(SVG 코드)'를 받아옵니다.
    let svgText = null;

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          svgText = part.text;
          break;
        }
      }
    }

    if (!svgText) {
       console.error("No text found in response:", response);
       throw new Error("도안 생성에 실패했습니다. (텍스트 데이터 없음)");
    }

    // 3. 데이터 정제: 혹시 모를 마크다운 태그 제거
    svgText = svgText.replace(/```xml/g, '').replace(/```svg/g, '').replace(/```/g, '').trim();

    // 4. SVG를 Base64 이미지 포맷으로 변환 (앱은 이것을 이미지 파일로 인식합니다)
    const base64Data = btoa(unescape(encodeURIComponent(svgText)));
    
    // 브라우저가 이미지로 인식할 수 있는 Data URL 반환
    return `data:image/svg+xml;base64,${base64Data}`;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    let errorMsg = error.message || "이미지 생성 실패";
    if (errorMsg.includes("SAFETY")) {
        errorMsg = "안전 정책에 의해 차단되었습니다. 주제를 변경해보세요.";
    }
    throw new Error(errorMsg);
  }
};
