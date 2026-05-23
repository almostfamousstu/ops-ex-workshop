import { Pool } from 'pg';
import { loadEnv } from '../config/loadEnv';

loadEnv();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Add it to your .env (root) or shell environment before running backend scripts.');
}

let parsedConnection: URL;

try {
  parsedConnection = new URL(connectionString);
} catch {
  throw new Error('DATABASE_URL is not a valid URL. Example: postgresql://user:password@localhost:5432/dbname');
}

if (!parsedConnection.password) {
  throw new Error('DATABASE_URL must include a password. Example: postgresql://user:password@localhost:5432/dbname');
}

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected DB pool error', err);
});

export default pool;
