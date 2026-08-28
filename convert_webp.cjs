const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function convert() {
  const dir = path.resolve(__dirname, 'public');
  const files = fs.readdirSync(dir);

  for (const file of files) {
    if (file.endsWith('.jpg') || file.endsWith('.png')) {
      const inputPath = path.join(dir, file);
      const outputName = file.replace(/\.(jpg|png)$/, '.webp');
      const outputPath = path.join(dir, outputName);

      console.log(`Converting ${file} -> ${outputName}`);
      let pipeline = sharp(inputPath);

      if (file === 'dievcata.jpg') {
        pipeline = pipeline.resize({ width: 1280, withoutEnlargement: true });
      } else {
        pipeline = pipeline.resize({ width: 400, withoutEnlargement: true });
      }

      await pipeline.webp({ quality: 80 }).toFile(outputPath);
      fs.unlinkSync(inputPath);
      console.log(`Deleted original: ${file}`);
    }
  }
}

convert().then(() => console.log('Done WebP conversion!'));
