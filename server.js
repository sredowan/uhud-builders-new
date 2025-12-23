console.log('Starting Production Server (Bundled)...');
import('./dist/server.js').catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
