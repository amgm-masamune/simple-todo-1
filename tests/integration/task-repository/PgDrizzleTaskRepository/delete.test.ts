import { assertEquals, assertRejects } from "@std/assert";
import { NotFoundError } from "@common/Error/NotFoundError/NotFoundError.ts";
import { Task } from "@feature/Task/domain/Task.ts";
import { TASK_ID_1, DATE_1, DATE_2, TASK_ID_2, TASK_ID_3 } from "../../../helper.ts";

Deno.test("存在するタスクを削除すると、その後取得できなくなる。", async () => {
  const taskRepository = new PgDrizzleTaskRepository();
  
  // Given：削除するタスクを用意
  const task = Task.create({
    id: TASK_ID_1,
    title: "task",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  });
  await taskRepository.create(task);
  const stored = await taskRepository.findById(task.id);
  
  // When：タスクを削除
  await taskRepository.delete(stored.id);

  // Then：削除されたタスクが取得できない
  assertRejects(() => 
    taskRepository.findById(stored.id),
    NotFoundError
  );
});

Deno.test("複数のタスクが存在する時、指定したタスクのみ削除される。", async () => {
  const taskRepository = new PgDrizzleTaskRepository();
  
  // Given：削除対象を含む複数のタスクを用意
  taskRepository.create(Task.create({
    id: TASK_ID_1,
    title: "task1",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));
  taskRepository.create(Task.create({ // 削除対象
    id: TASK_ID_2,
    title: "task2",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));
  taskRepository.create(Task.create({
    id: TASK_ID_3,
    title: "task3",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));
  const storedOnCreated1 = await taskRepository.findById(TASK_ID_1);
  const storedOnCreated2 = await taskRepository.findById(TASK_ID_2); // 削除対象
  const storedOnCreated3 = await taskRepository.findById(TASK_ID_3);

  // When：削除対象のみ削除
  await taskRepository.delete(storedOnCreated2.id);

  // Then：削除対象が削除されている・削除対象以外が変更されていない
  // - 削除対象が削除されていること
  assertRejects(() => 
    taskRepository.findById(storedOnCreated2.id),
    NotFoundError
  );
  
  // - 削除対象以外が変更されていないこと
  const stored1 = await taskRepository.findById(storedOnCreated1.id);
  const stored3 = await taskRepository.findById(storedOnCreated3.id);
  assertEquals(stored1, storedOnCreated1);
  assertEquals(stored3, storedOnCreated3);
});

Deno.test("存在しないタスクのIDを指定するとNotFoundErrorが発生する。", async () => {
  const taskRepository = new PgDrizzleTaskRepository();
  
  // Given：リポジトリに何らかのタスクが存在する状態を用意
  await taskRepository.create(Task.create({
    id: TASK_ID_1,
    title: "dummy",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));
  
  // When：存在しないIDを削除
  // Then：NotFoundErrorが発生
  assertRejects(() => 
    taskRepository.delete(TASK_ID_2), // 作成していないID
    NotFoundError
  );
});

Deno.test("削除済みのタスクのIDを指定するとNotFoundErrorが発生する。", async () => {
  const taskRepository = new PgDrizzleTaskRepository();
  
  // Given：タスクが削除された状態を用意
  await taskRepository.create(Task.create({
    id: TASK_ID_1,
    title: "will be deleted",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_2
  }));
  const stored = taskRepository.findById(TASK_ID_1);

  taskRepository.delete(stored.id);
  
  // When：タスクを削除
  // Then：NotFoundErrorが発生
  assertRejects(() => 
    taskRepository.delete(stored.id),
    NotFoundError
  );
});
