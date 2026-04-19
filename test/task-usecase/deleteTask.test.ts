import { assertRejects } from "@std/assert";
import { createDependencies } from "../../deps/CompositionRoot.ts";

Deno.test("存在するIDを指定するとエラーなく削除でき、IDでタスクを取得できなくなる", async () => {
  const { createTaskUseCase, deleteTaskUseCase, findTaskByIdUseCase } = createDependencies("in-memory");

  // Given
  const original = await createTaskUseCase.execute({
    title: "task",
    status: "unstarted",
    due: null
  });

  // When
  await deleteTaskUseCase.execute({ id: original.id });

  // Then
  await assertRejects(async () => {
    await findTaskByIdUseCase.execute({ id: original.id });
  });
});