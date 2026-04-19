import { assertEquals, assertThrows } from "@std/assert";
import { Task } from "../../feature/Task/domain/Task.ts";

const TASK_ID = "1";

const DATE_1 = new Date("2026-04-01T00:00:00Z");
const DATE_2 = new Date("2026-04-02T00:00:00Z");
const DATE_3 = new Date("2026-04-03T00:00:00Z");
const DATE_4 = new Date("2026-04-04T00:00:00Z");

// ==== タスク状態の変更（未完了→）========================================

Deno.test("未完了→進行中 で startedAt を指定しないとエラーになる", () => { 
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "unstarted",
    due: null,
    createdAt: DATE_1,
    updatedAt: DATE_1,
  });

  // When・Then
  const now = DATE_2;
  assertThrows(() => {
    task.changeStatus("in-progress", { startedAt: undefined }, now);
  });
});

Deno.test("未完了→進行中 で startedAt に日付を指定すると変更できる", () => {
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "unstarted",
    due: null,
    createdAt: DATE_1
    updatedAt: DATE_1,
  });

  // When
  const now = DATE_2;
  const startedAt = DATE_3;
  const updated = task.changeStatus("in-progress", { startedAt }, now);

  // Then
  assertEquals(updated.status, "in-progress");
  assertEquals(updated.startedAt?.toISOString(), startedAt.toISOString());
  assertEquals(updated.updatedAt.toISOString(), now.toISOString());
});

Deno.test("未完了→進行中 で startedAt に null を指定しても変更できる", () => {
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "unstarted",
    due: null,
    createdAt: DATE_1
    updatedAt: DATE_1,
  });

  // When
  const now = DATE_2;
  const startedAt = null;
  const updated = task.changeStatus("in-progress", { startedAt }, now);

  // Then
  assertEquals(updated.status, "in-progress");
  assertEquals(updated.startedAt, null);
  assertEquals(updated.updatedAt.toISOString(), now.toISOString());
});

Deno.test("未完了→完了 で startedAt を指定しないとエラーになる", () => { 
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "unstarted",
    due: null,
    createdAt: DATE_1
    updatedAt: DATE_1,
  });

  // When・Then
  const now = DATE_2;
  assertThrows(() => {
    task.changeStatus("completed", { startedAt: undefined }, now);
  });
});

Deno.test("未完了→完了 で completedAt を指定しないとエラーになる", () => { 
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "unstarted",
    due: null,
    createdAt: DATE_1
    updatedAt: DATE_1,
  });

  // When・Then
  const now = DATE_2;
  const startedAt = DATE_3;
  assertThrows(() => {
    task.changeStatus("completed", { startedAt }, now);
  });
});

Deno.test("未完了→完了 で startedAt・completedAt に日付を指定すると更新できる", () => {
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "unstarted",
    due: null,
    createdAt: DATE_1
    updatedAt: DATE_1,
  });

  // When
  const now = DATE_2;
  const startedAt = DATE_3;
  const completedAt = DATE_4;
  const updated = task.changeStatus("completed", { startedAt, completedAt }, now);

  // Then
  assertEquals(updated.status, "completed");
  assertEquals(updated.startedAt?.toISOString(), startedAt.toISOString());
  assertEquals(updated.completedAt?.toISOString(), completedAt.toISOString());
  assertEquals(updated.updatedAt.toISOString(), now.toISOString());
});


Deno.test("未完了→完了 で startedAt・completedAt に null を指定しても更新できる", () => {
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "unstarted",
    due: null,
    createdAt: DATE_1
    updatedAt: DATE_1,
  });

  // When
  const now = DATE_2;
  const startedAt = null;
  const completedAt = null;
  const updated = task.changeStatus("completed", { startedAt, completedAt }, now);

  // Then
  assertEquals(updated.status, "completed");
  assertEquals(updated.startedAt, null);
  assertEquals(updated.completedAt, null);
  assertEquals(updated.updatedAt.toISOString(), now.toISOString());
});


Deno.test("未完了→キャンセル で cancelledAt を指定しないとエラーになる", () => { 
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "unstarted",
    due: null,
    createdAt: DATE_1
    updatedAt: DATE_1,
  });

  // When・Then
  const now = DATE_2;
  assertThrows(() => {
    task.changeStatus("cancelled", { }, now);
  });
});

Deno.test("未完了→キャンセル で cancelledAt に日付を指定すると更新できる", () => {
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "unstarted",
    due: null,
    createdAt: DATE_1
    updatedAt: DATE_1,
  });

  // When
  const now = DATE_2;
  const cancelledAt = DATE_3;
  const updated = task.changeStatus("cancelled", { cancelledAt }, now);

  // Then
  assertEquals(updated.status, "cancelled");
  assertEquals(updated.cancelledAt?.toISOString(), cancelledAt.toISOString());
  assertEquals(updated.updatedAt.toISOString(), now.toISOString());
});

Deno.test("未完了→キャンセル で cancelledAt に null を指定しても更新できる", () => {
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "unstarted",
    due: null,
    createdAt: DATE_1
    updatedAt: DATE_1,
  });

  // When
  const now = DATE_2;
  const cancelledAt = null;
  const updated = task.changeStatus("cancelled", { cancelledAt }, now);

  // Then
  assertEquals(updated.status, "cancelled");
  assertEquals(updated.cancelledAt, null);
  assertEquals(updated.updatedAt.toISOString(), now.toISOString());
});

// ==== タスク状態の変更（進行中→）========================================

Deno.test("進行中→未完了の更新ができる", () => {
  // Given
  
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "in-progress",
    due: null,
    startedAt: null,
    createdAt: DATE_1
    updatedAt: DATE_1,
  });

  // When

  const now = DATE_2;
  const updated = task.toUnstarted(now);

  // Then

  assertEquals(updated.status, "unstarted");
  assertEquals(updated.startedAt, undefined);
  assertEquals(updated.updatedAt.toISOString(), now.toISOString());
});

Deno.test("進行中→完了の更新ができる", () => { 
  // Given
  
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "in-progress",
    due: null,
    startedAt: null,
    createdAt: DATE_1
    updatedAt: DATE_1,
  });

  // When

  const now = DATE_2;
  const completedAt = DATE_3;
  const updated = task.toCompleted({ completedAt }, now);

  // Then

  assertEquals(updated.status, "completed");
  assertEquals(updated.startedAt, null);
  assertEquals(updated.completedAt?.toISOString(), completedAt.toISOString());
  assertEquals(updated.updatedAt.toISOString(), now.toISOString());
});

// TODO: completedAt 未指定・null指定

// TODO: 完了→、キャンセル→