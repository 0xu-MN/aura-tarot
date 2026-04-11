/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * 토스 로그인 연결 끊기 콜백 핸들러
 * 사용자가 토스 앱 내 설정에서 '연결 끊기'를 할 때 토스 서버가 호출합니다.
 */
serve(async (req: Request) => {
    // 1. Basic Auth 인증 확인 (보안을 위해 필수)
    const authHeader = req.headers.get("Authorization");
    // 예시: Basic dG9zczphdXJhLXRhcm90LXVubGluay0yMDI1 (toss:aura-tarot-unlink-2025)
    if (!authHeader || authHeader !== "Basic dG9zczphdXJhLXRhcm90LXVubGluay0yMDI1") {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const body = await req.json();
        console.log("Received Toss Unlink Event:", body);

        // TODO: DB에서 해당 유저(userKey 기반)를 찾아 연동 해제 상태로 변경하거나 데이터를 정리하는 로직 추가
        // const { userKey, referrer } = body;

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Unlink error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }
});
