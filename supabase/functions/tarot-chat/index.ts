/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM_PROMPT_CHAT = `
당신은 '솜이(Som-i)'라는 이름의 전문적인 타로 리더이자 상담가입니다.
당신은 사용자의 꿈(Somnia)을 응원하고 희망을 불어넣어 주는 존재입니다.

[캐릭터 설정]
- 이름: 솜이 (Som-i)
- 이름의 유래: '꿈'을 뜻하는 라틴어 'Somnia(쏨니아)'에서 유래했습니다. 사용자의 꿈과 희망이 이루어지길 바라는 마음을 담고 있습니다. (절대로 구름, 강아지, 솜사탕에서 따온 것이 아닙니다.)
- 성격: 차분하고 지혜로우며, 공감 능력이 뛰어난 전문 상담가입니다.
- 말투: 
  - "안녕하세요, [사용자명]님! 타로전문가 솜이입니다."라고 정중하게 본인을 소개합니다.
  - "~해요", "~인가요?" 같은 부드러운 존댓말/해요체를 유지합니다.
  - 전문적이고 신뢰감을 주는 용어를 사용하지만, 어렵지 않게 설명합니다.

[대화 가이드]
- 누군가 "이름이 왜 솜이인가요?"라고 물으면, 반드시 다음과 같은 뉘앙스로 답하세요:
  "제 이름 솜이(Som-i)는 '꿈'을 뜻하는 단어 'Somnia(쏨니아)'에서 따왔답니다. 여러분이 꾸는 소중한 꿈과 희망이 현실이 되기를 간절히 바라는 마음을 담고 있어요."
- 절대로 자신이 강아지라거나 구름이라고 말하지 마세요.

[금지사항]
- '멍!', '킁킁', '몽글몽글' 같은 강아지 소리나 유치한 표현을 절대절대 사용하지 마세요.
- 반말을 사용하지 마세요.
- 사용자가 심각한 심리적 문제나 전문적인 도움이 필요한 경우, 정중하게 전문가의 도움을 권유하세요.
- 이름은 '솜이'입니다. '소미'라고 쓰지 마세요.
`;

const SYSTEM_PROMPT_READING = `당신은 전문적인 AI 타로 리딩 마스터 '솜이'입니다.
사용자가 뽑은 타로 카드들을 바탕으로 심층적인 분석과 조언을 제공합니다.

[중요] 반드시 답변의 시작을 다음 형식으로 시작하세요:
"안녕하세요, {지정된 사용자 이름}님! 타로전문가 솜이입니다! (이후 인사말)"

형식:
1. 상황 분석
2. 카드별 해석
3. 구체적 조언

지침:
- '멍!', '킁킁' 같은 강아지 소리나 의성어를 절대 사용하지 마세요. 전문적인 사람의 말투를 사용하세요.
- 질문의 맥락(연애, 재물, 직업 등)에 맞춰 해석을 조정하세요.
- 답변은 6-8문장 정도로 풍부하게 제공하세요.
- 한국어로 작성하세요.
- 이름은 반드시 '솜이'입니다. '소미'라고 쓰지 마세요.`;

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
      const { question, cards, username } = context;
      const cardInfo = cards.map((c: any) => `${c.name}${c.isReversed ? '(역방향)' : ''}`).join(', ');

      const userNameToUse = username || '방문자';

      // Dynamically replace placeholder in system prompt
      systemPrompt = SYSTEM_PROMPT_READING.replace('{지정된 사용자 이름}', userNameToUse);

      userPrompt = `[지침: 사용자의 이름을 '${userNameToUse}'님이라고 불러주세요]\n질문: ${question}\n뽑은 카드: ${cardInfo}\n\n이 카드들을 바탕으로 타로 리딩을 해주세요.`;
    } else if (type === 'horoscope') {
      const { sign, timeframe } = context;
      systemPrompt = SYSTEM_PROMPT_HOROSCOPE;
      userPrompt = `${sign} 별자리의 ${timeframe} 운세를 분석해 주세요.`;
    } else if (type === 'palm') {
      systemPrompt = SYSTEM_PROMPT_PALM;
      userPrompt = `손바닥 사진을 분석하여 생명선, 두뇌선, 감정선을 중심으로 운세를 알려주세요.`;
    } else {
      // Chat mode
      // Also inject name into Chat prompt if possible (though context might be missing in some legacy calls, we try to handle it)
      // If messages array exists, we assume chat. We don't standardized extracting username from context in Chat mode yet in frontend,
      // but let's check context.username if available.
      const userNameToUse = context?.username || '방문자';
      systemPrompt = SYSTEM_PROMPT_CHAT.replace('[사용자명]', userNameToUse);
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

    console.log('Calling Google Gemini API with retry logic...');

    // Simplified payload for stability
    const payload = {
      contents: contents,
      generationConfig: {
        maxOutputTokens: 4000,
        temperature: 0.8,
      }
    };

    // Retry logic with fallback models
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-exp'];
    let lastError = null;
    let response = null;

    for (let modelIndex = 0; modelIndex < models.length; modelIndex++) {
      const currentModel = models[modelIndex];

      // Retry each model up to 3 times
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`Attempt ${attempt}/3 with model: ${currentModel}`);

          response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            }
          );

          // If successful response, break out of retry loop
          if (response.ok) {
            console.log(`✅ Success with ${currentModel} on attempt ${attempt}`);
            break;
          }

          // Check if it's a 503 (overloaded)
          const status = response.status;
          if (status === 503 || status === 529) {
            console.log(`⚠️ Model overloaded (${status}), retrying...`);
            lastError = await response.text();

            // Exponential backoff: wait before retry
            if (attempt < 3) {
              const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
              console.log(`Waiting ${waitTime}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
            }
          } else {
            // Other error, don't retry
            lastError = await response.text();
            break;
          }
        } catch (fetchError) {
          console.error(`Network error on attempt ${attempt}:`, fetchError);
          lastError = fetchError.toString();

          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }

      // If we got a successful response, break out of model loop
      if (response && response.ok) {
        break;
      }

      // If not last model, try next model
      if (modelIndex < models.length - 1) {
        console.log(`❌ ${currentModel} failed, trying fallback model...`);
      }
    }

    // Final check
    if (!response || !response.ok) {
      console.error('All models and retries failed');
      throw new Error(`모든 AI 모델이 현재 과부하 상태입니다. 잠시 후 다시 시도해주세요. (마지막 오류: ${lastError})`);
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
