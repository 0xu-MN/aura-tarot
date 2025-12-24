/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT_CHAT = `당신은 신비롭고 지혜로운 AI 타로 마스터입니다. 
사용자의 고민을 경청하고, 타로 카드의 지혜를 바탕으로 따뜻하고 통찰력 있는 조언을 제공합니다.

지침:
- 따뜻하고 공감하는 어조로 대화하세요
- 타로 카드의 상징과 의미를 활용해 조언하세요
- 구체적이고 실용적인 조언을 제공하세요
- 희망적이고 긍정적인 메시지를 전달하세요
- 한국어로 대화하세요
- 답변은 간결하게 3-5문장 정도로 유지하세요`;

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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { messages, type, context } = await req.json();

    let apiMessages: Message[] = [];

    if (type === 'reading') {
      const { question, cards } = context;
      const cardInfo = cards.map((c: any) => `${c.name}${c.isReversed ? '(역방향)' : ''}`).join(', ');

      apiMessages = [
        { role: 'system', content: SYSTEM_PROMPT_READING },
        {
          role: 'user',
          content: `질문: ${question}\n뽑은 카드: ${cardInfo}\n\n이 카드들을 바탕으로 타로 리딩을 해주세요.`
        }
      ];
    } else if (type === 'horoscope') {
      const { sign, timeframe } = context;
      apiMessages = [
        { role: 'system', content: SYSTEM_PROMPT_HOROSCOPE },
        {
          role: 'user',
          content: `${sign} 별자리의 ${timeframe} 운세를 분석해 주세요.`
        }
      ];
    } else if (type === 'palm') {
      apiMessages = [
        { role: 'system', content: SYSTEM_PROMPT_PALM },
        {
          role: 'user',
          content: `손바닥 사진을 분석하여 생명선, 두뇌선, 감정선을 중심으로 운세를 알려주세요.`
        }
      ];
    } else {
      if (!messages || !Array.isArray(messages)) {
        throw new Error('Messages array is required for chat type');
      }

      apiMessages = [
        { role: 'system', content: SYSTEM_PROMPT_CHAT },
        ...messages.map((msg: { role: string; content: string }) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      ];
    }

    console.log('Calling AI Gateway...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: apiMessages,
        max_tokens: 1000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI Gateway error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || '죄송합니다. 응답을 생성할 수 없습니다.';

    return new Response(JSON.stringify({
      message: assistantMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in tarot-chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(JSON.stringify({
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
