import { assertEquals, assertRejects } from "@std/assert";
import { createDependencies } from "../../deps/CompositionRoot.ts";
import { NOT_SPECIFIED } from "../../feature/Task/domain/Task.ts";

Deno.test("タスクをIDで取得できる", async () => {
  const { createTaskUseCase, findTaskByIdUseCase } = createDependencies("in-memory");

  // Given
  // ダミーで1つ登録しておく
  await createTaskUseCase.execute({
    title: "dummy",
    status: "unstarted",
    due: NOT_SPECIFIED
  });

  const original = await createTaskUseCase.execute({
    title: "task",
    status: "unstarted",
    due: NOT_SPECIFIED
  });

  // When
  const task = await findTaskByIdUseCase.execute({ id: original.id });

  // Then
  assertEquals(task.title, original.title);
  assertEquals(task.due, original.due);
});

Deno.test("存在しないIDを指定するとエラーになる", async () => {
  const { createTaskUseCase, findTaskByIdUseCase } = createDependencies("in-memory");

  // Given
  // ダミーで1つ登録しておく
  await createTaskUseCase.execute({
    title: "dummy",
    status: "unstarted",
    due: NOT_SPECIFIED
  });

  // When・Then
  await assertRejects(() => 
    findTaskByIdUseCase.execute({ id: "Invalid ID" })
  );
});
