import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateImageWithGemini = async (apiKey: string, prompt: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key가 필요합니다.");

  const genAI = new GoogleGenerativeAI(apiKey);

  // 1. 모델 설정: 확실히 작동하는 'gemini-1.5-flash'를 사용합니다.
  // 이 모델은 속도가 빠르고 선생님 계정에서 404가 안 뜰 확률이 가장 높습니다.
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // 2. 퀄리티 업그레이드 프롬프트
  // Flash 모델도 이 지시사항을 따르면 사진처럼 빽빽한 그림을 그려냅니다.
  const modifiedPrompt = `
    Role: You are a master SVG artist creating a complex coloring page.
    User Request: "${prompt}"

    CRITICAL RULES FOR "FULL & DETAILED" OUTPUT:
    1.  **Density:** The page must be 100% FILLED. No large empty white spaces.
    2.  **Background:** You MUST draw a detailed background suitable for the subject (e.g., a dense forest, starry sky, underwater coral reef, flowery garden).
    3.  **Texture:** Use "Zentangle" or "Mandala" patterns inside objects (scales on dinosaurs, veins on leaves, swirls in clouds).
    4.  **Lines:** - Use <path> with stroke="black" and fill="none".
        - Vary stroke-width slightly (1.5 to 3) for depth.
        - Ensure all shapes are closed.
    5.  **Output:** - Return ONLY valid SVG code.
        - Start with: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        - First element: <rect width="100%" height="100%" fill="white"/>
        - End with: </svg>
    
    Do NOT include markdown (\`\`\`). Do NOT include explanations. Just the code.
  `;

  try {
    const result = await model.generateContent(modifiedPrompt);
    const response = await result.response;
    let svgText = response.text();

    if (!svgText) throw new Error("API 응답이 비어있습니다.");

    // 데이터 정제
    svgText = svgText.replace(/```xml/g, '').replace(/```svg/g, '').replace(/```/g, '').trim();

    // 인코딩
    const base64Data = btoa(unescape(encodeURIComponent(svgText)));
    return `data:image/svg+xml;base64,${base64Data}`;

  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    // 만약 1.5-flash도 404가 뜬다면, 최후의 수단으로 안내
    if (error.message.includes("404") || error.message.includes("not found")) {
        throw new Error("모델 오류: 'gemini-1.5-flash'를 찾을 수 없습니다. API 키를 다시 확인해주세요.");
    }
    throw new Error(error.message);
  }
};
