
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '../');
const uploadsDir = path.join(rootDir, 'uploads');
const distDir = path.join(rootDir, 'dist');
const distUploadsDir = path.join(distDir, 'uploads');

console.log(`Copying uploads from ${uploadsDir} to ${distUploadsDir}...`);

if (!fs.existsSync(uploadsDir)) {
    console.warn('Uploads directory does not exist, skipping copy.');
    process.exit(0);
}

if (!fs.existsSync(distDir)) {
    console.error('Dist directory does not exist. Run build first.');
    process.exit(1);
}

if (!fs.existsSync(distUploadsDir)) {
    fs.mkdirSync(distUploadsDir, { recursive: true });
}

function copyRecursive(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath);
            }
            copyRecursive(srcPath, destPath);
        } else {
            console.log(`Copying ${entry.name}`);
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

copyRecursive(uploadsDir, distUploadsDir);
console.log('Uploads copied successfully.');
