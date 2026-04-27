// docker compose exec app sh -c "deno run -A src/check-db-connect.ts"
// http://github.com/denodrivers/postgres

// コンテナ同士の接続で一時的に利用するため
// deno-lint-ignore no-import-prefix no-unversioned-import
import { Client, ClientOptions } from "jsr:@db/postgres";

async function main() {
  const clientOptions: ClientOptions = {
    hostname: getRequiredEnv("DB_HOST"),
    port: getRequiredNumEnv("DB_PORT"),
    database: getRequiredEnv("DB_NAME"),
    user: getRequiredEnv("DB_APP_USER"),
    password: getRequiredEnv("DB_APP_PASSWORD"),
  };
  
  const client = new Client(clientOptions);

  await client.connect();

  {
    const result = await client.queryObject("SELECT * FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'");
    console.log(result.rows);
  }

  await client.end();
}

function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (value === undefined || value.trim() === "")
    throw new Error(`必須環境変数 ${name} が設定されていません。`);
  return value;
}

function getRequiredNumEnv(name: string): string {
  const value = getRequiredEnv(name);
  if (Number.isNaN(+value))
    throw new Error(`環境変数 ${name} の値が数値ではありません: ${value}`);
  return value;
}

main();