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
            const fullUrl = req.url || '';
            const [urlPath] = fullUrl.split('?');
            // Remove trailing slash for exact matching
            const url = urlPath.replace(/\/$/, '');

            // All our API responses are JSON
            const sendJson = (status: number, data: any) => {
              res.statusCode = status;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify(data));
            };

            // GET /api/videos — return all videos
            if (url === '/api/videos' && req.method === 'GET') {
              try {
                const data = fs.readFileSync(VIDEOS_PATH, 'utf-8');
                sendJson(200, JSON.parse(data));
              } catch (err) {
                console.error('API Error (GET):', err);
                sendJson(500, { error: 'Failed to read videos' });
              }
              return;
            }

            // POST /api/videos — add a new video
            if (url === '/api/videos' && req.method === 'POST') {
              try {
                const body = await parseBody(req);
                if (!body) {
                  return sendJson(400, { error: 'Empty request body' });
                }

                const { title, video_url, code } = JSON.parse(body);

                if (!title || !video_url) {
                  return sendJson(400, { error: 'title and video_url are required' });
                }

                if (code !== 'snaigref') {
                  return sendJson(403, { error: 'Invalid Access Code' });
                }

                const videos = JSON.parse(fs.readFileSync(VIDEOS_PATH, 'utf-8'));
                const newVideo = {
                  id: Math.random().toString(36).substring(2, 11),
                  title: title.trim(),
                  video_url: video_url.trim(),
                };
                videos.unshift(newVideo); // Add to beginning
                fs.writeFileSync(VIDEOS_PATH, JSON.stringify(videos, null, 2));

                sendJson(201, newVideo);
              } catch (err) {
                console.error('API Error (POST):', err);
                sendJson(500, { error: 'Failed to save video: ' + (err instanceof Error ? err.message : 'Unknown error') });
              }
              return;
            }

            // DELETE /api/videos/:id
            if (url.startsWith('/api/videos/') && req.method === 'DELETE') {
              try {
                const id = url.replace('/api/videos/', '');
                const videos = JSON.parse(fs.readFileSync(VIDEOS_PATH, 'utf-8'));
                const filtered = videos.filter((v: { id: string }) => v.id !== id);
                fs.writeFileSync(VIDEOS_PATH, JSON.stringify(filtered, null, 2));
                sendJson(200, { success: true });
              } catch (err) {
                console.error('API Error (DELETE):', err);
                sendJson(500, { error: 'Failed to delete video' });
              }
              return;
            }

            // OPTIONS preflight
            if (req.method === 'OPTIONS' && url.startsWith('/api/')) {
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
              res.statusCode = 204;
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
