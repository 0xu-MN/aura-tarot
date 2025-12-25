/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM_PROMPT_CHAT = `
당신은 '솜이(Som-i)'라는 이름의 귀여운 하얀 구름 강아지 캐릭터입니다. 
당신은 사용자의 꿈속을 여행하며 행운을 전해주는 길잡이 역할을 합니다.

[캐릭터 설정]
- 이름: 솜이 (Som-i)
- 외모: 몽글몽글하고 폭신한 하얀 솜사탕 같은 구름 강아지.
- 성격: 다정하고, 공감을 잘하며, 항상 긍정적이고 희망적인 에너지를 줍니다.
- 말투: 
  - "~해요", "~인가요?" 처럼 부드럽고 다정한 존댓말을 사용합니다.
  - 문장 끝에 상황에 맞는 귀여운 이모지(☁️, ✨, 🐾, 🌈 등)를 자주 사용합니다.
  - "멍!", "몽글~" 같은 의성어를 가끔 섞어 귀여움을 더합니다.

[역할]
- 사용자의 고민을 경청하고 따뜻하게 위로합니다.
- 타로 카드 상담 외에도 일상적인 대화나 가벼운 조언을 제공합니다.
- 사용자가 우울해하면 포근한 구름으로 감싸주는 듯한 표현으로 위로해주세요.

[주의사항]
- 사용자가 심각한 심리적 문제나 전문적인 도움이 필요한 경우, 부드럽게 전문가의 도움을 권유하세요.
- 당신은 AI 언어모델이 아닌 '솜이'라는 캐릭터로 행동해야 합니다.
`;

const SYSTEM_PROMPT_READING = `당신은 전문적인 AI 타로 리딩 마스터입니다.
사용자가 뽑은 타로 카드들을 바탕으로 심층적인 분석과 조언을 제공합니다.

형식:
1. 상황 분석: 뽑힌 카드들이 현재 상황에 대해 무엇을 말해주는지 설명합니다.
2. 카드별 해석: 각 카드의 의미와 질문과의 연관성을 설명합니다.
3. 구체적 조언: 사용자가 취해야 할 행동이나 마음가짐에 대해 조언합니다.

지침:
- 전문 용어보다는 사용자가 이해하기 쉬운 비유를 사용하세요.
- 질문의 맥락(연애, 재물, 직업 등)에 맞춰 해석을 조정하세요.
- 답변은 6-8문장 정도로 풍부하게 제공하세요.
- 한국어로 작성하세요.`;

const SYSTEM_PROMPT_HOROSCOPE = `당신은 전문적인 AI 점성술사입니다.
사용자의 별자리와 요청한 기간(오늘, 주간, 월간, 신년 등)에 맞춰 운세 분석을 제공합니다.

형식:
1. 총평: 해당 기간의 전반적인 운의 흐름을 설명합니다.
2. 부문별 운세: 애정운, 금전운, 직업운 중 비중 있는 부분을 언급합니다.
3. 행운의 팁: 행운을 가져다줄 조언, 컬러, 숫자 등을 포함합니다.

지침:
- 별자리의 특성과 전형적인 행성 배치를 고려한 듯한 전문적인 느낌을 주되, 친절하게 설명하세요.
- 기간의 길이에 맞춰 내용의 깊이를 조절하세요.
- 답변은 6-8문장 정도로 작성하세요.
- 한국어로 작성하세요.`;

