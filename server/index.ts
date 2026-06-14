import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = 5000;

console.log('Starting Tour Guide Manager...');

// Start Python backend
const backend = spawn('python', ['main_firestore.py'], {
  cwd: path.join(process.cwd(), 'backend'),
  stdio: 'inherit'
});

// Start React frontend immediately 
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(process.cwd(), 'frontend'),
  stdio: 'inherit'
});

// Setup middleware
app.use(express.json());

// Proxy API requests to backend
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:8000',
  changeOrigin: true,
  pathRewrite: { '^/api': '' },
  logLevel: 'silent'
}));

// Serve static frontend assets and proxy to Vite
app.use('/', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  ws: true,
  logLevel: 'silent'
}));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Tour Guide Manager running on port ${PORT}`);
  console.log(`Proxying to React app on port 3000`);
  console.log(`Backend API on port 8000`);
});

process.on('SIGINT', () => {
  console.log('Shutting down...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});
