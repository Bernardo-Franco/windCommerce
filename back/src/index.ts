import express from 'express';
process.loadEnvFile();
const PORT = process.env.PORT;
const app = express();

app.use('/', (req, res) => {
  res.send('hi');
});

app.listen(PORT, () => {
  console.log(`server ready, listening on port: ${PORT}`);
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
