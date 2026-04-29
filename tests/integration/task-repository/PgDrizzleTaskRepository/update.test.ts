import { assertEquals, assertRejects } from "@std/assert";
import { Task, UNSPECIFIED } from "@feature/Task/domain/Task.ts";
import { TASK_ID_1, DATE_1, DATE_2, DATE_3, TASK_ID_2, TASK_ID_3, DATE_4 } from "../../../helper.ts";
import { NotFoundError } from "@common/Error/NotFoundError/NotFoundError.ts";
import { createDependencies } from "@deps/CompositionRoot.ts";
import { dbTest } from "./helper.ts";

Deno.test("[integration] PgDrizzleTaskRepository.update", async t => {
  await using deps = await createDependencies("pg-drizzle");

  await t.step("タスクを更新するとその後取得した時に更新後の状態になる", () =>
    dbTest(deps, async tx => {
      // Given
      const original = Task.create({
        id: TASK_ID_1,
        title: "new task",
        status: "unstarted",
        due: DATE_1,
        createdAt: DATE_2,
        updatedAt: DATE_2
      });
      await deps.taskRepository.create(original, tx);

      // When
      const updated = original.withTitle("updated task", DATE_3)
      await deps.taskRepository.update(updated, tx);

      // Then
      const stored = await deps.taskRepository.findById(original.id, tx);
      assertEquals(stored, updated);
    })
  );

  await t.step("複数のタスクが存在する時、指定したタスクのみ更新される", () =>
    dbTest(deps, async tx => {
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
      await deps.taskRepository.create(task1, tx);
      await deps.taskRepository.create(task2, tx); // 更新対象
      await deps.taskRepository.create(task3, tx);

      // When
      const updated = task2.withTitle("updated task2", DATE_3)
      await deps.taskRepository.update(updated, tx);

      // Then
      // 更新対象が更新されていること
      const stored2 = await deps.taskRepository.findById(task2.id, tx);
      assertEquals(stored2, updated);
      // 更新対象以外が変更されていないこと
      const stored1 = await deps.taskRepository.findById(task1.id, tx);
      const stored3 = await deps.taskRepository.findById(task3.id, tx);
      assertEquals(stored1, task1);
      assertEquals(stored3, task3);
    })
  );

  await t.step("存在しないタスクを更新しようとするとNotFoundErrorが発生する", () =>
    dbTest(deps, async tx => {
      // Given
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_1,
        title: "dummy",
        status: "unstarted",
        due: DATE_1,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);

      // When・Then
      await assertRejects(() =>
        deps.taskRepository.update(Task.create({
          id: "Not Existed ID",
          title: "Not existed",
          status: "unstarted",
          due: DATE_1,
          createdAt: DATE_2,
          updatedAt: DATE_3
        }), tx),
        NotFoundError
      );
    })
  );

  await t.step("削除済みのタスクを更新しようとするとNotFoundErrorが発生する", () =>
    dbTest(deps, async tx => {
      // Given
      const willBeDeleted = Task.create({
        id: TASK_ID_1,
        title: "will be deleted",
        status: "unstarted",
        due: DATE_1,
        createdAt: DATE_2,
        updatedAt: DATE_2
      });
      await deps.taskRepository.create(willBeDeleted, tx);
      await deps.taskRepository.delete(willBeDeleted.id, tx);

      // When・Then
      await assertRejects(() =>
        deps.taskRepository.update(willBeDeleted.withTitle("deleted", DATE_2), tx),
        NotFoundError
      );
    })
  );

  await t.step("更新時の Date の指定が正しく更新される", () =>
    dbTest(deps, async tx => {
      // Given
      const original = Task.create({
        id: TASK_ID_1,
        title: "new task",
        status: "unstarted",
        due: DATE_1,
        createdAt: DATE_2,
        updatedAt: DATE_2
      });
      await deps.taskRepository.create(original, tx);

      // When
      const updated = original.withDue(DATE_4, DATE_3);
      await deps.taskRepository.update(updated, tx);

      // Then
      const stored = await deps.taskRepository.findById(original.id, tx);
      assertEquals(stored, updated);
    })
  );

  await t.step("更新時の UNSPECIFIED の指定が正しく更新される", () =>
    dbTest(deps, async tx => {
      // Given
      const original = Task.create({
        id: TASK_ID_1,
        title: "new task",
        status: "unstarted",
        due: DATE_1,
        createdAt: DATE_2,
        updatedAt: DATE_2
      });
      await deps.taskRepository.create(original, tx);

      // When
      const updated = original.withDue(UNSPECIFIED, DATE_3)
      await deps.taskRepository.update(updated, tx);

      // Then
      const stored = await deps.taskRepository.findById(original.id, tx);
      assertEquals(stored, updated);
    })
  );

});