/// <reference types="node"/>
import { defineConfig } from 'drizzle-kit';
import { loadEnvFile } from 'node:process';
loadEnvFile();

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
});
