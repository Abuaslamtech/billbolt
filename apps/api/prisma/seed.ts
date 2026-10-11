import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@billbolt.com').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'Billbolt Administrator';

  if (!adminPassword) {
    console.error('❌ Security Error: ADMIN_PASSWORD environment variable is required.');
    console.error('   To prevent leaking credentials in Git, store your password in apps/api/.env:');
    console.error('   ADMIN_PASSWORD="your-strong-password"');
    console.error('   Then re-run: pnpm --filter @billbolt/api seed\n');
    process.exit(1);
  }

  console.log(`🌱 Seeding admin account: ${adminEmail}...`);

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  // Clean up legacy test admin if present
  await prisma.user.deleteMany({
    where: { email: 'admin@billbolt.ng' },
  });

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: UserRole.ADMIN,
      passwordHash,
      fullName: adminName,
      isActive: true,
    },
    create: {
      email: adminEmail,
      fullName: adminName,
      passwordHash,
      role: UserRole.ADMIN,
      phone: '08000000000',
      isActive: true,
    },
  });

  console.log(`✅ Admin account secured and seeded!`);
  console.log(`   ID:    ${admin.id}`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Role:  ${admin.role}`);
}

main()
  .catch((e) => {
    console.error('❌ Failed to seed database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
