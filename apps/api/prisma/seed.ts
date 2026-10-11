import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'Billbolt Administrator';

  if (!adminEmail || !adminPassword) {
    console.error('❌ Security Error: Both ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.');
    console.error('   To prevent leaking credentials in Git, store your credentials in apps/api/.env:');
    console.error('   ADMIN_EMAIL="admin@yourdomain.com"');
    console.error('   ADMIN_PASSWORD="your-strong-password"');
    console.error('   Then re-run: pnpm --filter @billbolt/api seed\n');
    process.exit(1);
  }

  console.log(`🌱 Seeding admin account: ${adminEmail}...`);

  const passwordHash = await bcrypt.hash(adminPassword, 10);

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
