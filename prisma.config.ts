import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// .env.local for everyday work; ENV_FILE points the production commands at
// .env.neon instead. Naming the file explicitly is what stops a migration
// landing on the wrong database.
config({ path: process.env.ENV_FILE || ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
