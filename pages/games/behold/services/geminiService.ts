import type { GameStage } from '../types';

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
  // Server-side: try to use @google/genai if available and an API key is configured
  if (typeof window === 'undefined' && process.env.API_KEY) {
    try {
      const pkgName = '@google/genai';
      // Use a non-literal import target to avoid rollup trying to statically resolve the module
      const { GoogleGenAI } = await import(pkgName as any);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const text = response.text;
      if (text) {
        return {
          headline: text.replace(/["*]/g, ''),
          error: null
        };
      }
      return {
        headline: getFallbackHeadline(stage),
        error: "AI가 비어있는 응답을 반환했습니다."
      };
    } catch (error) {
      console.error("Server-side AI error:", error);
      return {
        headline: getFallbackHeadline(stage),
        error: "Server-side AI error"
      };
    }
  }

  // Client-side or no API key: return the fallback headline and a helpful error
  return {
    headline: getFallbackHeadline(stage),
    error: "AI는 현재 클라이언트 빌드에서 사용할 수 없습니다."
  };
};