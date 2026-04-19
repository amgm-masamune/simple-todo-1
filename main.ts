import { Hono } from "hono";

const app = new Hono();

app.get("/", c => {
  console.log("requested:", c);
  return c.text("Hello, Hono!");
});

Deno.serve({ port: 8080 }, app.fetch);
