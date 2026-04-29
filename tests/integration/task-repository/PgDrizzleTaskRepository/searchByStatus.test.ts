import { assertEquals } from "@std/assert/equals";
import { Task } from "@feature/Task/domain/Task.ts";
import { TASK_ID_1, DATE_1, DATE_2, TASK_ID_2, TASK_ID_3, TASK_ID_4, TASK_ID_5, TASK_ID_6, DATE_4, DATE_3 } from "../../../helper.ts";
import { assertArrayIncludes } from "@std/assert/array-includes";

Deno.test("指定した status のタスクを取得できる。", async () => {
  const taskRepository = new PgDrizzleTaskRepository();
  
  // Given
  await taskRepository.create(Task.create({
    id: TASK_ID_1,
    title: "new task",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));

  // When
  const storeds = await taskRepository.findByStatus("unstarted");

  // Then
  assertEquals(storeds.length, 1);
  assertEquals(storeds[0].id, TASK_ID_1);
});

Deno.test("すべての種類のタスクの中から指定した status のタスクをすべて取得できる。", async () => {
  const taskRepository = new PgDrizzleTaskRepository();
  
  // Given
  await taskRepository.create(Task.create({
    id: TASK_ID_1,
    title: "new task",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));
  await taskRepository.create(Task.create({
    id: TASK_ID_2,
    title: "new task",
    status: "in-progress",
    due: DATE_1,
    startedAt: DATE_2,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));
  await taskRepository.create(Task.create({
    id: TASK_ID_3,
    title: "new task",
    status: "completed",
    due: DATE_1,
    startedAt: DATE_2,
    completedAt: DATE_3,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));
  await taskRepository.create(Task.create({
    id: TASK_ID_4,
    title: "new task",
    status: "cancelled",
    due: DATE_1,
    startedAt: DATE_2,
    completedAt: DATE_3,
    cancelledAt: DATE_4,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));
  await taskRepository.create(Task.create({
    id: TASK_ID_5,
    title: "new task",
    status: "in-progress",
    due: DATE_1,
    startedAt: DATE_2,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));
  await taskRepository.create(Task.create({
    id: TASK_ID_6,
    title: "new task",
    status: "in-progress",
    due: DATE_1,
    startedAt: DATE_2,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));

  // When
  const storeds = await taskRepository.findByStatus("unstarted");

  // Then
  assertEquals(storeds.length, 3);
  assertArrayIncludes(storeds.map(t => t.id), [TASK_ID_2, TASK_ID_5, TASK_ID_6]); // 順不同
});

Deno.test("該当するタスクが無いと空配列が返る。", async () => {
  const taskRepository = new PgDrizzleTaskRepository();

  // Given
  await taskRepository.create(Task.create({
    id: TASK_ID_1,
    title: "new task",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));
  await taskRepository.create(Task.create({
    id: TASK_ID_2,
    title: "new task",
    status: "in-progress",
    due: DATE_1,
    startedAt: DATE_2,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));
  // completed 無し
  // await taskRepository.create(Task.create({
  //   id: TASK_ID_3,
  //   title: "new task",
  //   status: "completed",
  //   due: DATE_1,
  //   startedAt: DATE_2,
  //   completedAt: DATE_3,
  //   createdAt: DATE_2,
  //   updatedAt: DATE_2
  // }));
  await taskRepository.create(Task.create({
    id: TASK_ID_4,
    title: "new task",
    status: "cancelled",
    due: DATE_1,
    startedAt: DATE_2,
    completedAt: DATE_3,
    cancelledAt: DATE_4,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));
  await taskRepository.create(Task.create({
    id: TASK_ID_5,
    title: "new task",
    status: "in-progress",
    due: DATE_1,
    startedAt: DATE_2,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));
  await taskRepository.create(Task.create({
    id: TASK_ID_6,
    title: "new task",
    status: "in-progress",
    due: DATE_1,
    startedAt: DATE_2,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));
  
  // When
  const storeds = await taskRepository.findByStatus("completed");

  // Then
  assertEquals(storeds.length, 0);
});

Deno.test("削除済みのタスクは結果に含まれない。", async () => {
  const taskRepository = new PgDrizzleTaskRepository();
  
  // Given
  await taskRepository.create(Task.create({
    id: TASK_ID_1,
    title: "new task",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));
  await taskRepository.create(Task.create({
    id: TASK_ID_2,
    title: "new task",
    status: "in-progress",
    due: DATE_1,
    startedAt: DATE_2,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));
  await taskRepository.create(Task.create({
    id: TASK_ID_3,
    title: "new task",
    status: "completed",
    due: DATE_1,
    startedAt: DATE_2,
    completedAt: DATE_3,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));
  await taskRepository.create(Task.create({
    id: TASK_ID_4,
    title: "new task",
    status: "cancelled",
    due: DATE_1,
    startedAt: DATE_2,
    completedAt: DATE_3,
    cancelledAt: DATE_4,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));
  await taskRepository.create(Task.create({
    id: TASK_ID_5,
    title: "new task",
    status: "in-progress",
    due: DATE_1,
    startedAt: DATE_2,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));
  await taskRepository.create(Task.create({
    id: TASK_ID_6,
    title: "new task",
    status: "in-progress",
    due: DATE_1,
    startedAt: DATE_2,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));

  taskRepository.delete(TASK_ID_5)

  // When
  const storeds = await taskRepository.findByStatus("unstarted");

  // Then
  assertEquals(storeds.length, 2);
  assertArrayIncludes(storeds.map(t => t.id), [TASK_ID_2, TASK_ID_6]); // 順不同
});
