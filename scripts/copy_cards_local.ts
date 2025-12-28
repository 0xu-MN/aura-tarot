
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = '/Users/admin/.gemini/antigravity/brain/0a77fd89-1f90-4213-831e-b79c4482d2ce';
const TARGET_DIR = path.resolve('public/tarot-cards');

if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

async function copyCards() {
    const files = fs.readdirSync(ARTIFACTS_DIR);

    // Map of card number to latest file path
    const cardFiles = new Map<number, string>();

    files.forEach(file => {
        const match = file.match(/^major_(\d{2})_.*_(\d+)\.png$/);
        if (match) {
            const num = parseInt(match[1], 10);
            const timestamp = parseInt(match[2], 10);

            const existing = cardFiles.get(num);
            if (!existing || parseInt(existing.match(/_(\d+)\.png$/)![1]) < timestamp) {
                cardFiles.set(num, file);
            }
        }
    });

    console.log(`Found ${cardFiles.size} unique cards to copy.`);

    for (const [num, filename] of cardFiles) {
        if (num > 17) continue;

        const sourcePath = path.join(ARTIFACTS_DIR, filename);
        const targetName = `major_${num.toString().padStart(2, '0')}.png`;
        const targetPath = path.join(TARGET_DIR, targetName);

        console.log(`Copying ${filename} to ${targetName}...`);
        fs.copyFileSync(sourcePath, targetPath);
    }
    console.log('Copy complete.');
}

copyCards().catch(console.error);
