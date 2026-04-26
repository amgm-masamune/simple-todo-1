import { assertEquals, assertGreater, assertLess, assertThrows } from "@std/assert";
import { UNSPECIFIED, Task } from "../../feature/Task/domain/Task.ts";
import { DATE_1, DATE_2, DATE_3, DATE_4, TASK_ID } from "../helper.ts";
import { ValidationError } from "../../common/Error/ValidationError/ValidationError.ts";

// ドメインエンティティが作成できる <=> そのエンティティは存在できる


// ======== 種類別のタスク作成 ========

Deno.test("未着手タスクは存在できる", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "unstarted",
    title: "タスク1",
    due: DATE_2,
    createdAt: DATE_1,
    updatedAt: DATE_1,
  });

  assertEquals(task.status, "unstarted");
});

Deno.test("進行中タスクは存在できる", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "in-progress",
    title: "タスク2",
    due: DATE_3,
    startedAt: DATE_2,
    createdAt: DATE_1,
    updatedAt: DATE_1,
  });

  assertEquals(task.status, "in-progress");
});

Deno.test("完了済みタスクは存在できる", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "completed",
    title: "タスク3",
    due: DATE_3,
    startedAt: DATE_2,
    completedAt: DATE_3,
    createdAt: DATE_1,
    updatedAt: DATE_1,
  });

  assertEquals(task.status, "completed");
});

Deno.test("キャンセルされたタスクは存在できる", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "cancelled",
    title: "タスク4",
    due: DATE_2,
    startedAt: UNSPECIFIED,
    completedAt: UNSPECIFIED,
    cancelledAt: DATE_4,
    createdAt: DATE_1,
    updatedAt: DATE_1,
  });

  assertEquals(task.status, "cancelled");
});


// ======== タイトルの指定 ========

Deno.test("0文字タイトルのタスクは存在できる", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "unstarted",
    title: "",
    due: DATE_2,
    createdAt: DATE_1,
    updatedAt: DATE_1,
  });

  assertEquals(task.title, "");
});


// ======== 期限の指定 ========

Deno.test("期限なしのタスクは存在できる", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "unstarted",
    title: "タスク5",
    due: UNSPECIFIED,
    createdAt: DATE_1,
    updatedAt: DATE_1,
  });
  
  assertEquals(task.due, UNSPECIFIED);
});

Deno.test("正常な日時の期限ありのタスクは存在できる", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "unstarted",
    title: "task",
    due: DATE_2,
    createdAt: DATE_1,
    updatedAt: DATE_1,
  });

  assertEquals(task.due, DATE_2);
});

Deno.test("異常な日時の期限ありのタスクは存在できず、ValidationErrorとなる", () => {
  assertThrows(() => 
    Task.create({
      id: TASK_ID,
      status: "unstarted",
      title: "task",
      due: new Date("Invalid Date"),
      createdAt: DATE_1,
      updatedAt: DATE_1,
    }),
    ValidationError
  );
});

Deno.test("期限が未来の日時のタスクは存在できる", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "unstarted",
    title: "task",
    due: DATE_2,
    createdAt: DATE_1,
    updatedAt: DATE_1,
  });

  assertGreater(task.due, task.createdAt);
  assertGreater(task.due, task.updatedAt);
});

Deno.test("期限が過去の日時のタスクは存在できる", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "unstarted",
    title: "task",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2,
  });

  assertLess(task.due, task.createdAt);
  assertLess(task.due, task.updatedAt);
});


// ======== 開始日時の指定 ========

Deno.test("開始日時が無い進行中タスクは存在できる", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "in-progress",
    title: "task",
    due: UNSPECIFIED,
    startedAt: UNSPECIFIED,
    createdAt: DATE_1,
    updatedAt: DATE_1
  });

  assertEquals(task.startedAt, UNSPECIFIED);
});

Deno.test("正常な日時の開始日時がある進行中タスクは存在できる", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "in-progress",
    title: "task",
    due: UNSPECIFIED,
    startedAt: DATE_2,
    createdAt: DATE_1,
    updatedAt: DATE_1
  });

  assertEquals(task.startedAt, DATE_2);
});

Deno.test("異常な日時の開始日時の進行中タスクは存在できず、ValidationErrorとなる", () => {
  assertThrows(() => 
    Task.create({
      id: TASK_ID,
      status: "in-progress",
      title: "task",
      due: UNSPECIFIED,
      startedAt: new Date("Invalid Date"),
      createdAt: DATE_1,
      updatedAt: DATE_1
    }),
    ValidationError
  );
});


// ======== 完了日時の指定 ========

Deno.test("完了日時が無い完了タスクは存在できる", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "completed",
    title: "task",
    due: UNSPECIFIED,
    startedAt: UNSPECIFIED,
    completedAt: UNSPECIFIED,
    createdAt: DATE_1,
    updatedAt: DATE_1
  });

  assertEquals(task.completedAt, UNSPECIFIED);
});

Deno.test("正常な日時の完了日時がある完了タスクは存在できる", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "completed",
    title: "task",
    due: UNSPECIFIED,
    startedAt: UNSPECIFIED,
    completedAt: DATE_2,
    createdAt: DATE_1,
    updatedAt: DATE_1
  });

  assertEquals(task.completedAt, DATE_2);
});

Deno.test("異常な日時の完了日時の完了タスクは存在できず、ValidationErrorとなる", () => {
  assertThrows(() => 
    Task.create({
      id: TASK_ID,
      status: "completed",
      title: "task",
      due: UNSPECIFIED,
      startedAt: UNSPECIFIED,
      completedAt: new Date("Invalid Date"),
      createdAt: DATE_1,
      updatedAt: DATE_1
    }),
    ValidationError
  );
});


