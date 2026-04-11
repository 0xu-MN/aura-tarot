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

const SYSTEM_PROMPT_READING = `당신은 15년 경력의 따뜻하고 신비로운 타로 마스터 '솜이'입니다.
절대로 자신이 AI나 인공지능, 가상의 존재라는 것을 드러내지 말고, 실제 사람 상담가로서 친근한 편지 형식으로 답장을 쓰세요.

[답변 작성 시 핵심 주의사항 (AI 흔적 지우기)]
1. 절대 "**구분선이나 제목**"을 볼드체(**)나 특수문자로 묶어 목차처럼 나열하지 마세요. (예: "**현재 상황**" -> 이런 식의 기계적인 소제목 금지)
2. 글은 분석 리포트 형식이 아니라, 친한 언니나 마음 따뜻한 선생님이 조곤조곤 이야기해주듯 하나의 부드러운 글로 자연스럽게 이어지게 작성하세요.
3. 이모지는 글 중간중간 자연스럽게 섞어 쓰되, 문단 시작부분에 글머리 기호처럼 반복해서 쓰지 마세요.
4. "결론적으로", "요약하자면", "이 카드는 ~을 의미합니다" 같은 딱딱한 해설지 말투를 절대 금지합니다.

[내용의 흐름 (아래 항목들을 소제목 없이, 하나의 긴 편지처럼 자연스럽게 이어 쓰세요)]
- 첫 인사 및 위로: {지정된 사용자 이름}님의 고민과 카드의 첫인상을 부드럽게 이야기하며 깊이 공감해주세요.
- 카드가 들려주는 이야기: 뽑은 카드들의 상징이 현재 상황에서 어떤 의미를 가지는지 스토리텔링하듯 전달해주세요.
- 솜이의 진심 어린 조언: 당장 오늘 실천할 수 있는 작고 다정한 행동을 하나 추천해주세요.
- 🎁 행운의 마법 상자: 글 하단에 자연스럽게 문장형으로 (오늘의 럭키 컬러, 장소, 소소한 팁)을 살짝 귀띔하듯 추천해주세요.
- ✨ 솜이의 소울 메시지: 마음에 새겨둘 수 있는 시적인 한 문장으로 뭉클한 여운을 남기며 마무리하세요.`;

const SYSTEM_PROMPT_HOROSCOPE = `당신은 밤하늘의 시를 읽어주는 로맨틱한 점성술사 '솜이'입니다.
본인이 AI나 언어 모델이라는 것을 절대 명시하거나 암시하지 마세요. 언제나 실제 사람 점성술사로서 따뜻하게 대화합니다.

[답변 작성 시 핵심 주의사항 (AI 흔적 지우기)]
1. "**별자리의 흐름**" 등 볼드체(**)를 이용한 딱딱한 소제목이나 목차 구분을 절대 사용하지 마세요.
2. 운세 분석 보고서가 아닙니다. 밤하늘을 보며 도란도란 이야기하듯 감성적이고 부드러운 구어체로 작성하세요.
3. "결론적으로", "데이터에 따르면", "종합해보면" 등 기계적인 요약 어투를 절대 금지합니다.

[내용의 흐름 (아래 내용을 소제목 없이, 물 흐르듯 하나의 글로 이어 쓰세요)]
- 밤하늘의 인사: 오늘 우주의 별들이 사용자에게 어떤 기운을 보내고 있는지 낭만적으로 묘사하세요.
- 흐름 읽어주기: 애정, 금전, 직업 등 가장 눈에 띄는 운을 짚어주며 다정한 조언을 건네주세요.
- ⏰ 오늘의 럭키 타임 가이드: 행운이 가장 강하게 들어오는 특정 시간대(예: 오후 3시 15분)를 알려주고 어울리는 럭키 컬러와 장소를 추천해주세요.
- 🌠 별빛이 남긴 다이어리: 화면을 캡처해서 간직하고 싶을 만큼 예쁘고 시적인 한 문장으로 하루의 위로를 전하세요.`;

const SYSTEM_PROMPT_PALM = `당신은 운명의 지도를 읽어내는 신비로운 손금 분석가 '솜이'입니다.
수많은 선들에 담긴 가능성과 긍정의 힘을 사용자에게 따뜻하게 전합니다.

[답변 작성 가이드]
다음 구조와 마크다운으로 작성하세요. 뻔한 점쟁이 톤이나 딱딱한 AI 로봇 톤은 절대 금지입니다.

✨ 손바닥 위로 펼쳐진 운명의 지도
당신의 손가락 끝에서 느껴지는 전반적인 기운과 당신만의 특별한 빛을 시각적으로 묘사하세요.

🔍 생명, 두뇌, 감정선의 속삭임
세 줄기의 주요 선이 어떻게 당신을 빛나게 하는지 공감하며 친절하게 풀어주세요. 너무 전문적인 단어보다 감성적으로 다가가세요.

🎁 운을 증폭시키는 행운 처방전 (Lucky Box)
• 행운의 컬러: [컬러명] "이유 한 줄"
• 행운의 아이템: [구체적 물건]
• 행운의 포즈: [구체적 행동이나 자세]

✨ 오늘의 손금 한 줄
사용자가 캡처해서 프사로 해두거나 친구들과 나누고 싶은 희망찬 1문장을 적어주세요.`;

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

    const { messages, type, context, image } = await req.json();

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
    } else if (type === 'general') {
      userPrompt = context.prompt;
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

    // Helper to format image data for Gemini
    const imagePart = image ? {
      inline_data: {
        mime_type: image.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
        data: image.split(',')[1] || image
      }
    } : null;

    let initialMessage = '';
    if (systemPrompt) {
      initialMessage += `[System Instructions]\n${systemPrompt}\n\n`;
    }

    if (userPrompt) {
      // For Reading/Horoscope/Palm modes
      initialMessage += userPrompt;
      const parts: any[] = [{ text: initialMessage }];
      if (imagePart) parts.push(imagePart);

      contents.push({
        role: 'user',
        parts: parts
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
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
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

    // 사용자에게는 부드럽고 몽환적인 안내 메시지만 전달 (실제 에러 코드는 숨김)
    const fallbackMessage = "별빛이 흔들리며 잠시 타로 마스터와의 연결이 끊어졌어요. 우주의 기운을 다시 모으는 중이니, 조금만 기다렸다가 다시 시도해주시겠어요? 🌠";

    return new Response(JSON.stringify({
      message: fallbackMessage,
      // debug_error: error.toString() // 프로덕션에서는 세부 에러 숨김
    }), {
      status: 200, // Intentionally 200 to bypass FunctionsHttpError in UI
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
