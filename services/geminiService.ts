import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateImageWithGemini = async (apiKey: string, prompt: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key가 필요합니다.");

  const genAI = new GoogleGenerativeAI(apiKey);

  // ⭐ 모델: 리스트에 있는 것 중 가장 최신/똑똑한 2.0 버전 사용
  // 무료이면서도 복잡한 구조를 이해할 수 있는 유일한 희망입니다.
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp" 
  });

  // ⭐ 마법의 프롬프트: "도형 금지, 펜 드로잉 스타일 강제"
  // 단순한 <circle>, <rect>를 쓰지 못하게 하여, 사람이 펜으로 그린 듯한 복잡한 선을 유도합니다.
  const modifiedPrompt = `
    You are a professional Pen Plotter Artist.
    Task: Create a complex, intricate coloring page for: "${prompt}".

    ### CRITICAL RULES FOR HIGH QUALITY (Must Follow):
    1.  **NO PRIMITIVE SHAPES:** Do NOT use <circle>, <rect>, <ellipse>, or <line> tags.
    2.  **PATH ONLY:** Use ONLY <path d="..." /> elements to draw everything. This makes the drawing look like a hand-drawn illustration, not a geometric diagram.
    3.  **STYLE:** "Engraving" or "Woodcut" style. Use wavy lines and hatching for texture (fur, clouds, leaves).
    4.  **COMPOSITION:** Full page. Fill the background with organic patterns (flowers, vines, clouds). No empty space.
    5.  **TECHNICAL:**
        -   Return ONLY raw SVG code.
        -   Canvas: 512x512.
        -   Start with: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        -   First line: <path d="M0 0h512v512H0z" fill="white"/> (White background).
        -   Stroke: Black (#000000), stroke-width="1.5", fill="none".
    
    Draw it like a masterpiece ink illustration.
  `;

  try {
    const result = await model.generateContent(modifiedPrompt);
    const response = await result.response;
    let svgText = response.text();

    if (!svgText) throw new Error("데이터 없음");

    // 데이터 정제
    svgText = svgText
      .replace(/```xml/g, '')
      .replace(/```svg/g, '')
      .replace(/```/g, '')
      .trim();

    // SVG 추출
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
    let msg = error.message;
    
    // 2.0 모델도 안 될 경우 (드물지만) 1.5-flash로 자동 전환 안내
    if (msg.includes("429") || msg.includes("not found")) {
         msg = "2.0 모델 사용량이 많습니다. 잠시 후 다시 시도하거나, 코드에서 'gemini-1.5-flash'로 변경해보세요.";
    }
    throw new Error(msg);
  }
};
