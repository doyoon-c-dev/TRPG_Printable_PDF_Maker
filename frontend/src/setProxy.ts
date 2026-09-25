

import { createProxyMiddleware } from 'http-proxy-middleware';

export default function (app: { use: (...args: any[]) => void }) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
    })
  );
};