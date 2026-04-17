import { assertEquals } from "@std/assert/equals";
import { Task } from "../../feature/Task/domain/Task.ts";

const TASK_ID = "1";

const DATE_1 = new Date("2026-04-01T00:00:00Z");
const DATE_2 = new Date("2026-04-02T00:00:00Z");

// タイトルの編集

Deno.test("タスクはタイトルを変更できる", () => {
  // Given: 作成済みタスク
  const task = Task.create({
    id: TASK_ID,
    status: "unstarted",
    title: "test1",
    due: null,
    createdAt: DATE_1
  });

  // When: タイトルを変更する
  const now = DATE_2;
  const updatedTask = task.withTitle("test2", now);

  // Then: タスク名が更新されていること
  assertEquals(updatedTask.title, "test2");
});

Deno.test("0文字のタイトルを許容", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "unstarted",
    title: "test1",
    due: null,
    createdAt: DATE_1
  });

  const now = DATE_2;
  const updatedTask = task.withTitle("", now);

  assertEquals(updatedTask.title, "");
});

// 期限の編集

Deno.test("期限の変更を許容", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "unstarted",
    title: "test1",
    due: new Date("2026-10-01T00:00:00Z"),
    createdAt: DATE_1
  }); 

  const now = DATE_2;
  const updatedTask = task.withDue(new Date("2026-11-01T00:00:00Z"), now);

  assertEquals(updatedTask.due!.toISOString(), new Date("2026-11-01T00:00:00Z").toISOString());
});

Deno.test("期限なしへの変更を許容", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "unstarted",
    title: "test1",
    due: new Date("2026-10-01T00:00:00Z"),
    createdAt: DATE_1
  });

  const now = DATE_2;
  const updatedTask = task.withDue(null, now);

  assertEquals(updatedTask.due, null);
});

Deno.test("期限ありへの変更を許容", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "unstarted",
    title: "test1",
    due: new Date("2026-10-01T00:00:00Z"),
    createdAt: DATE_1
  });

  const now = DATE_2;
  const updatedTask = task.withDue(new Date("2026-10-01T00:00:00Z"), now);

  assertEquals(updatedTask.due!.toISOString(), new Date("2026-10-01T00:00:00Z").toISOString());
});

// 開始日時の編集

Deno.test("開始日時の編集を許容", () => {
  const task = Task.create({
    id: TASK_ID,
    title: "test1",
    status: "in-progress",
    due: new Date("2026-10-01T00:00:00Z"),
    startedAt: new Date("2026-05-01T00:00:00Z"),
    createdAt: DATE_1
  });

  const now = DATE_2;
  const updatedTask = task.withStartedAt(new Date("2026-06-01T00:00:00Z"), now);

  assertEquals(updatedTask.startedAt!.toISOString(), new Date("2026-06-01T00:00:00Z").toISOString());
});

// 完了日時の編集

Deno.test("完了日時の編集を許容", () => {
  const task = Task.create({
    id: TASK_ID,
    title: "test1",
    status: "completed",
    due: new Date("2026-10-01T00:00:00Z"),
    startedAt: new Date("2026-05-01T00:00:00Z"),
    completedAt: new Date("2026-06-01T00:00:00Z"),
    createdAt: DATE_1
  });

  const now = DATE_2;
  const updatedTask = task.withCompletedAt(new Date("2026-06-01T00:00:00Z"), now);

  assertEquals(updatedTask.completedAt!.toISOString(), new Date("2026-06-01T00:00:00Z").toISOString());
});
