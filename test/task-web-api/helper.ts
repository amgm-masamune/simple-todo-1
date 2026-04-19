import { Hono } from "hono";
import { Clock } from "../../common/Clock.ts";
import { createDependencies } from "../../deps/CompositionRoot.ts";
import { createHandlers } from "../../feature/Task/handler/web-api/handler.ts";

export const TASK_ID = "task-id"
export const DATE_1 = new Date("2026-04-01T00:00:00Z");
export const DATE_2 = new Date("2026-04-02T00:00:00Z");
export const DATE_3 = new Date("2026-04-03T00:00:00Z");
export const DATE_4 = new Date("2026-04-04T00:00:00Z");
export const DATE_5 = new Date("2026-04-05T00:00:00Z");
export const DATE_6 = new Date("2026-04-06T00:00:00Z");
export const DATE_1_STR = DATE_1.toISOString();
export const DATE_2_STR = DATE_2.toISOString();
export const DATE_3_STR = DATE_3.toISOString();
export const DATE_4_STR = DATE_4.toISOString();
export const DATE_5_STR = DATE_5.toISOString();
export const DATE_6_STR = DATE_6.toISOString();

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