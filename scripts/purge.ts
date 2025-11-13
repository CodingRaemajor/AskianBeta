// purge.ts
import { Client } from 'pg';

async function main() {
  const url = process.env.DATABASE_URL;
  const prefix = process.argv[2]; // e.g., "https://www.uregina.ca/registrar/"

  if (!url) throw new Error('DATABASE_URL is not set');
  if (!prefix) {
    console.error('Usage: ts-node purge.ts <source-prefix>');
    process.exit(1);
  }

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    const res = await client.query(
      `DELETE FROM documents WHERE source ILIKE $1 RETURNING id`,
      [prefix + '%']
    );
    console.log(`Deleted ${res.rowCount} rows`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});