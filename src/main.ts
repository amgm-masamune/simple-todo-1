import { Hono } from "hono";
import { createHandlers } from "./feature/Task/handler/web-api/handler.ts";
import { createDependencies } from "./deps/CompositionRoot.ts";

function main() {
  const app = new Hono();
  
  const deps = createDependencies("in-memory");
  createHandlers(app, deps);
  
  Deno.serve({ port: 8080 }, app.fetch);
}

main();