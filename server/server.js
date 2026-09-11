require('./utils/loadEnv').loadEnv();
const { validateServerEnv } = require('./utils/validateEnv');

// Fail fast with a value-free message (names only, never secrets).
try {
  validateServerEnv();
} catch (err) {
  console.error(`[EDGAR SPACE SERVER] ${err.message}`);
  process.exit(1);
}

const app = require('./app');

const PORT = process.env.PORT || 5050;

const server = app.listen(PORT, () => {
  console.log(`[EDGAR SPACE SERVER] Backend API running at http://localhost:${PORT}/api`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
