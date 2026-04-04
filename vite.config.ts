import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

const VIDEOS_PATH = path.resolve(__dirname, 'src/data/videos.json');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'videos-api',
        configureServer(server) {
          // Helper to parse JSON body
          function parseBody(req: IncomingMessage): Promise<string> {
            return new Promise((resolve) => {
              let body = '';
              req.on('data', (chunk) => (body += chunk));
              req.on('end', () => resolve(body));
            });
          }

          server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
            const url = req.url || '';

            // GET /api/videos — return all videos
            if (url === '/api/videos' && req.method === 'GET') {
              try {
                const data = fs.readFileSync(VIDEOS_PATH, 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(data);
              } catch {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Failed to read videos' }));
              }
              return;
            }

            // POST /api/videos — add a new video
            if (url === '/api/videos' && req.method === 'POST') {
              try {
                res.setHeader('Access-Control-Allow-Origin', '*');
                const body = await parseBody(req);
                const { title, video_url, code } = JSON.parse(body);

                if (!title || !video_url) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: 'title and video_url are required' }));
                  return;
                }

                if (code !== 'snaigref') {
                  res.statusCode = 403;
                  res.end(JSON.stringify({ error: 'Invalid Access Code' }));
                  return;
                }

                const videos = JSON.parse(fs.readFileSync(VIDEOS_PATH, 'utf-8'));
                const newVideo = {
                  id: Math.random().toString(36).substring(2, 11),
                  title: title.trim(),
                  video_url: video_url.trim(),
                };
                videos.unshift(newVideo); // Add to beginning
                fs.writeFileSync(VIDEOS_PATH, JSON.stringify(videos, null, 2));

                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(newVideo));
              } catch {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Failed to save video' }));
              }
              return;
            }

            // DELETE /api/videos/:id
            if (url.startsWith('/api/videos/') && req.method === 'DELETE') {
              try {
                res.setHeader('Access-Control-Allow-Origin', '*');
                const id = url.replace('/api/videos/', '');
                const videos = JSON.parse(fs.readFileSync(VIDEOS_PATH, 'utf-8'));
                const filtered = videos.filter((v: { id: string }) => v.id !== id);
                fs.writeFileSync(VIDEOS_PATH, JSON.stringify(filtered, null, 2));
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Failed to delete video' }));
              }
              return;
            }

            // OPTIONS preflight
            if (req.method === 'OPTIONS' && url.startsWith('/api/')) {
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
              res.end();
              return;
            }

            next();
          });
        },
      },
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
