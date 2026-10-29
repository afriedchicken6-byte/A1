import { Jimp } from 'jimp';
import path from 'path';

async function processLogo() {
  const inputPath = path.resolve('public/assets/aistudio/WhatsApp_Image_2026-10-29_at_11.30.46_AM_ab6ac67e.jpeg');
  const outputPath = path.resolve('public/assets/aistudio/logo_transparent.png');

  console.log('Reading from:', inputPath);
  const image = await Jimp.read(inputPath);

  // Scan pixels and make pure/near white pixels transparent
  image.scan((x, y, idx) => {
    const red = image.bitmap.data[idx + 0];
    const green = image.bitmap.data[idx + 1];
    const blue = image.bitmap.data[idx + 2];

    // If near white (background)
    if (red > 235 && green > 235 && blue > 235) {
      image.bitmap.data[idx + 3] = 0; // Transparent
    } else if (red > 220 && green > 220 && blue > 220) {
      // Smooth edge antialiasing
      const alpha = Math.max(0, Math.min(255, 255 - ((Math.min(red, green, blue) - 220) * 15)));
      image.bitmap.data[idx + 3] = alpha;
    }
  });

  await image.write(outputPath);
  console.log('Saved transparent logo to:', outputPath);
}

processLogo().catch(err => {
  console.error(err);
  process.exit(1);
});
