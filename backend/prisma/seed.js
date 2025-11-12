require('dotenv').config();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin user already exists:', email);
    return;
  }
  const hash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'Admin@123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Admin User',
      email,
      password: hash,
      role: 'ADMIN'
    }
  });
  console.log('Seeded admin user', user.email);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
