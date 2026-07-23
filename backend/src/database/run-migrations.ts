import * as fs from 'fs';
import * as path from 'path';
import { createDataSource } from './data-source';

async function run() {
  const ds = createDataSource();
  await ds.initialize();

  await ds.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_schema_migrations_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const rows = await ds.query(
      'SELECT id FROM schema_migrations WHERE name = ? LIMIT 1',
      [file],
    );
    if (rows.length > 0) {
      console.log(`Skip ${file} (already applied)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`Applying ${file}...`);
    await ds.query(sql);
    await ds.query('INSERT INTO schema_migrations (name) VALUES (?)', [file]);
    console.log(`Applied ${file}`);
  }

  await ds.destroy();
  console.log('Migrations complete.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
