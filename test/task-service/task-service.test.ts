import { assertEquals } from "@std/assert/equals";
import { assert, assertRejects } from "@std/assert";
import { createDependencies } from "../../composition-root/CompositionRoot.ts";

const fixedClock = (fixedNow: Date) => ({
  now: () => fixedNow,
});

Deno.test("タスクを新規作成する", async () => {
  const { createTaskUseCase, findTaskByIdUseCase } = createDependencies("in-memory");

  // Given
  const now = new Date(Date.now());

  // When
  const created = await createTaskUseCase.execute({
    title: "task",
    status: "unstarted",
    due: new Date("2026-10-01T00:00:00Z"),
  });

  // Then
  const task = await findTaskByIdUseCase.execute({ id: created.id });

  assertEquals(task.title, "task");
  // 作り始めてから3秒以内に作成されていること
  assert(
    (task.createdAt.getTime() >= now.getTime()) 
      && (task.createdAt.getTime() <= now.getTime() + 3000));
});

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

Deno.test("未完了タスクを検索する", async () => {
  const { createTaskUseCase, searchActiveTasksUseCase } = createDependencies("in-memory");

  // Given
  const originalUns = await createTaskUseCase.execute({
    title: "unstarted task",
    status: "unstarted",
    due: null
  });
  
  
  const originalCmp = await createTaskUseCase.execute({
    title: "completed task",
    status: "completed",
    due: null,
    startedAt: null,
    completedAt: null
  });
  
  const originalInp = await createTaskUseCase.execute({
    title: "in-progress task",
    status: "in-progress",
    due: null,
    startedAt: null
  });

  const originalCan = await createTaskUseCase.execute({
    title: "cancelled task",
    status: "cancelled",
    due: null,
    startedAt: null,
    completedAt: null,
    cancelledAt: null
  });

  // When
  const tasks = await searchActiveTasksUseCase.execute();

  // Then
  assertEquals(tasks.length, 2);
  assertEquals(tasks[0].title, originalUns.title);
  assertEquals(tasks[0].due, originalInp.due);
});

Deno.test("タスクの更新", async () => {
  const expectedUpdatedAt = new Date("2026-12-31T12:00:00Z");
  const { 
    createTaskUseCase,
    updateTaskUseCase,
    findTaskByIdUseCase
   } = createDependencies("in-memory", { clock: fixedClock(expectedUpdatedAt) });

  // Given
  const original = await createTaskUseCase.execute({
    title: "task",
    status: "unstarted",
    due: null
  });

  // When
  // TODO: 更新日時の挿入は TaskService の領域？
  const now = new Date(Date.now());
  await updateTaskUseCase.execute({ id: original.id, due: new Date("2026-10-01T00:00:00Z") });

  // Then
  const task = await findTaskByIdUseCase.execute({ id: original.id });
  assertEquals(task.title, original.title);
  assertEquals(task.due?.getTime(), new Date("2026-10-01T00:00:00Z").getTime());
  assertEquals(task.updatedAt.getTime(), expectedUpdatedAt.getTime());
});

