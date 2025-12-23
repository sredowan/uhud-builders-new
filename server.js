import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting Production Server via src/server.ts...');

// Construct path to local 'tsx' cli
// This avoids relying on global npx or path resolution
const tsxPath = path.join(__dirname, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const serverPath = path.join(__dirname, 'src', 'server.ts');

console.log(`Executing: node ${tsxPath} ${serverPath}`);

const server = spawn(process.execPath, [tsxPath, serverPath], {
  stdio: 'inherit',
  cwd: __dirname,
  env: { ...process.env }
});

server.on('error', (err) => {
  console.error('Failed to start server process:', err);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code || 0);
});
