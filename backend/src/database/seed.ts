import * as bcrypt from 'bcrypt';
import { createDataSource } from './data-source';

const companies = [
  'Acme Corp',
  'Globex',
  'Initech',
  'Umbrella',
  'Stark Industries',
  'Wayne Enterprises',
  'Soylent',
  'Hooli',
];

const firstNames = [
  'Ana',
  'Luis',
  'María',
  'Carlos',
  'Elena',
  'Pablo',
  'Sofía',
  'Diego',
  'Laura',
  'Jorge',
];

const lastNames = [
  'García',
  'López',
  'Martínez',
  'Sánchez',
  'Pérez',
  'Gómez',
  'Ruiz',
  'Díaz',
  'Torres',
  'Ramírez',
];

const leadTitles = [
  'Demo request',
  'Pricing inquiry',
  'Partnership interest',
  'Product trial',
  'Renewal discussion',
  'Upsell opportunity',
  'Support follow-up',
  'Event lead',
];

const statuses = ['new', 'contacted', 'qualified', 'lost'] as const;

async function seed() {
  const ds = createDataSource();
  await ds.initialize();

  const existingUsers = await ds.query('SELECT COUNT(*) AS c FROM users');
  if (Number(existingUsers[0].c) > 0) {
    console.log('Seed skipped: users already exist.');
    await ds.destroy();
    return;
  }

  const passwordHash = await bcrypt.hash('demo1234', 10);

  await ds.query(
    `INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?), (?, ?, ?)`,
    [
      'admin@demo.com',
      passwordHash,
      'Admin Demo',
      'sales@demo.com',
      passwordHash,
      'Sales Demo',
    ],
  );

  const users = await ds.query('SELECT id, email FROM users ORDER BY id ASC');
  const adminId = users[0].id as number;
  const salesId = users[1].id as number;

  const contactIds: number[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`;
    const email = `contact${i}@example.com`;
    const company = companies[i % companies.length];
    const phone = `+34 600 ${String(100000 + i).slice(0, 6)}`;
    const result = await ds.query(
      `INSERT INTO contacts (name, email, company, phone) VALUES (?, ?, ?, ?)`,
      [name, email, company, phone],
    );
    contactIds.push(result.insertId as number);
  }

  for (let i = 1; i <= 30; i++) {
    const title = `${leadTitles[i % leadTitles.length]} #${i}`;
    const status = statuses[i % statuses.length];
    const score = (i * 7) % 100;
    const contactId = contactIds[(i - 1) % contactIds.length];
    const ownerId = i % 2 === 0 ? adminId : salesId;
    await ds.query(
      `INSERT INTO leads (title, status, score, contact_id, owner_id) VALUES (?, ?, ?, ?, ?)`,
      [title, status, score, contactId, ownerId],
    );
  }

  console.log('Seed complete.');
  console.log('Demo users:');
  console.log('  admin@demo.com / demo1234');
  console.log('  sales@demo.com / demo1234');
  console.log(`  ${contactIds.length} contacts, 30 leads`);

  await ds.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
