import type { Request, Response } from 'express';
import { createApp } from '../server.js';

let appReady: ReturnType<typeof createApp> | null = null;

function getApp() {
  if (!appReady) appReady = createApp();
  return appReady;
}

export default async function handler(req: Request, res: Response) {
  const app = await getApp();
  return app(req, res);
}
