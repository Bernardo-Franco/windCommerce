import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import fs from 'node:fs';
import path from 'node:path';

import { clerkMiddleware } from '@clerk/express';
import { clerkWebhookHandler } from './webhooks/clerk.js';
import { getEnv } from './lib/env.js';
import keepAliveCronJob from './lib/cron.js';
import meRouter from './routes/meRoutes.js';
import productRouter from './routes/productRoutes.js';
import streamRouter from './routes/streamRouter.js';

const env = getEnv();
const app = express();

const rawJson = express.raw({ type: 'application/json', limit: '1mb' });

// its important to run this before the json parse cuz this needs the data as raw json
app.post('/webhook/clerk', rawJson, (req, res) => {
  void clerkWebhookHandler(req, res);
});

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());
// the underscore at the start of the parameter is a convention to say this one is not gonna be used
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/me', meRouter);
app.use('/api/products', productRouter);
app.use('/api/stream', streamRouter);

const publicDir = path.join(process.cwd(), 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  app.get('/{*any}', (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next();
      return;
    }

    if (req.path.startsWith('/api') || req.path.startsWith('/webhooks')) {
      next();
      return;
    }

    res.sendFile(path.join(publicDir, 'index.html'), (err) => next(err));
  });
}

// TODO add error handler middleware

app.listen(env.PORT, () => {
  console.log(`server ready, listening on port: ${env.PORT}`);
  if (env.NODE_ENV === 'production') keepAliveCronJob.start();
});
