/**
 * Create composite KAASINO logo from individual letter sprites
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

// KAASINO letter order
const letters = ['K', 'A', 'A', 'S', 'I', 'N', 'O'];

async function createLogo() {
    console.log('Creating composite KAASINO logo...\n');

    // Load all letter images and get their dimensions
    const letterImages = [];
    let totalWidth = 0;
    let maxHeight = 0;

    for (const letter of letters) {
        const imagePath = path.join(publicDir, `${letter}.png`);
        const metadata = await sharp(imagePath).metadata();

        letterImages.push({
            letter,
            path: imagePath,
            width: metadata.width,
            height: metadata.height
        });

        totalWidth += metadata.width;
        maxHeight = Math.max(maxHeight, metadata.height);

        console.log(`  ${letter}: ${metadata.width}x${metadata.height}`);
    }

    console.log(`\nTotal size: ${totalWidth}x${maxHeight}`);

    // Create composite image
    const composites = [];
    let xOffset = 0;

    for (const img of letterImages) {
        // Center vertically
        const yOffset = Math.floor((maxHeight - img.height) / 2);

        composites.push({
            input: img.path,
            left: xOffset,
            top: yOffset
        });

        xOffset += img.width;
    }

    // Create the final image
    const outputPath = path.join(publicDir, 'kaasino_logo.png');

    await sharp({
        create: {
            width: totalWidth,
            height: maxHeight,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
    })
    .composite(composites)
    .png()
    .toFile(outputPath);

    console.log(`\n✓ Logo saved to: ${outputPath}`);
}

createLogo().catch(console.error);
