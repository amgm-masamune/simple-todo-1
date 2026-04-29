import { Hono } from "hono";
import { Clock } from "@common/Clock.ts";
import { createDependencies } from "@deps/CompositionRoot.ts";
import { createHandlers } from "@feature/Task/handler/web-api/handler.ts";
import z from "zod";

export async function setup(options?: { clock: Clock; }) {
  const app = new Hono();
  const deps = await createDependencies("in-memory", options);

  createHandlers(app, deps);

  return app;
}

export function request(app: Hono, path: string, method: string, body?: unknown) {
  return app.request(`http://localhost${path}`, { 
    method: method.toUpperCase(),
    headers: {
      "Content-Type": "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
}

export async function getSuccessValueFromResponse<S extends z.ZodType>(resp: Response, respBodySchema: S): Promise<z.infer<S>> {
  const body = respBodySchema.parse(await resp.json())
  if (body == null || typeof body !== "object" || !("success" in body) || typeof body.success !== "boolean" || !("value" in body)) 
    throw new Error("Schemaが異なります");
  if (body.success === false)
    throw new Error("エラーレスポンスです");

  return body as z.infer<S>;
}