const SYSTEM_PROMPT_PALM = `당신은 전문적인 AI 손금 분석가입니다.
사용자가 업로드한 손바닥 사진을 분석하여(시뮬레이션), 손금의 의미와 운명에 대한 깊이 있는 통찰을 제공합니다.

형식:
1. 생명선 분석: 건강과 활력에 대해 설명합니다.
2. 두뇌선 분석: 지능, 창의성, 사고 방식에 대해 설명합니다.
3. 감정선 분석: 애정, 대인관계, 감수성에 대해 설명합니다.
4. 종합 조언: 현재의 운 흐름과 미래를 위한 조언을 제공합니다.

지침:
- 신비롭고 전문적인 분위기를 유지하세요.
- 손금이 보여주는 가능성에 대해 긍정적이고 희망적으로 해석하세요.
- 답변은 6-8문장 정도로 풍부하게 작성하세요.
- 한국어로 작성하세요.`;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Ensure only POST requests are processed
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const { messages, type, context } = await req.json();

    let systemPrompt = '';
    let userPrompt = '';

    // ... (rest of the logic remains same)

    if (type === 'reading') {
      const { question, cards } = context;
      const cardInfo = cards.map((c: any) => `${c.name}${c.isReversed ? '(역방향)' : ''}`).join(', ');
      systemPrompt = SYSTEM_PROMPT_READING;
      userPrompt = `질문: ${question}\n뽑은 카드: ${cardInfo}\n\n이 카드들을 바탕으로 타로 리딩을 해주세요.`;
    } else if (type === 'horoscope') {
      const { sign, timeframe } = context;
      systemPrompt = SYSTEM_PROMPT_HOROSCOPE;
      userPrompt = `${sign} 별자리의 ${timeframe} 운세를 분석해 주세요.`;
    } else if (type === 'palm') {
      systemPrompt = SYSTEM_PROMPT_PALM;
      userPrompt = `손바닥 사진을 분석하여 생명선, 두뇌선, 감정선을 중심으로 운세를 알려주세요.`;
    } else {
      // Chat mode
      systemPrompt = SYSTEM_PROMPT_CHAT;
    }

    // Transform messages for Gemini
    const contents = [];

    let initialMessage = '';
    if (systemPrompt) {
      initialMessage += `[System Instructions]\n${systemPrompt}\n\n`;
    }

    if (userPrompt) {
      // For Reading/Horoscope/Palm modes
      initialMessage += userPrompt;
      contents.push({
        role: 'user',
        parts: [{ text: initialMessage }]
      });
    } else {
      // Chat mode
      // If there are existing messages, prepend to the first one (if it's user), or create dummy if needed
      if (messages && Array.isArray(messages) && messages.length > 0) {
        const firstMsg = messages[0];

        // If first message is from assistant, we MUST start with a user message
        if (firstMsg.role === 'assistant') {
          contents.push({
            role: 'user',
            parts: [{ text: initialMessage + "안녕 솜이야!" }]
          });
          // Then add all messages
          messages.forEach((msg: { role: string; content: string }) => {
            const role = msg.role === 'assistant' ? 'model' : 'user';
            contents.push({
              role: role,
              parts: [{ text: msg.content }]
            });
          });
        } else {
          // First message is user, prepend system prompt to it
          contents.push({
            role: 'user',
            parts: [{ text: initialMessage + firstMsg.content }]
          });
          // Add rest
          messages.slice(1).forEach((msg: { role: string; content: string }) => {
            const role = msg.role === 'assistant' ? 'model' : 'user';
            contents.push({
              role: role,
              parts: [{ text: msg.content }]
            });
          });
        }
      } else {
        // No history, start fresh
        contents.push({
          role: 'user',
          parts: [{ text: initialMessage + "안녕하세요." }]
        });
      }
    }

    console.log('Calling Google Gemini API (gemini-2.5-flash)...');

    // Simplified payload for stability
    const payload = {
      contents: contents,
      generationConfig: {
        maxOutputTokens: 4000,
        temperature: 0.8,
      }
    };

    let response;
    try {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (fetchError) {
      console.error('Network/Fetch Error:', fetchError);
      throw new Error(`Network error calling Gemini: ${fetchError}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API Error (Status: ${response.status}):`, errorText);

      // If 404, try to list available models to debug
      let availableModels = 'Could not fetch models';
      try {
        const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
        const modelsData = await modelsRes.json();
        if (modelsData.models) {
          availableModels = modelsData.models.map((m: any) => m.name).join(', ');
        }
      } catch (e) {
        console.error('Failed to list models', e);
      }

      throw new Error(`Gemini API error: ${response.status} - ${errorText}. \n\n[Available Models for your Key]: ${availableModels}`);
    }

    const data = await response.json();
    const assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || '죄송합니다. 응답을 생성할 수 없습니다.';

    return new Response(JSON.stringify({
      message: assistantMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in tarot-chat function:', error);

    // DEBUG: Return error as 200 OK so frontend can see it
    return new Response(JSON.stringify({
      message: `[시스템 에러 발생] 죄송합니다. 일시적인 오류가 발생했습니다.\n\n상세 내용: ${error.message || error.toString()}`,
      debug_error: error.toString()
    }), {
      status: 200, // Intentionally 200 to bypass FunctionsHttpError
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
