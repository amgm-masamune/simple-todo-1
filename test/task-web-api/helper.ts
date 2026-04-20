import { Hono } from "hono";
import { Clock } from "../../common/Clock.ts";
import { createDependencies } from "../../deps/CompositionRoot.ts";
import { createHandlers } from "../../feature/Task/handler/web-api/handler.ts";

export function setup(options?: { clock: Clock; }) {
  const app = new Hono();
  const deps = createDependencies("in-memory", options);

  createHandlers(app, deps);

  return app;
}

export function requestJson(app: Hono, path: string, method: string, body?: unknown) {
  return app.request(`http://localhost${path}`, { 
    method: method.toUpperCase(),
    headers: {
      "Content-Type": "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
}