import { GoogleGenAI } from "@google/genai";
import type { GameStage } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface HeadlineResult {
  headline: string;
  error: string | null;
}

const getFallbackHeadline = (stage: GameStage): string => {
    switch (stage) {
        case 'START':
            return "밤이 되자 귀뚜라미가 울기 시작했습니다.";
        case 'AWAIT_CRICKET':
            return "한 남성이 작은 소음에도 분노를 터뜨립니다.";
        case 'AWAIT_HAT_HATE':
            return "패션이 분열의 씨앗이 되었습니다.";
        case 'AWAIT_VIOLENCE':
            return "폭력의 서막이 올랐습니다.";
        case 'AWAIT_SQUARE_ANGER':
            return "네모난 이들의 분노가 폭발하다.";
        case 'AWAIT_MASS_VIOLENCE':
            return "그리고 모든 것이 불타올랐습니다.";
        default:
            return "방금 뭔가 이상한 일이 일어났습니다...";
    }
}

export const generateHeadline = async (prompt: string, stage: GameStage): Promise<HeadlineResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    const text = response.text;
    if (text) {
      return {
        headline: text.replace(/["*]/g, ''), // Clean up markdown and quotes
        error: null
      };
    }
    return {
        headline: getFallbackHeadline(stage),
        error: "AI가 비어있는 응답을 반환했습니다."
    };
  } catch (error) {
    console.error("Error generating headline:", error);
    const errorString = JSON.stringify(error);
    let msg = "미디어 정전: 알 수 없는 AI 오류가 발생했습니다.";
    if (errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
        msg = "AI 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.";
    }
    return {
        headline: getFallbackHeadline(stage),
        error: msg
    };
  }
};