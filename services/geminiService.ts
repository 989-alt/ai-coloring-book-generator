import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateImageWithGemini = async (apiKey: string, prompt: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key가 필요합니다.");

  const genAI = new GoogleGenerativeAI(apiKey);

  // ⭐ 중요: 사용자님 리스트에 있는 '정확한 모델명' 사용
  // 1.5-flash 대신 이 이름을 써야 404가 안 뜹니다.
  const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest" 
  });

  // ⭐ 퀄리티 심폐소생술 프롬프트 (패턴화 전략)
  // AI가 못 그리는 '형태' 대신, 잘 하는 '무늬'로 승부합니다.
  const modifiedPrompt = `
    Role: Coloring Book Designer.
    Task: Create a "Zentangle" style coloring page for: "${prompt}".

    ### CRITICAL RULES (To avoid bad drawings):
    1.  **NO PRIMITIVE SHAPES:** Do NOT use simple <circle> or <rect>.
    2.  **STYLE:** "Mandala" or "Stained Glass".
        -   Instead of drawing a realistic dinosaur, draw the *outline* of a dinosaur and fill it with detailed floral patterns, swirls, and triangles.
        -   This is the most important rule. The inside must be decorative.
    3.  **BACKGROUND:** Fill the background with falling leaves, stars, or rays of light. Do not leave it white.
    4.  **TECHNICAL:**
        -   Return ONLY valid SVG code.
        -   Start with <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">.
        -   First element: <rect width="100%" height="100%" fill="white"/>
        -   Use <path stroke="black" stroke-width="1" fill="none" ... /> for everything.
  `;

  try {
    const result = await model.generateContent(modifiedPrompt);
    const response = await result.response;
    let svgText = response.text();

    if (!svgText) throw new Error("생성된 데이터가 없습니다.");

    // 데이터 정제
    svgText = svgText.replace(/```xml/g, '').replace(/```svg/g, '').replace(/```/g, '').trim();

    // SVG 태그 추출 (앞뒤 사족 제거)
    const svgStartIndex = svgText.indexOf("<svg");
    if (svgStartIndex >= 0) {
        svgText = svgText.substring(svgStartIndex);
    }
    const svgEndIndex = svgText.lastIndexOf("</svg>");
    if (svgEndIndex !== -1) {
        svgText = svgText.substring(0, svgEndIndex + 6);
    }

    // 인코딩
    const base64Data = btoa(unescape(encodeURIComponent(svgText)));
    return `data:image/svg+xml;base64,${base64Data}`;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // 이 모델마저 안 되면 정말 API 키 문제거나 일시적 오류입니다.
    throw new Error(`생성 실패: ${error.message}`);
  }
};
