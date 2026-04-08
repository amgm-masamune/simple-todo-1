import { assertEquals } from "@std/assert/equals";
import { assert, assertThrows } from "@std/assert";

Deno.test("タスクを新規作成する", async () => {
  const { taskService } = createDependencies("in-memory");

  // Given
  const now = new Date(Date.now());

  // When
  const created = await taskService.createUnstarted({
    title: "task",
    due: new Date("2026-10-01T00:00:00Z"),
  });

  // Then
  const task = await taskService.findById(created.id);

  assertEquals(task.title, "task");
  // 作り始めてから3秒以内に作成されていること
  assert((task.createdAt.getTime() >= now.getTime()) && (task.createdAt <= now.getTime() + 3000));
});

Deno.test("タスクをIDで取得する", async () => {
  const { taskService } = createDependencies("in-memory");

  // Given
  // ダミーで1つ登録しておく
  await taskService.createUnstarted({
    title: "dummy",
    due: null
  });

  const original = await taskService.createUnstarted({
    title: "task",
    due: null
  });

  // When
  const task = await taskService.findById(original.id);

  // Then
  assertEquals(task.title, original.title);
  assertEquals(task.due, original.due);
});

Deno.test("未完了タスクを検索する", async () => {
  const { taskService } = createDependencies("in-memory");

  // Given
  const original0 = await taskService.createUnstarted({
    title: "task0",
    due: null
  });
  
  const original1 = await taskService.createUnstarted({
    title: "task1",
    due: null
  });

  // When
  const tasks = await taskService.searchNotCompleted();

  // Then
  assertEquals(tasks.length, 2);
  assertEquals(tasks[0].title, original0.title);
  assertEquals(tasks[0].due, original1.due);
});

Deno.test("タスクの更新", async () => {
  const { taskService } = createDependencies("in-memory");

  // Given
  const original = await taskService.createUnstarted({
    title: "task",
    due: null
  });

  // When
  await taskService.updateTask(original.toDueChanged(null));

  // Then
  const task = await taskService.findById(original.id);
  assertEquals(task.title, original.title);
  assertEquals(task.due, new Date("2026-10-01T00:00:00Z"));
});

Deno.test("タスクの削除", async () => {
  const { taskService } = createDependencies("in-memory");

  // Given
  const original = await taskService.createUnstarted({
    title: "task",
    due: null
  });

  // When
  await taskService.delete(original.id);

  // Then
  assertThrows(async () => {
    await taskService.findById(original.id);
  });
});
