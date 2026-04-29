import { Task, UNSPECIFIED } from "@feature/Task/domain/Task.ts";
import { DATE_1, DATE_2, DATE_3, DATE_4, DATE_5, DATE_6, TASK_ID_1, TASK_ID_2 } from "../../../helper.ts";
import { assertEquals, assertRejects } from "@std/assert";

Deno.test("新規にタスクを作成すると保存される（指定したIDで保存され取得できる）。", async () => {
  const taskRepository = new PgDrizzleTaskRepository();
  
  // Given
  const task = Task.create({
    id: TASK_ID_1,
    title: "new task",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  });

  // When
  await taskRepository.create(task);

  // Then
  const stored = await taskRepository.findById(task.id);
  assertEquals(stored, task);
});

Deno.test("すでに存在するIDで作成しようとすると IdAlreadyExists エラーになる。", async () => {
  const taskRepository = new PgDrizzleTaskRepository();
  
  // Given
  const other = Task.create({
    id: TASK_ID_1,
    title: "other task",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  });
  await taskRepository.create(other);

  const task = Task.create({
    id: other.id,
    title: "task",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  });

  // When・Then
  await assertRejects(() => 
    taskRepository.create(task),
    IdAlreadyExistsError
  );
});

Deno.test("複数作成できる。", async () => {
  const taskRepository = new PgDrizzleTaskRepository();
  
  // Given
  const task1 = Task.create({
    id: TASK_ID_1,
    title: "task1",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  });
  const task2 = Task.create({
    id: TASK_ID_2,
    title: "task2",
    status: "in-progress",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  });
  
  // When
  await taskRepository.create(task1);
  await taskRepository.create(task2);

  // Then
  const stored1 = taskRepository.findById(TASK_ID_1);
  const stored2 = taskRepository.findById(TASK_ID_2);
  assertEquals(stored1, task1);
  assertEquals(stored2, task2);
});

Deno.test("cancelled タスクのすべてのプロパティを保存できる", async () => {
  const taskRepository = new PgDrizzleTaskRepository();
  
  // Given
  const task = Task.create({
    id: TASK_ID_1,
    title: "new task",
    status: "cancelled",
    due: DATE_1,
    startedAt: DATE_2,
    completedAt: DATE_3,
    cancelledAt: DATE_4,
    createdAt: DATE_5,
    updatedAt: DATE_6
  });

  // When
  await taskRepository.create(task);

  // Then
  const stored = await taskRepository.findById(task.id);
  assertEquals(stored, task);
});

Deno.test("Date が指定されたタスクを正しく作成できる。", async () => {
  const taskRepository = new PgDrizzleTaskRepository();
  
  // Given
  const task = Task.create({
    id: TASK_ID_1,
    title: "new task",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  });

  // When
  await taskRepository.create(task);

  // Then
  const stored = await taskRepository.findById(task.id);
  assertEquals(stored.due, task.due);
});

Deno.test("UNSPECIFIED が指定されたタスクを正しく作成できる。", async () => {
  const taskRepository = new PgDrizzleTaskRepository();
  
  // Given
  const task = Task.create({
    id: TASK_ID_1,
    title: "new task",
    status: "unstarted",
    due: UNSPECIFIED,
    createdAt: DATE_2,
    updatedAt: DATE_2
  });

  // When
  await taskRepository.create(task);

  // Then
  const stored = await taskRepository.findById(task.id);
  assertEquals(stored.due, task.due);
});
