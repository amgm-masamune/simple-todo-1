import { assertEquals, assertRejects } from "@std/assert";
import { createDependencies } from "@deps/CompositionRoot.ts";
import { UNSPECIFIED } from "@feature/Task/domain/Task.ts";
import { NotFoundError } from "@common/Error/NotFoundError/NotFoundError.ts";

Deno.test("タスクをIDで取得できる", async () => {
  const { createTaskUseCase, findTaskByIdUseCase } = await createDependencies("in-memory");

  // Given
  // ダミーで1つ登録しておく
  await createTaskUseCase.execute({
    title: "dummy",
    status: "unstarted",
    due: UNSPECIFIED
  });

  const original = await createTaskUseCase.execute({
    title: "task",
    status: "unstarted",
    due: UNSPECIFIED
  });

  // When
  const task = await findTaskByIdUseCase.execute({ id: original.id });

  // Then
  assertEquals(task.title, original.title);
  assertEquals(task.due, original.due);
});

Deno.test("存在しないIDを指定するとエラーになる", async () => {
  const { createTaskUseCase, findTaskByIdUseCase } = await createDependencies("in-memory");

  // Given
  // ダミーで1つ登録しておく
  await createTaskUseCase.execute({
    title: "dummy",
    status: "unstarted",
    due: UNSPECIFIED
  });

  // When・Then
  await assertRejects(() => 
    findTaskByIdUseCase.execute({ id: "Invalid ID" }),
    NotFoundError
  );
});
