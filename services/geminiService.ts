import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export const generateImageWithGemini = async (apiKey: string, prompt: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key가 필요합니다.");

  // 1. 표준 라이브러리 초기화 방식
  const genAI = new GoogleGenerativeAI(apiKey);

  // 2. 모델 설정 (gemini-1.5-flash 사용)
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ]
  });

  // 3. 프롬프트 강화: SVG 코드로만 답하도록 강제
  const modifiedPrompt = `${prompt}. 
  Please create a clean, black and white line art coloring page for children.
  IMPORTANT: Return ONLY valid SVG code. Do not include markdown code blocks (like \`\`\`xml). 
  Start directly with <svg ...> and end with </svg>.
  Ensure the SVG has a white background rectangle (<rect width="100%" height="100%" fill="white"/>) as the first element.`;

  try {
    // 4. 콘텐츠 생성 요청
    const result = await model.generateContent(modifiedPrompt);
    const response = await result.response;
    let svgText = response.text();

    if (!svgText) {
       throw new Error("도안 생성에 실패했습니다. (텍스트 데이터 없음)");
    }

    // 5. 데이터 정제 (마크다운 제거)
    svgText = svgText.replace(/```xml/g, '').replace(/```svg/g, '').replace(/```/g, '').trim();

    // 6. SVG를 Base64 이미지 포맷으로 변환
    // (한글/특수문자 깨짐 방지를 위해 인코딩 처리 추가)
    const base64Data = btoa(unescape(encodeURIComponent(svgText)));
    
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
