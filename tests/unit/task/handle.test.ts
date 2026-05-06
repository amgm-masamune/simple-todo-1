import { assertEquals, assertThrows } from "@std/assert";
import { UNSPECIFIED, Task } from "@feature/Task/domain/Task.ts";
import { TASK_ID_1, DATE_1, DATE_2, DATE_3, DATE_4, DATE_5, DATE_6, DATE_7 } from "../../helper.ts";
import { ValidationError } from "@common/Error/ValidationError/ValidationError.ts";

/*
# 方針
- 存在レベルでの不正な操作（開始日時に > 完了日時 を指定する等）は存在ルール（Task.create）の責務になる。
  不正な操作はバリデーションが動いているかどうかの確認の観点で行う。

*/

// タイトルの編集

Deno.test("タスクはタイトルを変更できる", () => {
  // Given: 作成済みタスク
  const task = Task.create({
    id: TASK_ID_1,
    status: "unstarted",
    title: "test1",
    due: UNSPECIFIED,
    createdAt: DATE_1,
    updatedAt: DATE_2
  });

  // When: タイトルを変更する
  const now = DATE_2;
  const updatedTask = task.withTitle("test2", now);

  // Then: タスク名が更新されていること
  assertEquals(updatedTask.title, "test2");
});

Deno.test("0文字のタイトルへ変更できる", () => {
  const task = Task.create({
    id: TASK_ID_1,
    status: "unstarted",
    title: "test1",
    due: UNSPECIFIED,
    createdAt: DATE_1,
    updatedAt: DATE_2
  });

  const now = DATE_2;
  const updatedTask = task.withTitle("", now);

  assertEquals(updatedTask.title, "");
});

// 期限の編集

Deno.test("期限を変更できる", () => {
  const task = Task.create({
    id: TASK_ID_1,
    status: "unstarted",
    title: "test1",
    due: DATE_3,
    createdAt: DATE_1,
    updatedAt: DATE_2
  }); 

  const now = DATE_2;
  const updatedTask = task.withDue(DATE_4, now);

  assertEquals(updatedTask.due, DATE_4);
});

Deno.test("期限なしへ変更できる", () => {
  const task = Task.create({
    id: TASK_ID_1,
    status: "unstarted",
    title: "test1",
    due: DATE_3,
    createdAt: DATE_1,
    updatedAt: DATE_2
  });

  const now = DATE_2;
  const updatedTask = task.withDue(UNSPECIFIED, now);

  assertEquals(updatedTask.due, UNSPECIFIED);
});

Deno.test("期限ありへ変更できる", () => {
  const task = Task.create({
    id: TASK_ID_1,
    status: "unstarted",
    title: "test1",
    due: DATE_3,
    createdAt: DATE_1,
    updatedAt: DATE_2
  });

  const now = DATE_2;
  const updatedTask = task.withDue(DATE_3, now);

  assertEquals(updatedTask.due, DATE_3);
});

// 開始日時の編集

Deno.test("開始日時は正常な値であれば変更できる", () => {
  const task = Task.create({
    id: TASK_ID_1,
    title: "test1",
    status: "in-progress",
    due: DATE_3,
    startedAt: DATE_4,
    createdAt: DATE_1,
    updatedAt: DATE_2
  });

  const now = DATE_2;
  const updatedTask = task.withStartedAt(DATE_5, now);

  assertEquals(updatedTask.startedAt, DATE_5);
});

Deno.test("開始日時の不正な指定は Task.create のバリデーションで拒否される", () => {
  // Given
  const task = Task.create({
    id: TASK_ID_1,
    title: "test1",
    status: "completed",
    due: DATE_3,
    startedAt: DATE_4,
    completedAt: DATE_5,
    createdAt: DATE_1,
    updatedAt: DATE_2
  });

  // When・Then
  const now = DATE_2;
  assertThrows(() => 
    task.withStartedAt(DATE_6, now), // > completedAt = DATE_5
    ValidationError
  );
});

// 完了日時の編集

Deno.test("完了日時は正常な値であれば変更できる", () => {
  const task = Task.create({
    id: TASK_ID_1,
    title: "test1",
    status: "completed",
    due: DATE_3,
    startedAt: DATE_4,
    completedAt: DATE_5,
    createdAt: DATE_1,
    updatedAt: DATE_2
  });

  const now = DATE_2;
  const updatedTask = task.withCompletedAt(DATE_6, now);

  assertEquals(updatedTask.completedAt, DATE_6);
});

Deno.test("完了の不正な指定は Task.create のバリデーションで拒否される", () => {
  // Given
  const task = Task.create({
    id: TASK_ID_1,
    title: "test1",
    status: "completed",
    due: DATE_3,
    startedAt: DATE_5,
    completedAt: DATE_6,
    createdAt: DATE_1,
    updatedAt: DATE_2
  });

  // When・Then
  const now = DATE_2;
  assertThrows(() => 
    task.withCompletedAt(DATE_4, now), // < startedAt = DATE_5
    ValidationError
  );
});


Deno.test("キャンセル日時を変更できる", () => {
  const task = Task.create({
    id: TASK_ID_1,
    title: "test1",
    status: "cancelled",
    due: DATE_3,
    startedAt: DATE_4,
    completedAt: DATE_5,
    cancelledAt: DATE_6,
    createdAt: DATE_1,
    updatedAt: DATE_2
  });

  const now = DATE_2;
  const updatedTask = task.withCancelledAt(DATE_7, now);

  assertEquals(updatedTask.cancelledAt, DATE_7);
});
