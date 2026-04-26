import { assert, assertEquals } from "@std/assert";
import z from "zod";
import { UNSPECIFIED } from "@feature/Task/domain/Task.ts";
import { unspecifiedSchema } from "@feature/Task/handler/web-api/TaskDto.ts";


const DATE_STR_1 = "2026-04-01T00:00:00Z";
const DATE_STR_2 = "2026-04-02T00:00:00Z";

Deno.test("Zodスキーマが基本的な入力値を受け入れられる", () => {
  const CreateTaskInputSchema = z.object({
    title: z.string(),
    status: z.union([z.literal("unstarted"), z.literal("in-progress"), z.literal("completed"), z.literal("cancelled")]),
    due: z.union([z.string(), unspecifiedSchema]),
    startedAt: z.union([z.string(), unspecifiedSchema]).optional(),
    completedAt: z.union([z.string(), unspecifiedSchema]).optional(),
    cancelledAt: z.union([z.string(), unspecifiedSchema]).optional()
  });

  const createTaskInput = {
    title: "test",
    status: "completed",
    due: DATE_STR_1,
    startedAt: UNSPECIFIED,
    completedAt: DATE_STR_2
  };

  const res = CreateTaskInputSchema.parse(createTaskInput);
  assertEquals(res.status, "completed");
});

Deno.test("スキーマに定義されていないプロパティは含まれない", () => {
  const schema = z.object({
    prop1: z.string(),
    prop2: z.string().optional()
  });

  const res = schema.parse({
    prop1: "prop1",
    prop2: "prop2",
    prop3: "prop3",
  });

  assert(!("prop3" in res));
  // deno-lint-ignore no-explicit-any
  assertEquals((res as (any)).prop3, undefined);
})