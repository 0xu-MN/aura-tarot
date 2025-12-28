
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env vars manually since we are running with bun
const envFile = fs.readFileSync('.env', 'utf8');
const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        let value = match[2].trim();
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
        }
        env[match[1]] = value;
    }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_PUBLISHABLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ARTIFACTS_DIR = '/Users/admin/.gemini/antigravity/brain/0a77fd89-1f90-4213-831e-b79c4482d2ce';
const TARGET_BUCKET = 'tarot-cards';

async function uploadCards() {
    const files = fs.readdirSync(ARTIFACTS_DIR);

    // Map of card number to latest file path
    const cardFiles = new Map<number, string>();

    files.forEach(file => {
        const match = file.match(/^major_(\d{2})_.*_(\d+)\.png$/);
        if (match) {
            const num = parseInt(match[1], 10);
            const timestamp = parseInt(match[2], 10);

            // Assuming higher timestamp is newer (lexicographically sorting filename might not work for timestamp if lengths differ, but regex captured it)
            // Actually, we can just sort files by name if timestamp is at end, or use stats.
            // Let's rely on the timestamp in filename.

            const existing = cardFiles.get(num);
            if (!existing || parseInt(existing.match(/_(\d+)\.png$/)![1]) < timestamp) {
                cardFiles.set(num, file);
            }
        }
    });

    console.log(`Found ${cardFiles.size} unique cards to upload.`);

    for (const [num, filename] of cardFiles) {
        if (num > 17) continue; // Only process up to 17 per current task

        const filePath = path.join(ARTIFACTS_DIR, filename);
        const fileBuffer = fs.readFileSync(filePath);
        const targetName = `major_${num.toString().padStart(2, '0')}.png`;

        console.log(`Uploading ${filename} as ${targetName}...`);

        const { data, error } = await supabase
            .storage
            .from(TARGET_BUCKET)
            .upload(targetName, fileBuffer, {
                contentType: 'image/png',
                upsert: true
            });

        if (error) {
            console.error(`Error uploading ${targetName}:`, error.message);
        } else {
            console.log(`Success: ${data.path}`);
        }
    }
}

uploadCards().catch(console.error);
