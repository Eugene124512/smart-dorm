import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.occupancyLog.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@smartdorm.local",
      password: "admin123",
      role: "ADMIN",
    },
  });

  const juan = await prisma.user.create({
    data: {
      name: "Juan Dela Cruz",
      email: "juan.delacruz@smartdorm.local",
      password: "tenant123",
      role: "TENANT",
      tenant: {
        create: {
          roomNumber: "301",
          keycardId: "KC-90812",
          status: "ACTIVE",
          hoursPresent: 450,
        },
      },
    },
    include: { tenant: true },
  });

  const maria = await prisma.user.create({
    data: {
      name: "Maria Santos",
      email: "maria.santos@smartdorm.local",
      password: "tenant123",
      role: "TENANT",
      tenant: {
        create: {
          roomNumber: "301",
          keycardId: "KC-90813",
          status: "INACTIVE",
          hoursPresent: 300,
        },
      },
    },
    include: { tenant: true },
  });

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  await prisma.occupancyLog.create({
    data: {
      tenantId: juan.tenant!.id,
      checkInTime: twoHoursAgo,
    },
  });

  await prisma.occupancyLog.create({
    data: {
      tenantId: maria.tenant!.id,
      checkInTime: new Date(Date.now() - 26 * 60 * 60 * 1000),
      checkOutTime: new Date(Date.now() - 20 * 60 * 60 * 1000),
      durationHours: 6,
    },
  });

  console.log("Seeded:", {
    admin: "admin@smartdorm.local",
    juan: juan.email,
    maria: maria.email,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
