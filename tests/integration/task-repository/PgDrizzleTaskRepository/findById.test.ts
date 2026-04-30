import { assertEquals, assertRejects } from "@std/assert";
import { Task, UNSPECIFIED } from "@feature/Task/domain/Task.ts";
import { TASK_ID_1, DATE_1, DATE_2, TASK_ID_2, TASK_ID_3, DATE_3, DATE_4, DATE_5 } from "../../../helper.ts";
import { dbTest, pgDrizzleDbTestAllSetup } from "./helper.ts";
import { NotFoundError } from "@common/Error/NotFoundError/NotFoundError.ts";

Deno.test("[integration] PgDrizzleTaskRepository.findById", async t => {
  await using deps = await pgDrizzleDbTestAllSetup();

  await t.step("存在するタスクのIDを指定して取得できる。", () =>
    dbTest(deps, async tx => {
      // Given
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_1,
        title: "task",
        status: "unstarted",
        due: DATE_1,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);

      // When
      const stored = await deps.taskRepository.findById(TASK_ID_1, tx);

      // Then
      assertEquals(stored.id, TASK_ID_1);
    })
  );

  await t.step("複数のタスクの中から取得できる。", () =>
    dbTest(deps, async tx => {
      // Given
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_1,
        title: "task1",
        status: "unstarted",
        due: DATE_1,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);
      await deps.taskRepository.create(Task.create({ // 取得対象
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

      // When
      const stored = await deps.taskRepository.findById(TASK_ID_2, tx);

      // Then
      assertEquals(stored.id, TASK_ID_2);
    })
  );

  await t.step("存在しないタスクのIDを指定するとNotFoundErrorが発生する。", () =>
    dbTest(deps, async tx => {
      // Given
      const dummy = Task.create({
        id: TASK_ID_1,
        title: "dummy",
        status: "unstarted",
        due: DATE_1,
        createdAt: DATE_2,
        updatedAt: DATE_2
      });
      await deps.taskRepository.create(dummy, tx);

      // When・Then
      await assertRejects(() =>
        deps.taskRepository.findById("Not exist ID", tx),
        NotFoundError
      );
    })
  );

  await t.step("削除済みのタスクのIDを指定するとエラーになる。", () =>
    dbTest(deps, async tx => {
      // Given
      const created = Task.create({
        id: TASK_ID_1,
        title: "test",
        status: "unstarted",
        due: DATE_1,
        createdAt: DATE_2,
        updatedAt: DATE_2
      });
      await deps.taskRepository.create(created, tx);
      await deps.taskRepository.delete(created.id, tx);

      // When・Then
      await assertRejects(() =>
        deps.taskRepository.findById(created.id, tx),
        NotFoundError
      );
    })
  );

  await t.step("作成時に指定したタスクと同等のものが取得できる（UNSPECIFIED含め）。", () =>
    dbTest(deps, async tx => {
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
      await deps.taskRepository.create(task, tx);

      // When
      const stored = await deps.taskRepository.findById(task.id, tx);

      // Then
      assertEquals(stored, task);
    })
  );

});