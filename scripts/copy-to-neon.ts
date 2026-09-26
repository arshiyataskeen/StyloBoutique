/**
 * One-off: copy the content configured locally into the production database.
 *
 * `seed` only creates blank defaults, so a fresh production database has none
 * of the branding, wording, photos or designs set up through the admin panel.
 * This moves them across.
 *
 * Safe to re-run: settings and categories are upserted, designs are replaced.
 * It refuses to run if the target has bookings, so it can never remove a design
 * a real customer has ordered.
 *
 *   npm run copy:neon
 */
import { readFileSync } from "fs";
import { PrismaClient, type Prisma } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function fromEnvFile(path: string, key: string) {
  const line = readFileSync(path, "utf8")
    .split(/\r?\n/)
    .find((l) => l.trim().startsWith(`${key}=`));
  if (!line) throw new Error(`${key} not found in ${path}`);
  return line.slice(line.indexOf("=") + 1).trim();
}

const localUrl = process.env.DATABASE_URL;
const neonUrl = fromEnvFile(".env.neon", "DATABASE_URL");

if (!localUrl) throw new Error("DATABASE_URL missing — run via `npm run copy:neon`.");
if (localUrl === neonUrl) throw new Error("Source and target are the same database — aborting.");

const connect = (url: string) =>
  new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

const local = connect(localUrl);
const neon = connect(neonUrl);

const host = (url: string) => url.split("@")[1].split("/")[0];

async function copy() {
  console.log("from :", host(localUrl!));
  console.log("to   :", host(neonUrl));
  console.log("");

  const bookings = await neon.booking.count();
  if (bookings > 0) {
    throw new Error(
      `Target has ${bookings} booking(s). Refusing to replace designs they may reference.`
    );
  }

  // 1. Branding, hero media, gallery, stats, section wording.
  const settings = await local.siteSettings.findUnique({ where: { id: "main" } });
  if (settings) {
    const { id, updatedAt, stats, sectionContent, ...rest } = settings;
    void id;
    void updatedAt;

    // Prisma reads JSON columns as JsonValue (which admits null) but only
    // accepts InputJsonValue on write, so these two need narrowing.
    const data = {
      ...rest,
      stats: (stats ?? []) as Prisma.InputJsonValue,
      sectionContent: (sectionContent ?? {}) as Prisma.InputJsonValue,
    };

    await neon.siteSettings.upsert({
      where: { id: "main" },
      update: data,
      create: { id: "main", ...data },
    });
    console.log("site settings :", settings.siteName, "· logo", settings.logoUrl);
  }

  // 2. Categories, matched on slug so re-running updates rather than duplicates.
  const categories = await local.category.findMany();
  for (const category of categories) {
    const { id, createdAt, updatedAt, ...data } = category;
    void id;
    void createdAt;
    void updatedAt;
    await neon.category.upsert({ where: { slug: category.slug }, update: data, create: data });
  }
  console.log("categories    :", categories.length);

  // 3. Designs. Ids differ between databases, so categories are re-linked by
  //    slug rather than carried over.
  const models = await local.model.findMany({ include: { category: true } });
  const idForSlug = new Map((await neon.category.findMany()).map((c) => [c.slug, c.id]));

  await neon.model.deleteMany({});
  let copied = 0;
  for (const model of models) {
    const { id, createdAt, updatedAt, categoryId, category, ...data } = model;
    void id;
    void createdAt;
    void updatedAt;
    void categoryId;
    const targetId = idForSlug.get(category.slug);
    if (!targetId) {
      console.log("  skipped", model.name, "— no category", category.slug);
      continue;
    }
    await neon.model.create({ data: { ...data, categoryId: targetId } });
    copied++;
  }
  console.log("designs       :", copied);
  console.log("\nDone — reload the live site.");
}

copy()
  .catch((error) => {
    console.error("\nFailed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await local.$disconnect();
    await neon.$disconnect();
  });
