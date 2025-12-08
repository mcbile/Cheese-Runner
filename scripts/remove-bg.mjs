/**
 * Remove checkered background from letter sprites
 * Makes gray checkered pattern transparent
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

const letters = ['K', 'A', 'S', 'I', 'N', 'O'];

async function removeBackground(letter) {
    const inputPath = path.join(publicDir, `${letter}.png`);
    const outputPath = path.join(publicDir, `${letter}.png`);

    try {
        const image = sharp(inputPath);
        const { data, info } = await image
            .raw()
            .toBuffer({ resolveWithObject: true });

        const channels = info.channels;
        const pixels = new Uint8Array(info.width * info.height * 4);

        for (let i = 0; i < info.width * info.height; i++) {
            let r, g, b, a = 255;

            if (channels === 4) {
                r = data[i * 4];
                g = data[i * 4 + 1];
                b = data[i * 4 + 2];
                a = data[i * 4 + 3];
            } else {
                r = data[i * 3];
                g = data[i * 3 + 1];
                b = data[i * 3 + 2];
            }

            // Detect checkered pattern more precisely
            // Light gray squares: RGB around (204, 204, 204) - #CCCCCC
            // Dark gray squares: RGB around (153, 153, 153) - #999999
            const isLightGray = Math.abs(r - 204) < 15 && Math.abs(g - 204) < 15 && Math.abs(b - 204) < 15;
            const isDarkGray = Math.abs(r - 153) < 15 && Math.abs(g - 153) < 15 && Math.abs(b - 153) < 15;

            // Also check for neutral grays (equal R, G, B values in gray range)
            const isNeutralGray = Math.abs(r - g) < 5 && Math.abs(g - b) < 5 && r > 140 && r < 220;

            const isCheckered = isLightGray || isDarkGray || isNeutralGray;

            pixels[i * 4] = r;
            pixels[i * 4 + 1] = g;
            pixels[i * 4 + 2] = b;
            pixels[i * 4 + 3] = isCheckered ? 0 : a;
        }

        const tmpPath = outputPath + '.tmp';
        await sharp(pixels, {
            raw: {
                width: info.width,
                height: info.height,
                channels: 4
            }
        })
        .png()
        .toFile(tmpPath);

        await fs.rename(tmpPath, outputPath);

        console.log(`✓ ${letter}.png - background removed`);
    } catch (err) {
        console.error(`✗ ${letter}.png - error:`, err.message);
    }
}

async function main() {
    console.log('Removing checkered backgrounds from letter sprites...\n');

    for (const letter of letters) {
        await removeBackground(letter);
    }

    console.log('\nDone! Now run: node scripts/create-logo.mjs');
}

main();
