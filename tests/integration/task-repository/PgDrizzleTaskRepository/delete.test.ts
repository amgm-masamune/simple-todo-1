import { assertEquals, assertRejects } from "@std/assert";
import { NotFoundError } from "@common/Error/NotFoundError/NotFoundError.ts";
import { Task } from "@feature/Task/domain/Task.ts";
import { TASK_ID_1, DATE_1, DATE_2, TASK_ID_2, TASK_ID_3 } from "../../../helper.ts";
import { createDependencies } from "@deps/CompositionRoot.ts";
import { dbTest } from "./helper.ts";

Deno.test("[integration] PgDrizzleTaskRepository.delete", async t => {
  await using deps = await createDependencies("pg-drizzle");

  await t.step("存在するタスクを削除すると、その後取得できなくなる。", () =>
    dbTest(deps, async tx => {
      // Given：削除するタスクを用意
      const task = Task.create({
        id: TASK_ID_1,
        title: "task",
        status: "unstarted",
        due: DATE_1,
        createdAt: DATE_2,
        updatedAt: DATE_2
      });
      await deps.taskRepository.create(task, tx);
      const stored = await deps.taskRepository.findById(task.id, tx);

      // When：タスクを削除
      await deps.taskRepository.delete(stored.id, tx);

      // Then：削除されたタスクが取得できない
      await assertRejects(() =>
        deps.taskRepository.findById(stored.id, tx),
        NotFoundError
      );
    }));

  await t.step("複数のタスクが存在する時、指定したタスクのみ削除される。", () =>
    dbTest(deps, async tx => {
      // Given：削除対象を含む複数のタスクを用意
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_1,
        title: "task1",
        status: "unstarted",
        due: DATE_1,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);
      await deps.taskRepository.create(Task.create({ // 削除対象
        id: TASK_ID_2,
        title: "task2",
        status: "unstarted",
        due: DATE_1,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_3,
        title: "task3",
        status: "unstarted",
        due: DATE_1,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);
      const storedOnCreated1 = await deps.taskRepository.findById(TASK_ID_1, tx);
      const storedOnCreated2 = await deps.taskRepository.findById(TASK_ID_2, tx); // 削除対象
      const storedOnCreated3 = await deps.taskRepository.findById(TASK_ID_3, tx);

      // When：削除対象のみ削除
      await deps.taskRepository.delete(storedOnCreated2.id, tx);

      // Then：削除対象が削除されている・削除対象以外が変更されていない
      // - 削除対象が削除されていること
      await assertRejects(() =>
        deps.taskRepository.findById(storedOnCreated2.id, tx),
        NotFoundError
      );

      // - 削除対象以外が変更されていないこと
      const stored1 = await deps.taskRepository.findById(storedOnCreated1.id, tx);
      const stored3 = await deps.taskRepository.findById(storedOnCreated3.id, tx);
      assertEquals(stored1, storedOnCreated1);
      assertEquals(stored3, storedOnCreated3);
    }));

  await t.step("存在しないタスクのIDを指定するとNotFoundErrorが発生する。", () =>
    dbTest(deps, async tx => {
      // Given：リポジトリに何らかのタスクが存在する状態を用意
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_1,
        title: "dummy",
        status: "unstarted",
        due: DATE_1,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);

      // When：存在しないIDを削除
      // Then：NotFoundErrorが発生
      await assertRejects(() =>
        deps.taskRepository.delete(TASK_ID_2, tx), // 作成していないID
        NotFoundError
      );
    }));

  await t.step("削除済みのタスクのIDを指定するとNotFoundErrorが発生する。", () =>
    dbTest(deps, async tx => {
      // Given：タスクが削除された状態を用意
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_1,
        title: "will be deleted",
        status: "unstarted",
        due: DATE_1,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);
      const stored = await deps.taskRepository.findById(TASK_ID_1, tx);

      await deps.taskRepository.delete(stored.id, tx);

      // When：タスクを削除
      // Then：NotFoundErrorが発生
      await assertRejects(() =>
        deps.taskRepository.delete(stored.id, tx),
        NotFoundError
      );
    }));


});