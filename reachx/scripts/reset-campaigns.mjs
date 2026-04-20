import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: "postgresql://postgres:123@localhost:5432/reachx",
});
const prisma = new PrismaClient({ adapter });

const result = await prisma.campaign.updateMany({
  where: { status: "SENDING" },
  data: { status: "DRAFT" },
});

console.log(`Reset ${result.count} campaign(s) from SENDING → DRAFT`);
await prisma.$disconnect();
