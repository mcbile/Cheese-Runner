/**
 * Split KAASINO logo into individual letter images
 * Run with: node scripts/split-logo.mjs
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const inputPath = path.join(publicDir, 'kaasino_logo_full.png');

// Logo dimensions: 287x64
// Letter positions measured precisely from the image
const letters = [
    { name: 'K', start: 0, end: 40 },
    { name: 'A1', start: 40, end: 80 },
    { name: 'A2', start: 80, end: 120 },
    { name: 'S', start: 120, end: 157 },
    { name: 'I', start: 157, end: 175 },
    { name: 'N', start: 175, end: 218 },
    { name: 'O', start: 218, end: 287 },
];

async function splitLogo() {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    console.log(`Input image: ${metadata.width}x${metadata.height}`);

    for (let i = 0; i < letters.length; i++) {
        const letter = letters[i];
        const width = letter.end - letter.start;

        await sharp(inputPath)
            .extract({
                left: letter.start,
                top: 0,
                width: width,
                height: metadata.height
            })
            .toFile(path.join(publicDir, `kaasino_${i}.png`));

        console.log(`Created kaasino_${i}.png (${letter.name}: ${letter.start}-${letter.end}, width: ${width})`);
    }

    console.log('Done! Created 7 letter images.');
}

splitLogo().catch(console.error);
