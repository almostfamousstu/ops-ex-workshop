import pool from './pool';
import { createCohort } from './queries';
import { randomBytes } from 'crypto';

async function seed() {
  // Run migrations first
  const fs = await import('fs');
  const path = await import('path');
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  await pool.query(sql);
  console.log('Schema applied');

  // Create a dev cohort with a known join code
  const joinCode = 'QUICKSILVER';
  try {
    const cohort = await createCohort('monaco-syndicate', joinCode);
    console.log(`Dev cohort created: join code = ${joinCode}, id = ${cohort.id}`);
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('duplicate')) {
      console.log(`Dev cohort already exists (join code: ${joinCode})`);
    } else {
      throw e;
    }
  }

  await pool.end();
  console.log('Seed complete');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
