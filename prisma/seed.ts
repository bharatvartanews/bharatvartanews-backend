// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

export default async function seedCore(prisma: PrismaClient) {
  const email = 'admin@bharatvarta.com';

  const existing = await prisma.user.findUnique({
    where: { email }
  });

  if (existing) {
    console.log('✅ Super admin already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email,
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      active: true
    }
  });

  console.log('✅ Super admin created successfully');
}
