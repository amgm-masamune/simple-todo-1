import { assertEquals } from "@std/assert";
import { createDependencies } from "../../deps/CompositionRoot.ts";
import { NOT_SPECIFIED } from "../../feature/Task/domain/Task.ts";

Deno.test("未完了タスクのみを取得できる", async () => {
  const deps = createDependencies("in-memory");

  // Given
  const originalUns = await deps.createTaskUseCase.execute({
    title: "unstarted task",
    status: "unstarted",
    due: NOT_SPECIFIED
  });
  
  const _originalCmp = await deps.createTaskUseCase.execute({
    title: "completed task",
    status: "completed",
    due: NOT_SPECIFIED,
    startedAt: NOT_SPECIFIED,
    completedAt: NOT_SPECIFIED
  });
  
  const _originalInp = await deps.createTaskUseCase.execute({
    title: "in-progress task",
    status: "in-progress",
    due: NOT_SPECIFIED,
    startedAt: NOT_SPECIFIED
  });

  const _originalCan = await deps.createTaskUseCase.execute({
    title: "cancelled task",
    status: "cancelled",
    due: NOT_SPECIFIED,
    startedAt: NOT_SPECIFIED,
    completedAt: NOT_SPECIFIED,
    cancelledAt: NOT_SPECIFIED
  });

  // When
  const tasks = await deps.searchTasksByStatusUseCase.execute({ status: "unstarted" });

  // Then
  assertEquals(tasks.length, 1);
  assertEquals(tasks[0].id, originalUns.id);
});

Deno.test("進行中タスクのみを取得できる", async () => {
  const deps = createDependencies("in-memory");

  // Given
  const _originalUns = await deps.createTaskUseCase.execute({
    title: "unstarted task",
    status: "unstarted",
    due: NOT_SPECIFIED
  });
  
  const _originalCmp = await deps.createTaskUseCase.execute({
    title: "completed task",
    status: "completed",
    due: NOT_SPECIFIED,
    startedAt: NOT_SPECIFIED,
    completedAt: NOT_SPECIFIED
  });
  
  const originalInp = await deps.createTaskUseCase.execute({
    title: "in-progress task",
    status: "in-progress",
    due: NOT_SPECIFIED,
    startedAt: NOT_SPECIFIED
  });

  const _originalCan = await deps.createTaskUseCase.execute({
    title: "cancelled task",
    status: "cancelled",
    due: NOT_SPECIFIED,
    startedAt: NOT_SPECIFIED,
    completedAt: NOT_SPECIFIED,
    cancelledAt: NOT_SPECIFIED
  });

  // When
  const tasks = await deps.searchTasksByStatusUseCase.execute({ status: "in-progress" });

  // Then
  assertEquals(tasks.length, 1);
  assertEquals(tasks[0].id, originalInp.id);
});


Deno.test("完了タスクのみを取得できる", async () => {
  const deps = createDependencies("in-memory");

  // Given
  const _originalUns = await deps.createTaskUseCase.execute({
    title: "unstarted task",
    status: "unstarted",
    due: NOT_SPECIFIED
  });
  
  const originalCmp = await deps.createTaskUseCase.execute({
    title: "completed task",
    status: "completed",
    due: NOT_SPECIFIED,
    startedAt: NOT_SPECIFIED,
    completedAt: NOT_SPECIFIED
  });
  
  const _originalInp = await deps.createTaskUseCase.execute({
    title: "in-progress task",
    status: "in-progress",
    due: NOT_SPECIFIED,
    startedAt: NOT_SPECIFIED
  });

  const _originalCan = await deps.createTaskUseCase.execute({
    title: "cancelled task",
    status: "cancelled",
    due: NOT_SPECIFIED,
    startedAt: NOT_SPECIFIED,
    completedAt: NOT_SPECIFIED,
    cancelledAt: NOT_SPECIFIED
  });

  // When
  const tasks = await deps.searchTasksByStatusUseCase.execute({ status: "completed" });

  // Then
  assertEquals(tasks.length, 1);
  assertEquals(tasks[0].id, originalCmp.id);
});

Deno.test("キャンセル済みタスクのみを取得できる", async () => {
  const deps = createDependencies("in-memory");

  // Given
  const _originalUns = await deps.createTaskUseCase.execute({
    title: "unstarted task",
    status: "unstarted",
    due: NOT_SPECIFIED
  });
  
  const _originalCmp = await deps.createTaskUseCase.execute({
    title: "completed task",
    status: "completed",
    due: NOT_SPECIFIED,
    startedAt: NOT_SPECIFIED,
    completedAt: NOT_SPECIFIED
  });
  
  const _originalInp = await deps.createTaskUseCase.execute({
    title: "in-progress task",
    status: "in-progress",
    due: NOT_SPECIFIED,
    startedAt: NOT_SPECIFIED
  });

  const originalCan = await deps.createTaskUseCase.execute({
    title: "cancelled task",
    status: "cancelled",
    due: NOT_SPECIFIED,
    startedAt: NOT_SPECIFIED,
    completedAt: NOT_SPECIFIED,
    cancelledAt: NOT_SPECIFIED
  });

  // When
  const tasks = await deps.searchTasksByStatusUseCase.execute({ status: "cancelled" });

  // Then
  assertEquals(tasks.length, 1);
  assertEquals(tasks[0].id, originalCan.id);
});


Deno.test("更新があっても更新後の状態で取得できる", async () => {
  // Given
  const deps = createDependencies("in-memory");
  
  // 1つ目、未着手タスク作成
  const task1 = await deps.createTaskUseCase.execute({ title: "task1", status: "unstarted", due: NOT_SPECIFIED });
  
  // 2つ目、進行中タスク作成
  const _task2 = await deps.createTaskUseCase.execute({ title: "task2", status: "in-progress", due: NOT_SPECIFIED, startedAt: NOT_SPECIFIED });
  
  // 3つ目、完了タスク作成
  const task3 = await deps.createTaskUseCase.execute({ title: "task3", status: "completed", due: NOT_SPECIFIED, startedAt: NOT_SPECIFIED, completedAt: NOT_SPECIFIED });
  
  // 4つ目、キャンセルタスク作成
  const _task4 = await deps.createTaskUseCase.execute({ title: "task4", status: "cancelled", due: NOT_SPECIFIED, startedAt: NOT_SPECIFIED, completedAt: NOT_SPECIFIED, cancelledAt: NOT_SPECIFIED });
  
  // When

  // 1つ目、未着手タスクの編集（完了に変更）
  await deps.updateTaskUseCase.execute({ id: task1.id, status: "completed", startedAt: NOT_SPECIFIED, completedAt: NOT_SPECIFIED });
  // 3つ目、完了タスクの編集（未着手に変更）
  await deps.updateTaskUseCase.execute({ id: task3.id, status: "unstarted" });

  // Then
  const activeTasks = await deps.searchTasksByStatusUseCase.execute({ status: "unstarted" });

  assertEquals(activeTasks.length, 1);
  assertEquals(activeTasks[0].title, task3.title);
});
