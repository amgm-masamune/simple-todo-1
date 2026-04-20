import { assertEquals } from "@std/assert";
import { createDependencies } from "../../deps/CompositionRoot.ts";
import { UNSPECIFIED } from "../../feature/Task/domain/Task.ts";

Deno.test("未完了タスクを検索する", async () => {
  const { createTaskUseCase, searchActiveTasksUseCase } = createDependencies("in-memory");

  // Given
  const originalUns = await createTaskUseCase.execute({
    title: "unstarted task",
    status: "unstarted",
    due: UNSPECIFIED
  });
  
  const _originalCmp = await createTaskUseCase.execute({
    title: "completed task",
    status: "completed",
    due: UNSPECIFIED,
    startedAt: UNSPECIFIED,
    completedAt: UNSPECIFIED
  });
  
  const originalInp = await createTaskUseCase.execute({
    title: "in-progress task",
    status: "in-progress",
    due: UNSPECIFIED,
    startedAt: UNSPECIFIED
  });

  const _originalCan = await createTaskUseCase.execute({
    title: "cancelled task",
    status: "cancelled",
    due: UNSPECIFIED,
    startedAt: UNSPECIFIED,
    completedAt: UNSPECIFIED,
    cancelledAt: UNSPECIFIED
  });

  // When
  const tasks = await searchActiveTasksUseCase.execute();

  // Then
  assertEquals(tasks.length, 2);
  assertEquals(tasks[0].title, originalUns.title);
  assertEquals(tasks[0].due, originalInp.due);
  assertEquals(tasks[1].title, originalInp.title);
  assertEquals(tasks[1].due, originalInp.due);
});

Deno.test("searchActiveTasks では、更新があっても最新の状態の未完了・進行中のタスクを取得する", async () => {
  // Given
  const { 
    createTaskUseCase,
    searchActiveTasksUseCase,
    updateTaskUseCase
  } = createDependencies("in-memory");
  
  // 1つ目、未着手タスク作成
  const task1 = await createTaskUseCase.execute({ title: "task1", status: "unstarted", due: UNSPECIFIED });
  
  assertEquals((await searchActiveTasksUseCase.execute()).length, 1);
  assertEquals(task1.title, "task1");
  assertEquals(task1.due, UNSPECIFIED);

  // 2つ目、進行中タスク作成
  const task2 = await createTaskUseCase.execute({ title: "task2", status: "in-progress", due: UNSPECIFIED, startedAt: UNSPECIFIED });
  
  assertEquals((await searchActiveTasksUseCase.execute()).length, 2);
  

  // 3つ目、完了タスク作成
  const task3 = await createTaskUseCase.execute({ title: "task3", status: "completed", due: UNSPECIFIED, startedAt: UNSPECIFIED, completedAt: UNSPECIFIED });
  
  assertEquals((await searchActiveTasksUseCase.execute()).length, 2);  // 完了済みのためカウントされない


  // 4つ目、キャンセルタスク作成
  const _task4 = await createTaskUseCase.execute({ title: "task4", status: "cancelled", due: UNSPECIFIED, startedAt: UNSPECIFIED, completedAt: UNSPECIFIED, cancelledAt: UNSPECIFIED });
  
  assertEquals((await searchActiveTasksUseCase.execute()).length, 2);  // キャンセル済みのためカウントされない
  
  // When

  // 1つ目、未着手タスクの編集（完了に変更）
  await updateTaskUseCase.execute({ id: task1.id, status: "completed", startedAt: UNSPECIFIED, completedAt: UNSPECIFIED });
  // 3つ目、完了タスクの編集（未着手に変更）
  await updateTaskUseCase.execute({ id: task3.id, status: "unstarted" });

  // Then
  const activeTasks = await searchActiveTasksUseCase.execute();

  assertEquals(activeTasks.length, 2);
  assertEquals(activeTasks[0].title, task2.title);
  assertEquals(activeTasks[1].title, task3.title);
});
