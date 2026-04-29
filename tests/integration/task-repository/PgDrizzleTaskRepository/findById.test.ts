import { assertEquals } from "@std/assert";
import { Task, UNSPECIFIED } from "@feature/Task/domain/Task.ts";
import { TASK_ID_1, DATE_1, DATE_2, TASK_ID_2, TASK_ID_3, DATE_3, DATE_4, DATE_5 } from "../../../helper.ts";

Deno.test("存在するタスクのIDを指定して取得できる。", async () => {
  const taskRepository = new PgDrizzleTaskRepository();
  
  // Given
  await taskRepository.create(Task.create({
    id: TASK_ID_1,
    title: "task",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));

  // When
  const stored = await taskRepository.findById(TASK_ID_1);

  // Then
  assertEquals(stored.id, TASK_ID_1);
});

Deno.test("複数のタスクの中から取得できる。", async () => {
  const taskRepository = new PgDrizzleTaskRepository();
  
  // Given
  await taskRepository.create(Task.create({
    id: TASK_ID_1,
    title: "task1",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));
  await taskRepository.create(Task.create({ // 取得対象
    id: TASK_ID_2,
    title: "task2",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));
  await taskRepository.create(Task.create({
    id: TASK_ID_3,
    title: "task3",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));

  // When
  const stored = await taskRepository.findById(TASK_ID_2);

  // Then
  assertEquals(stored.id, TASK_ID_2);
});

Deno.test("存在しないタスクのIDを指定するとエラーになる。", async () => {
  throw "TODO";
});

Deno.test("削除済みのタスクのIDを指定するとエラーになる。", async () => {
  throw "TODO";
});

Deno.test("作成時に指定したタスクと同等のものが取得できる（UNSPECIFIED含め）。", async () => {
  const taskRepository = new PgDrizzleTaskRepository();
  
  // Given
  const task = Task.create({
    id: TASK_ID_1,
    title: "task",
    status: "unstarted",
    due: UNSPECIFIED,
    startedAt: DATE_2,
    completedAt: UNSPECIFIED,
    cancelledAt: DATE_3,
    createdAt: DATE_4,
    updatedAt: DATE_5
  });
  await taskRepository.create(task);

  // When
  const stored = await taskRepository.findById(task.id);

  // Then
  assertEquals(stored, task);
});