Deno.test("タスクの削除", async () => {
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

Deno.test("タスクの期限の日時が不正な文字列のタスクは作成できない", async () => {
  const { createTaskUseCase } = createDependencies("in-memory");
  await assertRejects(() => createTaskUseCase.execute({ 
    title: "task",
    status: "unstarted",
    due: new Date("Invalid Date")
  }));
});

Deno.test("タスクの開始の日時が不正な文字列のタスクは作成できない", async () => {
  const { createTaskUseCase } = createDependencies("in-memory");
  await assertRejects(() => createTaskUseCase.execute({
    title: "task",
    status: "in-progress",
    due: null,
    startedAt: new Date("Invalid Date")
  }));
});

Deno.test("タスクの完了の日時が不正な文字列のタスクは作成できない", async () => {
  const { createTaskUseCase } = createDependencies("in-memory");
  await assertRejects(() => createTaskUseCase.execute({ 
    title: "task", 
    status: "completed",
    due: null, 
    startedAt: null, 
    completedAt: new Date("Invalid Date")
  }));
});

Deno.test("タスクのキャンセルの日時が不正な文字列のタスクは作成できない", async () => {
  const { createTaskUseCase } = createDependencies("in-memory");
  await assertRejects(() => 
    createTaskUseCase.execute({ 
      title: "task", 
      status: "cancelled",
      due: null,
      startedAt: null,
      completedAt: null,
      cancelledAt: new Date("Invalid Date")
    })
  );
});

Deno.test("未着手→進行中 の状態変更で startedAt を指定すると、その値で進行中になる。", async () => {
  const expectedUpdatedAt = new Date("2027-04-01T00:00:00Z");
  const { createTaskUseCase, updateTaskUseCase } = createDependencies("in-memory", { clock: fixedClock(expectedUpdatedAt) });
  
  // Given
  const unstartedTask = await createTaskUseCase.execute({ title: "task", status: "unstarted", due: null });

  // When
  const updated = await updateTaskUseCase.execute({ id: unstartedTask.id, status: "in-progress", startedAt: new Date("2026-05-01T00:00:00Z") });

  // Then
  assertEquals(updated.status, "in-progress");
  assertEquals(updated.startedAt?.getTime(), new Date("2026-05-01T00:00:00Z").getTime());
});

Deno.test("未着手→進行中 の状態変更で、startedAt の指定がない(null指定もない)場合は変更できない", async () => {
  const expectedUpdatedAt = new Date("2027-04-01T00:00:00Z");
  const { createTaskUseCase, updateTaskUseCase } = createDependencies("in-memory", { clock: fixedClock(expectedUpdatedAt) });
  
  /// Given
  const task = await createTaskUseCase.execute({ title: "task", status: "unstarted", due: null });

  // When・Then
  await assertRejects(() => 
    updateTaskUseCase.execute({ id: task.id, status: "in-progress" })
  );
});

Deno.test("進行中→完了 の状態変更で startedAt を指定しないと更新されない(nullにはならない)", async () => {
  const expectedUpdatedAt = new Date("2027-04-01T00:00:00Z");
  const { createTaskUseCase, updateTaskUseCase } = createDependencies("in-memory", { clock: fixedClock(expectedUpdatedAt) });
  
  // Given
  const inProgressTask = await createTaskUseCase.execute({ title: "task", status: "in-progress", due: null, startedAt: new Date("2026-05-01T00:00:00Z") });

  // When
  const updated = await updateTaskUseCase.execute({ id: inProgressTask.id, status: "completed", completedAt: null });

  // Then
  assertEquals(updated.status, "completed");
  assertEquals(updated.startedAt?.getTime(), inProgressTask.startedAt?.getTime());
});

Deno.test("完了→進行中 の状態変更で startedAt を指定しないと変更されない", async () => {
  const expectedUpdatedAt = new Date("2027-04-01T00:00:00Z");
  const { createTaskUseCase, updateTaskUseCase } = createDependencies("in-memory", { clock: fixedClock(expectedUpdatedAt) });
  
  // Given
  const inProgressTask = await createTaskUseCase.execute({ title: "task", status: "completed", due: null, startedAt: new Date("2026-05-01T00:00:00Z"), completedAt: new Date("2026-06-01T00:00:00Z") });

  // When
  const updated = await updateTaskUseCase.execute({ id: inProgressTask.id, status: "in-progress" });

  // Then
  assertEquals(updated.status, "in-progress");
  assertEquals(updated.startedAt?.getTime(), inProgressTask.startedAt?.getTime());
});

Deno.test("searchActiveTasks では、更新があっても最新の状態の未完了・進行中のタスクを取得する", async () => {
  const expectedUpdatedAt = new Date("2027-04-01T00:00:00Z");
  const { 
    createTaskUseCase,
    searchActiveTasksUseCase,
    updateTaskUseCase
  } = createDependencies("in-memory", { clock: fixedClock(expectedUpdatedAt) });
  
  // 1つ目、未着手タスク作成
  const task1 = await createTaskUseCase.execute({ title: "task1", status: "unstarted", due: null });
  
  assertEquals((await searchActiveTasksUseCase.execute()).length, 1);
  assertEquals(task1.title, "task1");
  assertEquals(task1.due, null);

  // 2つ目、進行中タスク作成
  const _task2 = await createTaskUseCase.execute({ title: "task2", status: "in-progress", due: null, startedAt: null });
  
  assertEquals((await searchActiveTasksUseCase.execute()).length, 2);
  

  // 3つ目、完了タスク作成
  const task3 = await createTaskUseCase.execute({ title: "task3", status: "completed", due: null, startedAt: null, completedAt: null });
  
  assertEquals((await searchActiveTasksUseCase.execute()).length, 2);  // 完了済みのためカウントされない


  // 4つ目、キャンセルタスク作成
  const _task4 = await createTaskUseCase.execute({ title: "task4", status: "cancelled", due: null, startedAt: null, completedAt: null, cancelledAt: null });
  
  assertEquals((await searchActiveTasksUseCase.execute()).length, 2);  // キャンセル済みのためカウントされない
  
  // 1つ目、未着手タスクの編集（完了に変更）
  await updateTaskUseCase.execute({ id: task1.id, status: "completed", startedAt: null, completedAt: null });

  assertEquals((await searchActiveTasksUseCase.execute()).length, 1);  // 未完了が1つ完了済みになるので減る


  // 3つ目、完了タスクの編集（未着手に変更）
  await updateTaskUseCase.execute({ id: task3.id, status: "unstarted" });

  assertEquals((await searchActiveTasksUseCase.execute()).length, 2);  // 完了済みが1つ未着手になるので増える
})