import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import fs from 'node:fs';
import path from 'node:path';

import * as Sentry from '@sentry/node';

import { clerkMiddleware } from '@clerk/express';
import { clerkWebhookHandler } from './webhooks/clerk.js';
import { getEnv } from './lib/env.js';
import keepAliveCronJob from './lib/cron.js';
import meRouter from './routes/meRoutes.js';
import productRouter from './routes/productRoutes.js';
import streamRouter from './routes/streamRouter.js';
import checkoutRouter from './routes/checkoutRoutes.js';
import { polarWebhookHandler } from './webhooks/polar.js';
import { sentryClerkUserMiddleware } from './middleware/sentryClerkUser.js';

const env = getEnv();
const app = express();

const rawJson = express.raw({ type: 'application/json', limit: '1mb' });

// its important to run this before the json parse cuz this needs the data as raw json
app.post('/webhook/clerk', rawJson, (req, res) => {
  void clerkWebhookHandler(req, res);
});
app.post('/webhook/polar', rawJson, (req, res) => {
  void polarWebhookHandler(req, res);
});

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());
app.use(sentryClerkUserMiddleware);
// the underscore at the start of the parameter is a convention to say this one is not gonna be used
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/me', meRouter);
app.use('/api/products', productRouter);
app.use('/api/stream', streamRouter);
app.use('/api/checkout', checkoutRouter);

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

// this will attach sentry to the "res" response object
Sentry.setupExpressErrorHandler(app);

//  error handler middleware
app.use(
  (
    _error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    const sentryId = (res as express.Response & { sentry?: string }).sentry;

    res
      .status(500)
      .json({
        error: 'Internal server error',
        ...(sentryId !== undefined && { sentryId }),
      });
  },
);

app.listen(env.PORT, () => {
  console.log(`server ready, listening on port: ${env.PORT}`);
  if (env.NODE_ENV === 'production') keepAliveCronJob.start();
});
