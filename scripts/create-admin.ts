import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@bharatvartanews.com";
  const password = "Admin@12345";

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Super Admin",
      email,
      password: hashed,
      role: "SUPER_ADMIN",
      active: true,
    },
  });

  console.log("✅ Admin created:", user.email);
}

main()
  .catch(console.error)
  .finally(async () => prisma.$disconnect());
