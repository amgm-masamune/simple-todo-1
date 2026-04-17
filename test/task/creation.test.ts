import { assert, assertEquals, assertThrows } from "@std/assert";
import { Task } from "../../feature/Task/domain/Task.ts";

const TASK_ID = "1";

//
// タスク作成
//

// 種類別のタスク作成
Deno.test("未着手タスク作成", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "unstarted",
    title: "タスク1",
    due: new Date("2026-10-01T00:00:00Z"),
    createdAt: new Date("2026-04-01T00:00:00Z"),
  });

  assertEquals(task.status, "unstarted");
});

Deno.test("進行中タスク作成", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "in-progress",
    title: "タスク2",
    due: new Date("2026-10-01T00:00:00Z"),
    createdAt: new Date("2026-04-01T00:00:00Z"),
    startedAt: new Date("2025-01-02T00:00:00Z"),
  });

  assertEquals(task.status, "in-progress");
});

Deno.test("完了済みタスク作成", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "completed",
    title: "タスク3",
    due: new Date("2026-10-01T00:00:00Z"),
    createdAt: new Date("2026-04-01T00:00:00Z"),
    startedAt: new Date("2025-01-02T00:00:00Z"),
    completedAt: new Date("2025-01-03T00:00:00Z"),
  });

  assertEquals(task.status, "completed");
});

Deno.test("キャンセルされたタスク作成", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "cancelled",
    title: "タスク4",
    due: new Date("2026-10-01T00:00:00Z"),
    createdAt: new Date("2026-04-01T00:00:00Z"),
    startedAt: null,
    completedAt: null,
    cancelledAt: new Date("2026-04-01T00:00:00Z"),
  });

  assertEquals(task.status, "cancelled");
});

// タイトル指定


Deno.test("0文字タイトルを許容", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "unstarted",
    title: "",
    due: new Date("2026-10-01T00:00:00Z"),
    createdAt: new Date("2026-04-01T00:00:00Z"),
  });

  assertEquals(task.title, "");
});


// 期限の指定

Deno.test("期限なしを許容", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "unstarted",
    title: "タスク5",
    due: null,
    createdAt: new Date("2026-04-01T00:00:00Z"),
  });
  
  assertEquals(task.due, null);
});

Deno.test("期限ありを許容", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "unstarted",
    title: "task",
    due: new Date("2026-10-01T00:00:00Z"),
    createdAt: new Date("2026-04-01T00:00:00Z"),
  });

  assertEquals(task.due, new Date("2026-10-01T00:00:00Z"));
});

// 開始日時の指定

Deno.test("開始日時なしを許容", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "in-progress",
    title: "task",
    due: null,
    startedAt: null,
    createdAt: new Date("2026-04-01T00:00:00Z")
  });

  assertEquals(task.startedAt, null);
});

Deno.test("開始日時ありを許容", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "in-progress",
    title: "task",
    due: null,
    startedAt: new Date("2026-05-01T00:00:00Z"),
    createdAt: new Date("2026-04-01T00:00:00Z")
  });

  assertEquals(task.startedAt, new Date("2026-05-01T00:00:00Z"));
});

// 完了日時の指定

Deno.test("完了日時なしを許容", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "completed",
    title: "task",
    due: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date("2026-04-01T00:00:00Z")
  });

  assertEquals(task.completedAt, null);
});

Deno.test("完了日時ありを許容", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "completed",
    title: "task",
    due: null,
    startedAt: null,
    completedAt: new Date("2026-06-01T00:00:00Z"),
    createdAt: new Date("2026-04-01T00:00:00Z")
  });

  assertEquals(task.completedAt, new Date("2026-06-01T00:00:00Z"));
});

// キャンセル日時の指定

Deno.test("キャンセル日時なしを許容", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "cancelled",
    title: "task",
    due: null,
    startedAt: null,
    completedAt: null,
    cancelledAt: null,
    createdAt: new Date("2026-04-01T00:00:00Z")
  });

  assertEquals(task.cancelledAt, null);
});

Deno.test("キャンセル日時ありを許容", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "cancelled",
    title: "task",
    due: null,
    startedAt: null,
    completedAt: null,
    cancelledAt: new Date("2026-07-01T00:00:00Z"),
    createdAt: new Date("2026-04-01T00:00:00Z")
  });

  assertEquals(task.cancelledAt, new Date("2026-07-01T00:00:00Z"));
});

// 作成日時

Deno.test("作成日時は外から注入", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "unstarted",
    title: "task",
    due: null,
    createdAt: new Date("2026-04-01T00:00:00Z")
  });

  assertEquals(task.createdAt, new Date("2026-04-01T00:00:00Z"));
});

// 更新日時

Deno.test("更新日時は未指定可能(作成日時 == 更新日時)", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "unstarted",
    title: "task",
    due: null,
    createdAt: new Date("2026-04-01T00:00:00Z")
  });

  assertEquals(task.updatedAt, task.createdAt);
});

Deno.test("更新日時は外から注入", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "unstarted",
    title: "task",
    due: null,
    createdAt: new Date("2026-04-01T00:00:00Z"),
    updatedAt: new Date("2026-05-01T00:00:00Z")
  });

  assertEquals(task.updatedAt, new Date("2026-05-01T00:00:00Z"));
});

// 時間関係

//   開始日時との関係

//     開始日時と完了日時

Deno.test("開始日時 < 完了日時 を許容", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "completed",
    title: "task",
    due: null,
    startedAt: new Date("2026-05-01T00:00:00Z"),
    completedAt: new Date("2026-06-01T00:00:00Z"),
    createdAt: new Date("2026-04-01T00:00:00Z")
  });

  assert(task.startedAt!.getTime() < task.completedAt!.getTime())
});

Deno.test("開始日時 == 完了日時 を許容", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "completed",
    title: "task",
    due: null,
    startedAt: new Date("2026-05-01T00:00:00Z"),
    completedAt: new Date("2026-05-01T00:00:00Z"),
    createdAt: new Date("2026-04-01T00:00:00Z")
  });

  assertEquals(task.startedAt!.toISOString(), task.completedAt!.toISOString());
});

Deno.test("開始日時 > 完了日時 を拒否", () => {
  assertThrows(() => {
    Task.create({
      id: TASK_ID,
      status: "completed",
      title: "task",
      due: null,
      startedAt: new Date("2026-06-01T00:00:00Z"),
      completedAt: new Date("2026-05-01T00:00:00Z"),
      createdAt: new Date("2026-04-01T00:00:00Z")
    });
  });
});

//   作成日時との関係

//     作成日時と更新日時

Deno.test("作成日時 <= 更新日時 を許容", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "unstarted",
    title: "task",
    due: null,
    createdAt: new Date("2026-04-01T00:00:00Z"),
    updatedAt: new Date("2026-05-01T00:00:00Z")
  });

  assert(task.createdAt.getTime() < task.updatedAt.getTime());
});

Deno.test("作成日時 > 更新日時を拒否", () => {
  assertThrows(() => {
    Task.create({
      id: TASK_ID,
      status: "unstarted",
      title: "task",
      due: null,
      createdAt: new Date("2026-04-01T00:00:00Z"),
      updatedAt: new Date("2026-03-01T00:00:00Z")
    });
  });
});

