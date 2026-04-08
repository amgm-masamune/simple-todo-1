import { assertEquals } from "@std/assert/equals";
import { Task } from "../../domain/Task/Task.ts";
import { assertThrows } from "@std/assert/throws";

const TASK_ID = "1";

// タイトルの編集

Deno.test("タスクはタイトルを変更できる", () => {
  // Given: 作成済みタスク
  const task = new Task.Unstarted({
    id: TASK_ID,
    title: "test1",
    due: null,
    createdAt: new Date("2026-04-01T00:00:00Z")
  });

  // When: タイトルを変更する
  const now = new Date("2026-05-01T00:00:00Z");
  const updatedTask = task.toTitleChanged("test2", now);

  // Then: タスク名が更新されていること
  assertEquals(updatedTask.title, "test2");
});

Deno.test("0文字のタイトルを許容", () => {
  const task = new Task.Unstarted({
    id: TASK_ID,
    title: "test1",
    due: null,
    createdAt: new Date("2026-04-01T00:00:00Z")
  });

  const now = new Date("2026-05-01T00:00:00Z");
  const updatedTask = task.toTitleChanged("", now);

  assertEquals(updatedTask.title, "");
});

Deno.test("255文字のタイトルを許容", () => {
  // 理由: 少し長め（100文字以上）のタイトルを付けたい時があるため

  // Given:
  const task = new Task.Unstarted({
    id: TASK_ID,
    title: "test1",
    due: null,
    createdAt: new Date("2026-04-01T00:00:00Z")
  });

  // When:
  const now = new Date("2026-05-01T00:00:00Z");
  const updatedTask = task.toTitleChanged("a".repeat(255), now);

  // Then:
  assertEquals(updatedTask.title, "a".repeat(255));
});

Deno.test("256文字のタイトルを許容", () => {
  const task = new Task.Unstarted({
    id: TASK_ID,
    title: "test1",
    due: null,
    createdAt: new Date("2026-04-01T00:00:00Z")
  });

  assertThrows(() => {
    const now = new Date("2026-05-01T00:00:00Z");
    task.toTitleChanged("a".repeat(256), now);
  });
});

// 期限の編集

Deno.test("期限の変更を許容", () => {
  const task = new Task.Unstarted({
    id: TASK_ID,
    title: "test1",
    due: new Date("2026-10-01T00:00:00Z"),
    createdAt: new Date("2026-04-01T00:00:00Z")
  }); 

  const now = new Date("2026-05-01T00:00:00Z");
  const updatedTask = task.toDueChanged(new Date("2026-11-01T00:00:00Z"), now);

  assertEquals(updatedTask.due!.getTime(), new Date("2026-11-01T00:00:00Z").getTime());
});

Deno.test("期限なしへの変更を許容", () => {
  const task = new Task.Unstarted({
    id: TASK_ID,
    title: "test1",
    due: new Date("2026-10-01T00:00:00Z"),
    createdAt: new Date("2026-04-01T00:00:00Z")
  });

  const now = new Date("2026-05-01T00:00:00Z");
  const updatedTask = task.toDueChanged(null, now);

  assertEquals(updatedTask.due, null);
});

Deno.test("期限ありへの変更を許容", () => {
  const task = new Task.Unstarted({
    id: TASK_ID,
    title: "test1",
    due: new Date("2026-10-01T00:00:00Z"),
    createdAt: new Date("2026-04-01T00:00:00Z")
  });

  const now = new Date("2026-05-01T00:00:00Z");
  const updatedTask = task.toDueChanged(new Date("2026-10-01T00:00:00Z"), now);

  assertEquals(updatedTask.due!.getTime(), new Date("2026-10-01T00:00:00Z").getTime());
});

// 開始日時の編集

Deno.test("開始日時の編集を許容", () => {
  const task = new Task.InProgress({
    id: TASK_ID,
    title: "test1",
    due: new Date("2026-10-01T00:00:00Z"),
    startedAt: new Date("2026-05-01T00:00:00Z"),
    createdAt: new Date("2026-04-01T00:00:00Z")
  });

  const now = new Date("2026-05-01T00:00:00Z");
  const updatedTask = task.toStartedAtChanged(new Date("2026-06-01T00:00:00Z"), now);

  assertEquals(updatedTask.startedAt!.getTime(), new Date("2026-06-01T00:00:00Z").getTime());
});

// 完了日時の編集

Deno.test("完了日時の編集を許容", () => {
  const task = new Task.Completed({
    id: TASK_ID,
    title: "test1",
    due: new Date("2026-10-01T00:00:00Z"),
    startedAt: new Date("2026-05-01T00:00:00Z"),
    completedAt: new Date("2026-06-01T00:00:00Z"),
    createdAt: new Date("2026-04-01T00:00:00Z")
  });

  const now = new Date("2026-05-01T00:00:00Z");
  const updatedTask = task.toStartedAtChanged(new Date("2026-06-01T00:00:00Z"), now);

  assertEquals(updatedTask.startedAt!.getTime(), new Date("2026-06-01T00:00:00Z").getTime());
});