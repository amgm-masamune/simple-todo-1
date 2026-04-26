import { Hono } from "hono";
import { createHandlers } from "@feature/Task/handler/web-api/handler.ts";
import { createDependencies } from "@deps/CompositionRoot.ts";

function main() {
  const app = new Hono();
  
  const deps = createDependencies("in-memory");
  createHandlers(app, deps);
  
  const port = Number(Deno.env.get("DENO_PORT") ?? 80);
  Deno.serve({ port }, app.fetch);
}

main();