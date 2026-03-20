import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('.png')) {
                // Ignore the .png files in the assets itself, just change imports
                fs.writeFileSync(fullPath, content.replace(/\.png/g, '.webp'));
                console.log('Updated', fullPath);
            }
        }
    });
}
walk(path.join(__dirname, 'src'));
