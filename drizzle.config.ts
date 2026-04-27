import { defineConfig } from "drizzle-kit";

// NOTE: Config ファイルはよくわからないので throw しないようにした
const dbUrl = Deno.env.get("DB_APP_URL")!;

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl
  }
});
