// Gemini AI API helper for bedrock-app
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function callGemini(prompt: string): Promise<string> {
    try {
        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.9,
                    maxOutputTokens: 1024,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        // Remove <think> blocks if present
        return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    } catch (error) {
        console.error('Gemini API call failed:', error);
        throw error;
    }
}
