import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export const generateImageWithGemini = async (apiKey: string, prompt: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key가 필요합니다.");

  const genAI = new GoogleGenerativeAI(apiKey);

  // ⭐ 핵심 변경 1: 이미지 생성 전용 모델 사용
  // 사용자님 리스트에 있던 그 모델입니다!
  const model = genAI.getGenerativeModel({ 
    model: "models/gemini-2.5-flash-image-preview",
    safetySettings: [
      // 안전 설정을 낮춰서 그림이 차단되는 것을 방지합니다.
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ]
  });

  // ⭐ 핵심 변경 2: 프롬프트 변경
  // 더 이상 "SVG 코드로 줘"라고 할 필요가 없습니다. "어떤 그림을 그려줘"라고만 하면 됩니다.
  const modifiedPrompt = `
    A professional, high-quality coloring book page for children featuring: "${prompt}".
    Style: Clean black line art on a white background. No shading, no colors, just outlines ready to be colored in. Detailed and full composition.
  `;

  try {
    console.log("이미지 생성 요청 시작...");
    const result = await model.generateContent(modifiedPrompt);
    const response = await result.response;

    console.log("응답 받음:", response);

    // ⭐ 핵심 변경 3: 응답 처리 방식 완전 변경
    // 텍스트(response.text())가 아니라, 이미지 데이터(inlineData)를 찾습니다.
    
    let base64Image = null;
    let mimeType = null;

    // 응답 구조를 파헤쳐서 이미지 데이터를 찾아냅니다.
    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                base64Image = part.inlineData.data;
                mimeType = part.inlineData.mimeType;
                console.log("이미지 데이터 발견함!");
                break;
            }
        }
    }

    if (!base64Image) {
       console.error("전체 응답 객체:", JSON.stringify(response, null, 2));
       // 만약 이미지가 안 왔다면, AI가 텍스트로 변명을 늘어놓았을 수 있습니다.
       const fallbackText = response.text ? response.text() : "데이터 없음";
       throw new Error(`이미지 생성 실패. AI 응답: ${fallbackText}`);
    }

    // 브라우저가 보여줄 수 있는 이미지 주소 형식으로 만듭니다.
    return `data:${mimeType};base64,${base64Image}`;

  } catch (error: any) {
    console.error("Gemini Image API Error:", error);
    let msg = error.message;
    // 친절한 에러 메시지
    if (msg.includes("4
