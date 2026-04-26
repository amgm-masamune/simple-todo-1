import { assertEquals, assertThrows } from "@std/assert";
import { UNSPECIFIED, Task } from "../../feature/Task/domain/Task.ts";
import { TASK_ID, DATE_1, DATE_2, DATE_3, DATE_4 } from "../helper.ts";
import { ValidationError } from "../../common/Error/ValidationError/ValidationError.ts";

// ==== タスク状態の変更（未完了→）========================================

Deno.test("未完了→進行中 で startedAt を指定しないとValidationErrorになる", () => { 
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "unstarted",
    due: UNSPECIFIED,
    createdAt: DATE_1,
    updatedAt: DATE_1
  });

  // When・Then
  const now = DATE_2;
  assertThrows(() => {
    task.changeStatus("in-progress", { startedAt: undefined }, now);
  }, ValidationError);
});

Deno.test("未完了→進行中 で startedAt に日付を指定すると変更できる", () => {
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "unstarted",
    due: UNSPECIFIED,
    createdAt: DATE_1,
    updatedAt: DATE_1
  });

  // When
  const now = DATE_2;
  const startedAt = DATE_3;
  const updated = task.changeStatus("in-progress", { startedAt }, now);

  // Then
  assertEquals(updated.status, "in-progress");
  assertEquals(updated.startedAt, startedAt);
  assertEquals(updated.updatedAt, now);
});

Deno.test("未完了→進行中 で startedAt に UNSPECIFIED を指定しても変更できる", () => {
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "unstarted",
    due: UNSPECIFIED,
    createdAt: DATE_1,
    updatedAt: DATE_1,
  });

  // When
  const now = DATE_2;
  const startedAt = UNSPECIFIED;
  const updated = task.changeStatus("in-progress", { startedAt }, now);

  // Then
  assertEquals(updated.status, "in-progress");
  assertEquals(updated.startedAt, UNSPECIFIED);
  assertEquals(updated.updatedAt, now);
});

Deno.test("未完了→完了 で startedAt を指定しないとValidationErrorになる", () => { 
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "unstarted",
    due: UNSPECIFIED,
    createdAt: DATE_1,
    updatedAt: DATE_1,
  });

  // When・Then
  const now = DATE_2;
  assertThrows(() => {
    task.changeStatus("completed", { startedAt: undefined }, now);
  }, ValidationError);
});

Deno.test("未完了→完了 で completedAt を指定しないとValidationErrorになる", () => { 
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "unstarted",
    due: UNSPECIFIED,
    createdAt: DATE_1,
    updatedAt: DATE_1,
  });

  // When・Then
  const now = DATE_2;
  const startedAt = DATE_3;
  assertThrows(() => {
    task.changeStatus("completed", { startedAt }, now);
  }, ValidationError);
});

Deno.test("未完了→完了 で startedAt・completedAt に日付を指定すると更新できる", () => {
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "unstarted",
    due: UNSPECIFIED,
    createdAt: DATE_1,
    updatedAt: DATE_1,
  });

  // When
  const now = DATE_2;
  const startedAt = DATE_3;
  const completedAt = DATE_4;
  const updated = task.changeStatus("completed", { startedAt, completedAt }, now);

  // Then
  assertEquals(updated.status, "completed");
  assertEquals(updated.startedAt, startedAt);
  assertEquals(updated.completedAt, completedAt);
  assertEquals(updated.updatedAt, now);
});


Deno.test("未完了→完了 で startedAt・completedAt に UNSPECIFIED を指定しても更新できる", () => {
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "unstarted",
    due: UNSPECIFIED,
    createdAt: DATE_1,
    updatedAt: DATE_1,
  });

  // When
  const now = DATE_2;
  const startedAt = UNSPECIFIED;
  const completedAt = UNSPECIFIED;
  const updated = task.changeStatus("completed", { startedAt, completedAt }, now);

  // Then
  assertEquals(updated.status, "completed");
  assertEquals(updated.startedAt, UNSPECIFIED);
  assertEquals(updated.completedAt, UNSPECIFIED);
  assertEquals(updated.updatedAt, now);
});


Deno.test("未完了→キャンセル で cancelledAt を指定しないとValidationErrorになる", () => { 
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "unstarted",
    due: UNSPECIFIED,
    createdAt: DATE_1,
    updatedAt: DATE_1,
  });

  // When・Then
  const now = DATE_2;
  assertThrows(() => {
    task.changeStatus("cancelled", { }, now);
  }, ValidationError);
});

Deno.test("未完了→キャンセル で cancelledAt に日付を指定すると更新できる", () => {
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "unstarted",
    due: UNSPECIFIED,
    createdAt: DATE_1,
    updatedAt: DATE_1,
  });

  // When
  const now = DATE_2;
  const cancelledAt = DATE_3;
  const updated = task.changeStatus("cancelled", { cancelledAt }, now);

  // Then
  assertEquals(updated.status, "cancelled");
  assertEquals(updated.cancelledAt, cancelledAt);
  assertEquals(updated.updatedAt, now);
});

Deno.test("未完了→キャンセル で cancelledAt に UNSPECIFIED を指定しても更新できる", () => {
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "unstarted",
    due: UNSPECIFIED,
    createdAt: DATE_1,
    updatedAt: DATE_1,
  });

  // When
  const now = DATE_2;
  const cancelledAt = UNSPECIFIED;
  const updated = task.changeStatus("cancelled", { cancelledAt }, now);

  // Then
  assertEquals(updated.status, "cancelled");
  assertEquals(updated.cancelledAt, UNSPECIFIED);
  assertEquals(updated.updatedAt, now);
});

// ==== タスク状態の変更（進行中→）========================================

Deno.test("進行中→未完了の更新ができる", () => {
  // Given
  
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "in-progress",
    due: UNSPECIFIED,
    startedAt: UNSPECIFIED,
    createdAt: DATE_1,
    updatedAt: DATE_1,
  });

  // When

  const now = DATE_2;
  const updated = task.toUnstarted(now);

  // Then

  assertEquals(updated.status, "unstarted");
  assertEquals(updated.startedAt, undefined);
  assertEquals(updated.updatedAt, now);
});

Deno.test("進行中→完了の更新ができる", () => { 
  // Given
  
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "in-progress",
    due: UNSPECIFIED,
    startedAt: UNSPECIFIED,
    createdAt: DATE_1,
    updatedAt: DATE_1,
  });

  // When

  const now = DATE_2;
  const completedAt = DATE_3;
  const updated = task.toCompleted({ completedAt }, now);

  // Then

  assertEquals(updated.status, "completed");
  assertEquals(updated.startedAt, UNSPECIFIED);
  assertEquals(updated.completedAt, completedAt);
  assertEquals(updated.updatedAt, now);
});

// TODO: completedAt 未指定・UNSPECIFIED指定

// TODO: 完了→、キャンセル→