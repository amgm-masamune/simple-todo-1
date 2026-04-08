import { assertEquals } from "@std/assert/equals";
import { assert, assertRejects, assertThrows } from "@std/assert";
import { createDependencies } from "../../composition-root/CompositionRoot.ts";

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
  assert(
    (task.createdAt.getTime() >= now.getTime()) 
      && (task.createdAt.getTime() <= now.getTime() + 3000));
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
  const originalUns = await taskService.createUnstarted({
    title: "unstarted task",
    due: null
  });
  
  
  const originalCmp = await taskService.createCompleted({
    title: "completed task",
    due: null,
    startedAt: null,
    completedAt: null
  });
  
  const originalInp = await taskService.createInProgress({
    title: "in-progress task",
    due: null,
    startedAt: null
  });

  const originalCan = await taskService.createCancelled({
    title: "cancelled task",
    due: null,
    startedAt: null,
    completedAt: null,
    cancelledAt: null
  });

  // When
  const tasks = await taskService.searchNotCompleted();

  // Then
  assertEquals(tasks.length, 2);
  assertEquals(tasks[0].title, originalUns.title);
  assertEquals(tasks[0].due, originalInp.due);
});

Deno.test("タスクの更新", async () => {
  const { taskService } = createDependencies("in-memory");

  // Given
  const original = await taskService.createUnstarted({
    title: "task",
    due: null
  });

  // When
  // TODO: 更新日時の挿入は TaskService の領域？
  const now = new Date(Date.now());
  await taskService.update(original.toDueChanged(new Date("2026-10-01T00:00:00Z"), now));

  // Then
  const task = await taskService.findById(original.id);
  assertEquals(task.title, original.title);
  assertEquals(task.due?.getTime(), new Date("2026-10-01T00:00:00Z").getTime());
  assert(task.updatedAt.getTime() <= now.getTime() + 3000);
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
  await assertRejects(async () => {
    await taskService.findById(original.id);
  });
});
