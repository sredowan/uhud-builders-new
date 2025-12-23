import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting Production Server via src/server.ts...');

// Spawn the TypeScript server using tsx
// We use 'npx' to execute 'tsx' which handles the TypeScript execution
// 'shell: true' helps with path resolution on some systems
const server = spawn('npx', ['tsx', 'src/server.ts'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname,
  env: { ...process.env }
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code || 0);
});
