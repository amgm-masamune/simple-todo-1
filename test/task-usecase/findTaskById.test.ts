import { assertEquals } from "@std/assert";
import { createDependencies } from "../../deps/CompositionRoot.ts";

Deno.test("タスクをIDで取得する", async () => {
  const { createTaskUseCase, findTaskByIdUseCase } = createDependencies("in-memory");

  // Given
  // ダミーで1つ登録しておく
  await createTaskUseCase.execute({
    title: "dummy",
    status: "unstarted",
    due: null
  });

  const original = await createTaskUseCase.execute({
    title: "task",
    status: "unstarted",
    due: null
  });

  // When
  const task = await findTaskByIdUseCase.execute({ id: original.id });

  // Then
  assertEquals(task.title, original.title);
  assertEquals(task.due, original.due);
});
