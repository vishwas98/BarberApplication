import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.barber.deleteMany();

  const [alex, mia] = await prisma.barber.createMany({
    data: [{ name: "Alex" }, { name: "Mia" }],
  }).then(async () => await prisma.barber.findMany());

  const services = await prisma.service.createMany({
    data: [
      { name: "Haircut", duration: 30, price: 25.0 },
      { name: "Beard Trim", duration: 30, price: 15.0 },
      { name: "Cut + Beard", duration: 60, price: 35.0 }
    ],
  }).then(async () => await prisma.service.findMany());

  // create a sample booking for Alex tomorrow at 10:00 for Haircut
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const haircut = services.find(s => s.name === "Haircut")!;

  await prisma.booking.create({
    data: {
      barberId: alex!.id,
      serviceId: haircut.id,
      customerName: "John Doe",
      customerEmail: "john@example.com",
      customerPhone: "555-1234",
      start: tomorrow,
      end: new Date(tomorrow.getTime() + haircut.duration * 60 * 1000),
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });