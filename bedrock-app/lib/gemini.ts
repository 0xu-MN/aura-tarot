// Gemini AI API helper for bedrock-app (Proxying through Supabase Edge Function)
import { supabase } from './supabase';

export async function callGemini(prompt: string, imageData?: string): Promise<string> {
    try {
        const body: any = {
            type: imageData ? 'palm' : 'general',
            context: {
                prompt: prompt
            }
        };
        if (imageData) {
            body.image = imageData;
        }
        const { data, error } = await supabase.functions.invoke('tarot-chat', {
            body
        });

        if (error) throw error;

        const text = data.message || '';
        return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    } catch (error) {
        console.error('Gemini API call via Edge Function failed:', error);
        throw error;
    }
}

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export async function callGeminiChat(history: ChatMessage[], message: string): Promise<string> {
    try {
        const { data, error } = await supabase.functions.invoke('tarot-chat', {
            body: {
                messages: history.map(h => ({
                    role: h.role === 'model' ? 'assistant' : 'user',
                    content: h.parts?.[0]?.text || ''
                })).concat([{ role: 'user', content: message }])
            }
        });

        if (error) throw error;

        const text = data.message || '';
        return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    } catch (error) {
        console.error('Gemini Chat API call via Edge Function failed:', error);
        throw error;
    }
}
