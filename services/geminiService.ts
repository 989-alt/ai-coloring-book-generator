import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateImageWithGemini = async (apiKey: string, prompt: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key가 필요합니다.");

  // 1. 라이브러리 초기화
  const genAI = new GoogleGenerativeAI(apiKey);

  // 2. 모델 설정 수정 (여기가 핵심!)
  // 짧은 별칭 대신 구체적인 버전명(001)을 사용합니다.
  // 안전 설정(SafetySettings)을 제거하여 기본값을 사용합니다(오류 최소화).
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash-001" 
  });

  // 3. 프롬프트 강화: SVG 코드 생성 및 마크다운 제거 요청
  const modifiedPrompt = `${prompt}. 
  Please create a clean, black and white line art coloring page for children.
  IMPORTANT: Return ONLY valid SVG code. 
  Do not use markdown code blocks (like \`\`\`xml). 
  Start directly with <svg ...> and end with </svg>.
  Make sure to include a white background: <rect width="100%" height="100%" fill="white"/>.`;

  try {
    // 4. 요청 보내기
    const result = await model.generateContent(modifiedPrompt);
    const response = await result.response;
    let svgText = response.text();

    if (!svgText) {
       throw new Error("API 응답에서 텍스트를 찾을 수 없습니다.");
    }

    // 5. 데이터 정제 (마크다운 기호 제거)
    // AI가 습관적으로 ```xml 등을 붙이는 것을 강제로 지웁니다.
    svgText = svgText
      .replace(/```xml/g, '')
      .replace(/```svg/g, '')
      .replace(/```/g, '')
      .trim();

    // 6. 텍스트(SVG)를 이미지 데이터(Base64)로 변환
    // 한글이나 특수문자가 깨지지 않도록 인코딩 처리를 합니다.
    const base64Data = btoa(unescape(encodeURIComponent(svgText)));
    
    // 브라우저가 이미지로 인식하는 주소 반환
    return `data:image/svg+xml;base64,${base64Data}`;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // 404 오류가 또 발생할 경우를 대비한 안내 메시지
    let errorMsg = error.message;
    if (errorMsg.includes("404") || errorMsg.includes("not found")) {
        errorMsg = "모델을 찾을 수 없습니다. API Key가 올바른지, 또는 'gemini-pro'로 모델명을 변경해 보세요.";
    }
    throw new Error(errorMsg);
  }
};
