// http://github.com/denodrivers/postgres

// コンテナ同士の接続で一時的に利用するため
// deno-lint-ignore no-import-prefix no-unversioned-import
import { Client, ClientOptions } from "jsr:@db/postgres";

const clientOptions: ClientOptions = {
  hostname: Deno.env.get("DB_HOST"),
  port: Deno.env.get("DB_PORT"),
  database: Deno.env.get("DB_NAME"),
  user: Deno.env.get("DB_APP_USER"),
  password: Deno.env.get("DB_APP_PASSWORD"),
};

console.log(clientOptions);

const client = new Client(clientOptions);

await client.connect();

{
  const result = await client.queryObject("SELECT * FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'");
  console.log(result.rows);
}

await client.end();