// ======== キャンセル日時の指定 ========

Deno.test("キャンセル日時のないキャンセルタスクを作成できる", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "cancelled",
    title: "task",
    due: UNSPECIFIED,
    startedAt: UNSPECIFIED,
    completedAt: UNSPECIFIED,
    cancelledAt: UNSPECIFIED,
    createdAt: DATE_1,
    updatedAt: DATE_1
  });

  assertEquals(task.cancelledAt, UNSPECIFIED);
});

Deno.test("正常な日時のキャンセル日時のあるキャンセルタスクを作成できる", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "cancelled",
    title: "task",
    due: UNSPECIFIED,
    startedAt: UNSPECIFIED,
    completedAt: UNSPECIFIED,
    cancelledAt: DATE_2,
    createdAt: DATE_1,
    updatedAt: DATE_1
  });

  assertEquals(task.cancelledAt, DATE_2);
});

Deno.test("キャンセル日時が異常な日時のキャンセルタスクは存在できず、ValidationErrorとなる", () => {
  assertThrows(() => 
    Task.create({
      id: TASK_ID,
      status: "cancelled",
      title: "task",
      due: UNSPECIFIED,
      startedAt: UNSPECIFIED,
      completedAt: UNSPECIFIED,
      cancelledAt: new Date("Invalid Date"),
      createdAt: DATE_1,
      updatedAt: DATE_1
    }),
    ValidationError
  );
});


// ======== 作成日時の指定 ========

Deno.test("作成日時は外から注入する", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "unstarted",
    title: "task",
    due: UNSPECIFIED,
    createdAt: DATE_1,
    updatedAt: DATE_1
  });

  assertEquals(task.createdAt, DATE_1);
});

Deno.test("作成日時が異常な日時のタスクは存在できず、ValidationErrorとなる", () => {
  assertThrows(() => 
    Task.create({
      id: TASK_ID,
      status: "unstarted",
      title: "task",
      due: UNSPECIFIED,
      createdAt: new Date("Invalid Date"),
      updatedAt: DATE_1
    }),
    ValidationError
  );
});

// ======== 更新日時の指定 ========

Deno.test("更新日時は外から注入する", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "unstarted",
    title: "task",
    due: UNSPECIFIED,
    createdAt: DATE_1,
    updatedAt: DATE_2
  });

  assertEquals(task.updatedAt, DATE_2);
});

Deno.test("更新日時が異常な日時のタスクは存在できず、ValidationErrorとなる", () => {
  assertThrows(() => 
    Task.create({
      id: TASK_ID,
      status: "unstarted",
      title: "task",
      due: UNSPECIFIED,
      createdAt: DATE_1,
      updatedAt: new Date("Invalid Date")
    }),
    ValidationError
  );
});

// =========================
// ======== 時間関係 =======
// =========================

// ======== 開始日時との関係 ========

// 開始日時と完了日時

Deno.test("開始日時が UNSPECIFIED の時、完了日時は任意の日付を指定できる", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "completed",
    title: "task",
    due: UNSPECIFIED,
    startedAt: UNSPECIFIED,
    completedAt: DATE_2,  // 指定してもエラーにならない
    createdAt: DATE_1,
    updatedAt: DATE_1
  });

  assertEquals(task.completedAt, DATE_2);
});

Deno.test("完了日時が UNSPECIFIED の時、開始日時は任意の日付を指定できる", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "completed",
    title: "task",
    due: UNSPECIFIED,
    startedAt: DATE_2,  // 指定してもエラーにならない
    completedAt: UNSPECIFIED,
    createdAt: DATE_1,
    updatedAt: DATE_1
  });

  assertEquals(task.completedAt, DATE_2);
});

Deno.test("開始日時 < 完了日時 を許容", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "completed",
    title: "task",
    due: UNSPECIFIED,
    startedAt: DATE_2,
    completedAt: DATE_3,
    createdAt: DATE_1,
    updatedAt: DATE_1
  });

  assertLess(task.startedAt, task.completedAt)
});

Deno.test("開始日時 == 完了日時 を許容", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "completed",
    title: "task",
    due: UNSPECIFIED,
    startedAt: DATE_2,
    completedAt: DATE_2,
    createdAt: DATE_1,
    updatedAt: DATE_1
  });

  assertEquals(task.startedAt, task.completedAt);
});

Deno.test("開始日時 > 完了日時 は ValidationError", () => {
  assertThrows(() => {
    Task.create({
      id: TASK_ID,
      status: "completed",
      title: "task",
      due: UNSPECIFIED,
      startedAt: DATE_3,
      completedAt: DATE_2,
      createdAt: DATE_1,
      updatedAt: DATE_1
    });
  }, ValidationError);
});


// ======== 作成日時との関係 ========

// 作成日時と更新日時

Deno.test("作成日時 < 更新日時 を許容", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "unstarted",
    title: "task",
    due: UNSPECIFIED,
    createdAt: DATE_1,
    updatedAt: DATE_2
  });

  assertLess(task.createdAt, task.updatedAt);
});

Deno.test("作成日時 == 更新日時 を許容", () => {
  const task = Task.create({
    id: TASK_ID,
    status: "unstarted",
    title: "task",
    due: UNSPECIFIED,
    createdAt: DATE_1,
    updatedAt: DATE_1
  });

  assertEquals(task.createdAt, task.updatedAt);
});

Deno.test("作成日時 > 更新日時を拒否", () => {
  assertThrows(() => {
    Task.create({
      id: TASK_ID,
      status: "unstarted",
      title: "task",
      due: UNSPECIFIED,
      createdAt: DATE_2,
      updatedAt: DATE_1
    });
  });
});

