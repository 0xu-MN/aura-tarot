/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    try {
        const { authorizationCode, referrer } = await req.json();

        if (!authorizationCode) {
            throw new Error('authorizationCode is required');
        }

        const MTLS_CERT = Deno.env.get('TOSS_MTLS_CERT');
        const MTLS_KEY = Deno.env.get('TOSS_MTLS_KEY');

        if (!MTLS_CERT || !MTLS_KEY) {
            throw new Error('mTLS credentials not configured');
        }

        // 토스 OAuth2 토큰 발급 엔드포인트
        // referrer에 따라 sandbox/production 분기
        const tokenUrl = referrer === 'SANDBOX'
            ? 'https://oauth2.cert.sandbox.toss.im/token'
            : 'https://oauth2.cert.toss.im/token';

        // mTLS 클라이언트 인증서를 사용하여 토큰 요청
        // Deno의 Deno.createHttpClient를 사용하여 mTLS 핸드셰이크
        const httpClient = Deno.createHttpClient({
            certChain: MTLS_CERT,
            privateKey: MTLS_KEY,
        });

        const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: authorizationCode,
            }).toString(),
            client: httpClient,
        } as any);

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('Token request failed:', tokenResponse.status, errorText);
            throw new Error(`토스 토큰 발급 실패 (${tokenResponse.status})`);
        }

        const tokenData = await tokenResponse.json();
        const { accessToken, refreshToken, scope } = tokenData;

        if (!accessToken) {
            throw new Error('accessToken not received');
        }

        // accessToken으로 유저 정보 조회
        const userInfoUrl = referrer === 'SANDBOX'
            ? 'https://api-partner.cert.sandbox.toss.im/api-partner/v1/apps-in-toss/user/me'
            : 'https://api-partner.cert.toss.im/api-partner/v1/apps-in-toss/user/me';

        const userInfoResponse = await fetch(userInfoUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            client: httpClient,
        } as any);

        let userInfo = null;
        if (userInfoResponse.ok) {
            userInfo = await userInfoResponse.json();
        } else {
            console.warn('User info request failed:', userInfoResponse.status);
            // 유저 정보 조회 실패해도 로그인 자체는 성공으로 처리
        }

        // 클라이언트에 필요한 정보만 반환
        return new Response(JSON.stringify({
            success: true,
            accessToken,
            refreshToken,
            scope,
            user: userInfo,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Error in toss-auth function:', error);

        return new Response(JSON.stringify({
            success: false,
            error: '토스 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.',
        }), {
            status: 200, // 200으로 반환하여 FunctionsHttpError 방지
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
