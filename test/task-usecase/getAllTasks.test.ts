import { assertEquals } from "@std/assert/equals";
import { createDependencies } from "../../deps/CompositionRoot.ts";

Deno.test("登録している、削除されているもの以外のすべてのタスクを取得できる", async () => {
  const deps = createDependencies("in-memory");

  // Given
  const task0 = await deps.createTaskUseCase.execute({
    title: "task0",
    status: "unstarted",
    due: null
  });
  
  const task1 = await deps.createTaskUseCase.execute({
    title: "task1",
    status: "in-progress",
    due: null
  });
  
  const task2 = await deps.createTaskUseCase.execute({
    title: "task2",
    status: "completed",
    due: null
  });
  
  const task3 = await deps.createTaskUseCase.execute({
    title: "task3",
    status: "cancelled",
    due: null
  });
  
  const task4 = await deps.createTaskUseCase.execute({
    title: "task4",
    status: "unstarted",
    due: null
  });
  
  const task5 = await deps.createTaskUseCase.execute({
    title: "task5",
    status: "in-progress",
    due: null
  });
  
  const task6 = await deps.createTaskUseCase.execute({
    title: "task6",
    status: "completed",
    due: null
  });
  
  const task7 = await deps.createTaskUseCase.execute({
    title: "task7",
    status: "cancelled",
    due: null
  });

  await deps.deleteTaskUseCase.execute({ id: task1.id });
  await deps.deleteTaskUseCase.execute({ id: task3.id });
  await deps.deleteTaskUseCase.execute({ id: task4.id });
  await deps.deleteTaskUseCase.execute({ id: task6.id });

  // When
  const tasks = await deps.getAllTasks.execute();

  // Then
  assertEquals(tasks.length, 4);
  assertEquals(tasks.filter(task => task.title === "task0"), 1);
  assertEquals(tasks.filter(task => task.title === "task1"), 0);
  assertEquals(tasks.filter(task => task.title === "task2"), 1);
  assertEquals(tasks.filter(task => task.title === "task3"), 0);
  assertEquals(tasks.filter(task => task.title === "task4"), 0);
  assertEquals(tasks.filter(task => task.title === "task5"), 1);
  assertEquals(tasks.filter(task => task.title === "task6"), 0);
  assertEquals(tasks.filter(task => task.title === "task7"), 1);
});