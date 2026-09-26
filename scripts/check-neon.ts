/** Quick read-only look at what production actually holds: npm run check:neon */
import { readFileSync } from "fs";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = readFileSync(".env.neon", "utf8")
  .split(/\r?\n/)
  .find((l) => l.trim().startsWith("DATABASE_URL="))!
  .split("=")
  .slice(1)
  .join("=")
  .trim();

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

(async () => {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  const models = await prisma.model.findMany({ select: { name: true, priceDisplay: true } });

  console.log("host           :", url.split("@")[1].split("/")[0]);
  console.log("siteName       :", settings?.siteName);
  console.log("logoUrl        :", settings?.logoUrl);
  console.log("shopPhone      :", settings?.shopPhone || "(empty)");
  console.log("whatsappNumber :", settings?.whatsappNumber || "(empty)");
  console.log("instagramUrl   :", settings?.instagramUrl || "(empty)");
  console.log("");
  for (const m of models) console.log(`  ${m.priceDisplay.padEnd(7)} ${m.name}`);
  await prisma.$disconnect();
})();
