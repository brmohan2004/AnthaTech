import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dir = path.join(__dirname, 'src', 'assets');
const files = fs.readdirSync(dir);

for (const file of files) {
  if (file.endsWith('.png') || file.endsWith('.jpg')) {
    const name = path.parse(file).name;
    sharp(path.join(dir, file))
      .webp({ quality: 80 })
      .toFile(path.join(dir, `${name}.webp`))
      .then(() => console.log(`Converted ${file} to webp`))
      .catch(err => console.error(`Error converting ${file}:`, err));
  }
}
