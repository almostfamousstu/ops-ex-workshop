import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

let loaded = false;

export function loadEnv() {
  if (loaded) {
    return;
  }

  // Prefer the repository root .env, then fallback to backend/.env.
  const envPaths = [
    path.resolve(__dirname, '..', '..', '..', '.env'),
    path.resolve(__dirname, '..', '..', '.env'),
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      break;
    }
  }

  loaded = true;
}
