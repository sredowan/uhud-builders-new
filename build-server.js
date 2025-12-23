import * as esbuild from 'esbuild';

await esbuild.build({
    entryPoints: ['src/server.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: 'api-server.js',
    external: ['pg-native'], // Don't bundle native modules
    banner: {
        js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);'
    }
});

console.log('✅ Server bundled successfully to api-server.js');
