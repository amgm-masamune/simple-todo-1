import { assertEquals } from "@std/assert";
import { createDependencies } from "../../src/deps/CompositionRoot.ts";
import { UNSPECIFIED } from "../../src/feature/Task/domain/Task.ts";

Deno.test("登録している、削除されているもの以外のすべてのタスクを取得できる", async () => {
  const deps = createDependencies("in-memory");

  // Given
  const _task0 = await deps.createTaskUseCase.execute({
    title: "task0",
    status: "unstarted",
    due: UNSPECIFIED
  });
  
  const task1 = await deps.createTaskUseCase.execute({
    title: "task1",
    status: "in-progress",
    due: UNSPECIFIED, startedAt: UNSPECIFIED
  });
  
  const _task2 = await deps.createTaskUseCase.execute({
    title: "task2",
    status: "completed",
    due: UNSPECIFIED, startedAt: UNSPECIFIED, completedAt: UNSPECIFIED
  });
  
  const task3 = await deps.createTaskUseCase.execute({
    title: "task3",
    status: "cancelled",
    due: UNSPECIFIED, startedAt: UNSPECIFIED, completedAt: UNSPECIFIED, cancelledAt: UNSPECIFIED
  });
  
  const task4 = await deps.createTaskUseCase.execute({
    title: "task4",
    status: "unstarted",
    due: UNSPECIFIED
  });
  
  const _task5 = await deps.createTaskUseCase.execute({
    title: "task5",
    status: "in-progress",
    due: UNSPECIFIED, startedAt: UNSPECIFIED
  });
  
  const task6 = await deps.createTaskUseCase.execute({
    title: "task6",
    status: "completed",
    due: UNSPECIFIED, startedAt: UNSPECIFIED, completedAt: UNSPECIFIED
  });
  
  const _task7 = await deps.createTaskUseCase.execute({
    title: "task7",
    status: "cancelled",
    due: UNSPECIFIED, startedAt: UNSPECIFIED, completedAt: UNSPECIFIED, cancelledAt: UNSPECIFIED
  });

  await deps.deleteTaskUseCase.execute({ id: task1.id });
  await deps.deleteTaskUseCase.execute({ id: task3.id });
  await deps.deleteTaskUseCase.execute({ id: task4.id });
  await deps.deleteTaskUseCase.execute({ id: task6.id });

  // When
  const tasks = await deps.getAllTasksUseCase.execute();

  // Then
  assertEquals(tasks.length, 4);
  assertEquals(tasks.filter(task => task.title === "task0").length, 1);
  assertEquals(tasks.filter(task => task.title === "task1").length, 0);
  assertEquals(tasks.filter(task => task.title === "task2").length, 1);
  assertEquals(tasks.filter(task => task.title === "task3").length, 0);
  assertEquals(tasks.filter(task => task.title === "task4").length, 0);
  assertEquals(tasks.filter(task => task.title === "task5").length, 1);
  assertEquals(tasks.filter(task => task.title === "task6").length, 0);
  assertEquals(tasks.filter(task => task.title === "task7").length, 1);
});


Deno.test("取得できるタスクが無いと空配列が返る", async () => {
  const deps = createDependencies("in-memory");

  // Given
  const task0 = await deps.createTaskUseCase.execute({
    title: "task0",
    status: "unstarted",
    due: UNSPECIFIED
  });

  await deps.deleteTaskUseCase.execute({ id: task0.id });

  // When
  const tasks = await deps.getAllTasksUseCase.execute();

  // Then
  assertEquals(tasks.length, 0);
});