import { assertEquals } from "@std/assert";
import z from "zod";
import { NOT_SPECIFIED } from "../../feature/Task/domain/Task.ts";


const DATE_STR_1 = "2026-04-01T00:00:00Z";
const DATE_STR_2 = "2026-04-02T00:00:00Z";

Deno.test("Zodスキーマが基本的な入力値を受け入れられる", () => {
  const CreateTaskInputSchema = z.object({
    title: z.string(),
    status: z.union([z.literal("unstarted"), z.literal("in-progress"), z.literal("completed"), z.literal("cancelled")]),
    due: z.union([z.string(), notSpecifiedSchema]),
    startedAt: z.union([z.string(), notSpecifiedSchema]).optional(),
    completedAt: z.union([z.string(), notSpecifiedSchema]).optional(),
    cancelledAt: z.union([z.string(), notSpecifiedSchema]).optional()
  });

  const createTaskInput = {
    title: "test",
    status: "completed",
    due: DATE_STR_1,
    startedAt: NOT_SPECIFIED,
    completedAt: DATE_STR_2
  };

  try {
    const res = CreateTaskInputSchema.parse(createTaskInput);
    assertEquals(res.status, "completed");
  } catch (e) {
    console.log(e);
    throw e;
  }

});