import { config } from 'dotenv';
import path from 'node:path';
config({path:[path.resolve(process.cwd(), '.env'),path.resolve(process.cwd(), '../../.env')]});
export const appConfig = {
  port: Number(process.env.API_PORT || 4000),
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:4000',
  production: process.env.NODE_ENV === 'production',
  storage: path.resolve(process.env.PRIVATE_STORAGE_PATH || '.storage'),
};
export function validateEnvironment() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL es obligatorio. Configura .env.');
  if (appConfig.production && !appConfig.appUrl.startsWith('https://')) throw new Error('APP_URL debe usar HTTPS en producción.');
}
