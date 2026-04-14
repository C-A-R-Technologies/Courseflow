// seed_users.ts
// Generates 10,000 fake users and inserts them into the users table.
//
// Usage:
//   bun test/seed_users.ts
//   DATABASE_URL=postgresql://user:pass@localhost:5432/dbname bun test/seed_users.ts

import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import postgres from 'postgres';

const { Bun: BunRuntime } = globalThis as typeof globalThis & {
  Bun: {
    env: Record<string, string | undefined>;
    write(path: string, data: string): Promise<void>;
    exit(code?: number): never;
  };
};

const DATABASE_URL = BunRuntime.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const sql = postgres(DATABASE_URL, {
  connect_timeout: 60,
});

// Role distribution (roughly realistic for a course eval system)
const ROLES = [
  ...Array(9200).fill('student'),
  ...Array(600).fill('instructor'),
  ...Array(150).fill('dean'),
  ...Array(50).fill('admin'),
];

const MAJORS = [
  'Computer Science', 'Mathematics', 'Physics', 'Biology', 'Chemistry',
  'English', 'History', 'Psychology', 'Economics', 'Political Science',
  'Mechanical Engineering', 'Electrical Engineering', 'Business Administration',
  'Philosophy', 'Sociology', 'Art History', 'Nursing', 'Education',
  'Environmental Science', 'Communications',
];

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function pickRole(index: number): string {
  return ROLES[index % ROLES.length];
}

async function seed() {
  const TOTAL = 10_000;
  const BATCH_SIZE = 500;
  const sharedPassword = 'WeakestPassOf2026??';
  const passwordHash = await bcrypt.hash(sharedPassword, 10);

  console.log(`Seeding ${TOTAL} users in batches of ${BATCH_SIZE}...`);

  // Shuffle roles so they're not grouped
  ROLES.sort(() => Math.random() - 0.5);

  const seenEmails = new Set<string>();
  const seededUsers: Array<{ email: string; password: string }> = [];

  for (let offset = 0; offset < TOTAL; offset += BATCH_SIZE) {
    const batchCount = Math.min(BATCH_SIZE, TOTAL - offset);
    const values: string[] = [];
    const params: Array<string | Date | null> = [];
    let paramIndex = 1;

    for (let i = 0; i < batchCount; i++) {
      const role = pickRole(offset + i);

      // Ensure unique emails (faker occasionally collides at scale)
      let email: string;
      do {
        email = faker.internet.email({
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          provider: faker.helpers.arrayElement(['university.edu', 'college.edu', 'school.edu', 'gmail.com']),
        }).toLowerCase();
      } while (seenEmails.has(email));
      seenEmails.add(email);
      seededUsers.push({ email, password: sharedPassword });

      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const major = (role === 'student')
        ? faker.helpers.arrayElement(MAJORS)
        : null; // instructors/deans/admins don't have a major
      const createdAt = randomDate(new Date('2020-01-01'), new Date());
      const lastLogin = randomDate(createdAt, new Date());
      const resetAt = Math.random() < 0.1   // ~10% ever requested a reset
        ? randomDate(createdAt, new Date()).toISOString()
        : null;

      values.push(
        `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, ` +
        `$${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
      );
      params.push(
        email, firstName, lastName, major,
        role, passwordHash, resetAt, lastLogin, createdAt,
      );
    }

    const query = `
      INSERT INTO users (email, firstname, lastname, majoring_in, role, password_hash, password_reset_last_requested_at, last_login, created_at)
      VALUES ${values.join(', ')}
      ON CONFLICT (email) DO NOTHING;
    `;

    await sql.unsafe(query, params);
    console.log(`  Inserted rows ${offset + 1}–${offset + batchCount}`);
  }

  await BunRuntime.write(
    'src/test/seed_users.generated.json',
    `${JSON.stringify(seededUsers, null, 2)}\n`,
  );

  console.log('done, 10,000 users seeded, seed_users.generated.json created');
  await sql.end();
}

seed().catch(async (err) => {
  console.error('Seeding failed:', err);
  await sql.end();
  BunRuntime.exit(1);
});