import { assertEquals } from "@std/assert/equals";
import { Task, UNSPECIFIED } from "@feature/Task/domain/Task.ts";
import { TASK_ID_1, DATE_1, DATE_2, DATE_3, TASK_ID_2, TASK_ID_3, DATE_4 } from "../../../helper.ts";
import { assertRejects } from "@std/assert/rejects";
import { NotFoundError } from "@common/Error/NotFoundError/NotFoundError.ts";

Deno.test("タスクを更新するとその後取得した時に更新後の状態になる", async () => {
  const taskRepository = new PgDrizzleTaskRepository();
  
  // Given
  const original = Task.create({
    id: TASK_ID_1,
    title: "new task",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  });
  await taskRepository.create(original);
  
  // When
  const updated = original.withTitle("updated task", DATE_3)
  taskRepository.update(updated);

  // Then
  const stored = await taskRepository.findById(original.id);
  assertEquals(stored, updated);
});

Deno.test("複数のタスクが存在する時、指定したタスクのみ更新される", async () => {
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
  const task2 = Task.create({ // 更新対象
    id: TASK_ID_2,
    title: "task2",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  });
  const task3 = Task.create({
    id: TASK_ID_3,
    title: "task3",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  });
  taskRepository.create(task1);
  taskRepository.create(task2); // 更新対象
  taskRepository.create(task3);

  // When
  const updated = task2.withTitle("updated task2", DATE_3)
  taskRepository.update(updated);

  // Then
  // 更新対象が更新されていること
  const stored2 = await taskRepository.findById(task2.id);
  assertEquals(stored2, updated);
  // 更新対象以外が変更されていないこと
  const stored1 = await taskRepository.findById(task1.id);
  const stored3 = await taskRepository.findById(task3.id);
  assertEquals(stored1, task1);
  assertEquals(stored3, task3);
});

Deno.test("存在しないタスクを更新しようとするとNotFoundErrorが発生する", async () => {
  const taskRepository = new PgDrizzleTaskRepository();
  
  // Given
  await taskRepository.create(Task.create({
    id: TASK_ID_1,
    title: "dummy",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));
  
  // When・Then
  assertRejects(() => 
    taskRepository.update(Task.create({
      id: "Not Existed ID",
      title: "Not existed", 
      status: "unstarted",
      due: DATE_1,
      createdAt: DATE_2,
      updatedAt: DATE_3
    })),
    NotFoundError
  );
});

Deno.test("削除済みのタスクを更新しようとするとNotFoundErrorが発生する", async () => {
  const taskRepository = new PgDrizzleTaskRepository();
  
  // Given
  const willBeDeleted = Task.create({
    id: TASK_ID_1,
    title: "will be deleted",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  });
  await taskRepository.create(willBeDeleted);
  await taskRepository.delete(willBeDeleted.id);
  
  // When・Then
  assertRejects(() => 
    taskRepository.update(willBeDeleted.withTitle("deleted", DATE_2)),
    NotFoundError
  );
});

Deno.test("更新時の Date の指定が正しく更新される", async () => {
  const taskRepository = new PgDrizzleTaskRepository();
  
  // Given
  const original = Task.create({
    id: TASK_ID_1,
    title: "new task",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  });
  await taskRepository.create(original);
  
  // When
  const updated = original.withDue(DATE_4, DATE_3);
  taskRepository.update(updated);

  // Then
  const stored = await taskRepository.findById(original.id);
  assertEquals(stored, updated);
});

Deno.test("更新時の UNSPECIFIED の指定が正しく更新される", , async () => {
  const taskRepository = new PgDrizzleTaskRepository();
  
  // Given
  const original = Task.create({
    id: TASK_ID_1,
    title: "new task",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  });
  await taskRepository.create(original);
  
  // When
  const updated = original.withDue(UNSPECIFIED, DATE_3)
  taskRepository.update(updated);

  // Then
  const stored = await taskRepository.findById(original.id);
  assertEquals(stored, updated);
});