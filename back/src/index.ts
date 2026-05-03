import express from 'express';
process.loadEnvFile();
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { clerkWebhookHandler } from './webhooks/clerk.js';
import { getEnv } from './lib/env.js';

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

app.use('/', (req, res) => {
  res.send('hi');
});

app.listen(env.PORT, () => {
  console.log(`server ready, listening on port: ${env.PORT}`);
});

// import http from 'node:http';
// import { neon } from '@neondatabase/serverless';
// process.loadEnvFile();

// const sql = neon(process.env.DATABASE_URL);

// const requestHandler = async (_: any, res: any) => {
//   const result = await sql`SELECT version()`;
//   const { version } = result[0];
//   res.writeHead(200, { 'Content-Type': 'text/plain' });
//   res.end(version);
// };

// http.createServer(requestHandler).listen(3000, () => {
//   console.log('Server running at http://localhost:3000');
// });
