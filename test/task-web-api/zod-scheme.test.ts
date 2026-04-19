import { assertEquals } from "@std/assert";
import z from "zod";


const DATE_STR_1 = "2026-04-01T00:00:00Z";
const DATE_STR_2 = "2026-04-02T00:00:00Z";

Deno.test("Zodスキーマが基本的な入力値を受け入れられる", () => {
  const CreateTaskInputSchema = z.object({
    title: z.string(),
    status: z.union([z.literal("unstarted"), z.literal("in-progress"), z.literal("completed"), z.literal("cancelled")]),
    due: z.string().nullable(),
    startedAt: z.string().nullable().optional(),
    completedAt: z.string().nullable().optional(),
    cancelledAt: z.string().nullable().optional()
  });

  const createTaskInput = {
    title: "test",
    status: "completed",
    due: DATE_STR_1,
    startedAt: null,
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