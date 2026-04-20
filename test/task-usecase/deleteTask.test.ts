import { assertRejects } from "@std/assert";
import { createDependencies } from "../../deps/CompositionRoot.ts";
import { UNSPECIFIED } from "../../feature/Task/domain/Task.ts";

Deno.test("存在するIDを指定するとエラーなく削除でき、IDでタスクを取得できなくなる", async () => {
  const { createTaskUseCase, deleteTaskUseCase, findTaskByIdUseCase } = createDependencies("in-memory");

  // Given
  const original = await createTaskUseCase.execute({
    title: "task",
    status: "unstarted",
    due: UNSPECIFIED
  });

  // When
  await deleteTaskUseCase.execute({ id: original.id });

  // Then
  await assertRejects(async () => {
    await findTaskByIdUseCase.execute({ id: original.id });
  });
});

Deno.test("存在しないIDを指定するとエラーが発生する", async () => {
  const { createTaskUseCase, deleteTaskUseCase } = createDependencies("in-memory");

  // Given
  await createTaskUseCase.execute({
    title: "dummy",
    status: "unstarted",
    due: UNSPECIFIED
  });

  // When・Then
  await assertRejects(() =>
    deleteTaskUseCase.execute({ id: "Invalid ID" })
  );
});