const { execSync } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

const soundsDir = path.resolve(__dirname, 'public/sounds');
const assetsDir = path.resolve(__dirname, 'assets/sounds');

const conversions = [
  { match: /filip.*hahaha/i, target: 'filip_victory' },
  { match: /simon.*a.*moja.*heligonka/i, target: 'simi_victory' },
  { match: /jakub.*zalo/i, target: 'jakub_victory' },
];

const allFiles = fs.readdirSync(soundsDir);

conversions.forEach(({ match, target }) => {
  const found = allFiles.find(f => match.test(f) && f.endsWith('.aac'));
  if (found) {
    const inputPath = path.join(soundsDir, found);
    const outWav = path.join(soundsDir, `${target}.wav`);

    console.log(`Converting ${found} -> ${target}.wav`);
    try {
      execSync(`"${ffmpegPath}" -y -i "${inputPath}" -c:a pcm_s16le -ar 44100 "${outWav}"`, { stdio: 'inherit' });
      fs.copyFileSync(outWav, path.join(assetsDir, `${target}.wav`));
      fs.unlinkSync(inputPath);
      console.log(`✓ Converted ${target}.wav`);
    } catch (e) {
      console.error(`Error converting ${found}:`, e);
    }
  }
});

// Remove any remaining .aac or non-wav files
[soundsDir, assetsDir].forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      if (!file.endsWith('.wav')) {
        console.log(`Deleting non-wav: ${file}`);
        try { fs.unlinkSync(path.join(dir, file)); } catch {}
      }
    });
  }
});

console.log('Conversion and cleanup complete!');
