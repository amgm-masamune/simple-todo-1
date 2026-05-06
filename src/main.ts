import { Hono } from "hono";
import { createHandlers } from "@feature/Task/handler/web-api/handler.ts";
import { createDependencies } from "@deps/CompositionRoot.ts";

async function main() {
  const app = new Hono();
  
  await using deps = await createDependencies("pg-drizzle");
  createHandlers(app, deps);
  
  const port = Number(Deno.env.get("DENO_PORT") ?? 80);
  const server = Deno.serve({ port }, app.fetch);

  await server.finished
}

await main();