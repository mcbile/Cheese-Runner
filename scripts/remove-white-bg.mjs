/**
 * Remove white/light background from KAASINO logo
 * Makes white and near-white pixels transparent
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.join(__dirname, '..');

const inputPath = path.join(projectDir, 'kaasino_logo_full.jpeg');
const outputPath = path.join(projectDir, 'kaasino_logo_full_transparent.png');

async function removeWhiteBackground() {
    console.log('Removing white background from KAASINO logo...\n');

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

            // Detect white/light background
            // White and near-white pixels (high brightness, low saturation)
            const brightness = (r + g + b) / 3;
            const maxChannel = Math.max(r, g, b);
            const minChannel = Math.min(r, g, b);
            const saturation = maxChannel > 0 ? (maxChannel - minChannel) / maxChannel : 0;

            // Consider as background if:
            // - Very bright and low saturation (white/light gray)
            // - Or pure white-ish
            const isWhiteBackground = brightness > 240 && saturation < 0.1;
            const isLightBackground = brightness > 220 && saturation < 0.15;

            // Also catch any remaining light beige/cream tones
            const isBeige = r > 230 && g > 220 && b > 200 && saturation < 0.2;

            const shouldBeTransparent = isWhiteBackground || isLightBackground || isBeige;

            pixels[i * 4] = r;
            pixels[i * 4 + 1] = g;
            pixels[i * 4 + 2] = b;
            pixels[i * 4 + 3] = shouldBeTransparent ? 0 : a;
        }

        await sharp(pixels, {
            raw: {
                width: info.width,
                height: info.height,
                channels: 4
            }
        })
        .png()
        .toFile(outputPath);

        console.log(`✓ Background removed!`);
        console.log(`  Input:  ${inputPath}`);
        console.log(`  Output: ${outputPath}`);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

removeWhiteBackground();
