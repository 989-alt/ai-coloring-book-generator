import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateImageWithGemini = async (apiKey: string, prompt: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key가 필요합니다.");

  const genAI = new GoogleGenerativeAI(apiKey);

  // ⭐ 모델 변경: 무료로 사용 가능하면서 가장 최신/고성능인 모델
  // gemini-3-pro는 유료 전용이므로, 2.5-flash를 사용합니다.
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash" 
  });

  // ⭐ 2.5 Flash 전용 초정밀 프롬프트
  // AI에게 "너는 단순한 코더가 아니라, 젠탱글 아티스트다"라고 최면을 겁니다.
  const modifiedPrompt = `
    Role: Professional Coloring Book Illustrator.
    Task: Create a highly detailed, dense SVG coloring page for: "${prompt}".

    ### CRITICAL RULES (Follow Strict):
    1.  **NO EMPTY SPACE:** The page must be 100% FILLED with details.
        -   Background must be dense (e.g., forest leaves, ocean waves, galaxy stars, floral patterns).
        -   Do not leave any large white areas.
    2.  **STYLE:** "Zentangle" & "Mandala" art style.
        -   Fill the main subject (e.g., dinosaur body) with intricate patterns (scales, swirls, dots).
    3.  **OUTPUT FORMAT:**
        -   **Return ONLY raw SVG code.** No markdown, no text.
        -   Start exactly with: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        -   First line inside svg: <rect width="100%" height="100%" fill="white"/> (Background).
        -   Use <path> with stroke="black" stroke-width="1.5" fill="none".
        -   Ensure all paths are closed.
    
    Generate a complex, beautiful line art that looks like a paid product.
  `;

  try {
    const result = await model.generateContent(modifiedPrompt);
    const response = await result.response;
    let svgText = response.text();

    if (!svgText) throw new Error("생성된 데이터가 없습니다.");

    // 데이터 정제 (마크다운 및 잡다한 텍스트 제거)
    svgText = svgText
      .replace(/```xml/g, '')
      .replace(/```svg/g, '')
      .replace(/```/g, '')
      .trim();

    // SVG 태그 찾아서 그 앞부분 잘라내기 (가끔 AI가 사족을 달 때 방지)
    const svgStartIndex = svgText.indexOf("<svg");
    if (svgStartIndex > 0) {
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

    // 혹시라도 2.5-flash가 안 될 경우를 대비한 메시지
    if (msg.includes("429") || msg.includes("quota")) {
         msg = "사용량이 초과되었습니다. 잠시 후 다시 시도하거나, 다른 구글 계정의 키를 사용해보세요.";
    }
    throw new Error(msg);
  }
};
