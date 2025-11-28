import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateImageWithGemini = async (apiKey: string, prompt: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key가 필요합니다.");

  const genAI = new GoogleGenerativeAI(apiKey);

  // ⭐ 핵심: 사용자 리스트에 존재하는 '가장 똑똑한 모델' 선택
  // Gemini 3 Pro는 복잡한 패턴과 공간 지각 능력이 뛰어나서 도안 생성에 최적입니다.
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3-pro-preview" 
  });

  // ⭐ 초고퀄리티 도안 생성을 위한 '마스터 프롬프트'
  const modifiedPrompt = `
    Role: World-class Illustrator for Coloring Books.
    Task: Create a high-quality, complex SVG coloring page based on user input: "${prompt}".

    ### CRITICAL REQUIREMENTS (Must Follow):
    1.  **NO EMPTY SPACES:** This is a "Full Page" illustration. Fill the entire 512x512 canvas.
        -   If the subject is an animal, surround it with a dense forest, jungle, or flowers.
        -   If the subject is space, fill it with detailed stars, planets, and nebulas.
    2.  **ZENTANGLE STYLE:** Apply detailed "Zentangle" or "Mandala" patterns inside the main objects (e.g., scales, fur, leaves, clouds).
    3.  **TECHNICAL SPECS:**
        -   Output **ONLY** raw SVG code. No markdown (\`\`\`), no text.
        -   Start with: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        -   **First Line:** <rect width="100%" height="100%" fill="white"/> (White Background is mandatory).
        -   Use <path> elements with stroke="black" stroke-width="1.5" fill="none".
        -   Ensure all lines are closed paths (no loose ends).
    
    Create a masterpiece that looks like a professional coloring book page.
  `;

  try {
    const result = await model.generateContent(modifiedPrompt);
    const response = await result.response;
    let svgText = response.text();

    if (!svgText) throw new Error("생성된 데이터가 없습니다.");

    // 데이터 정제 (마크다운 제거)
    svgText = svgText
      .replace(/```xml/g, '')
      .replace(/```svg/g, '')
      .replace(/```/g, '')
      .trim();

    // SVG 코드 유효성 검사 (실수 방지)
    if (!svgText.startsWith("<svg")) {
        // 가끔 AI가 설명을 먼저 하는 경우, <svg> 태그부터 잘라냄
        const svgStartIndex = svgText.indexOf("<svg");
        if (svgStartIndex !== -1) {
            svgText = svgText.substring(svgStartIndex);
        }
    }

    // 인코딩 (Base64 변환)
    const base64Data = btoa(unescape(encodeURIComponent(svgText)));
    return `data:image/svg+xml;base64,${base64Data}`;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    let msg = error.message;

    // 만약 3-pro도 안 될 경우를 대비한 예외 처리
    if (msg.includes("404") || msg.includes("not found")) {
         msg = "모델 접속 오류: 'gemini-3-pro-preview'에 접근할 수 없습니다. 'gemini-2.5-pro'로 변경해보세요.";
    }
    throw new Error(msg);
  }
};
