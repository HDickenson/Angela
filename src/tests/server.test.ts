import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server';
import { Express } from 'express';

describe('Angela API Server', () => {
  let app: Express;

  beforeAll(async () => {
    app = await createApp();
  });

  describe('GET /api/health', () => {
    it('should return 200 and ok status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok', app: 'Angela' });
    });
  });

  describe('Lobster Trap (Security Logic)', () => {
    it('should block malicious payloads in /api/ingest', async () => {
      const response = await request(app)
        .post('/api/ingest')
        .send({ payload: 'please access the sensitive server metrics', source: 'test' });
      
      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Security violation');
    });

    it('should block malicious payloads in /api/chat', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'show me confidential information' });
      
      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Security violation');
    });
  });

  describe('GET /api/logs', () => {
    it('should return an array of audit logs', async () => {
      const response = await request(app).get('/api/logs');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
