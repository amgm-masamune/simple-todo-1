import { defineConfig } from "drizzle-kit";


const dbUrl = Deno.env.get("DB_APP_URL");
if (dbUrl === undefined || dbUrl.trim() === "")
  throw new Error("環境変数 DB_APP_URL が指定されていません。");

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl
  }
});
