import { assertEquals, assertArrayIncludes } from "@std/assert";
import { Task } from "@feature/Task/domain/Task.ts";
import { TASK_ID_1, DATE_1, DATE_2, TASK_ID_2, TASK_ID_3, TASK_ID_4, TASK_ID_5, TASK_ID_6, DATE_4, DATE_3 } from "../../../helper.ts";
import { createDependencies } from "@deps/CompositionRoot.ts";
import { dbTest } from "./helper.ts";

Deno.test("[integration] PgDrizzleTaskRepository.searchByStatus", async t => {
  await using deps = await createDependencies("pg-drizzle");

  await t.step("指定した status のタスクを取得できる。", () =>
    dbTest(deps, async tx => {
      // Given
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_1,
        title: "new task",
        status: "unstarted",
        due: DATE_1,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);

      // When
      const storeds = await deps.taskRepository.searchByStatus("unstarted", tx);

      // Then
      assertEquals(storeds.length, 1);
      assertEquals(storeds[0].id, TASK_ID_1);
    })
  );

  await t.step("すべての種類のタスクの中から指定した status のタスクをすべて取得できる。", () =>
    dbTest(deps, async tx => {
      // Given
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_1,
        title: "new task",
        status: "unstarted",
        due: DATE_1,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_2,
        title: "new task",
        status: "in-progress",
        due: DATE_1,
        startedAt: DATE_2,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_3,
        title: "new task",
        status: "completed",
        due: DATE_1,
        startedAt: DATE_2,
        completedAt: DATE_3,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_4,
        title: "new task",
        status: "cancelled",
        due: DATE_1,
        startedAt: DATE_2,
        completedAt: DATE_3,
        cancelledAt: DATE_4,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_5,
        title: "new task",
        status: "in-progress",
        due: DATE_1,
        startedAt: DATE_2,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_6,
        title: "new task",
        status: "in-progress",
        due: DATE_1,
        startedAt: DATE_2,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);

      // When
      const storeds = await deps.taskRepository.searchByStatus("in-progress", tx);

      // Then
      assertEquals(storeds.length, 3);
      assertArrayIncludes(storeds.map(t => t.id), [TASK_ID_2, TASK_ID_5, TASK_ID_6]); // 順不同
    })
  );

  await t.step("該当するタスクが無いと空配列が返る。", () =>
    dbTest(deps, async tx => {
      // Given
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_1,
        title: "new task",
        status: "unstarted",
        due: DATE_1,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_2,
        title: "new task",
        status: "in-progress",
        due: DATE_1,
        startedAt: DATE_2,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);
      // completed 無し
      // await deps.taskRepository.create(Task.create({
      //   id: TASK_ID_3,
      //   title: "new task",
      //   status: "completed",
      //   due: DATE_1,
      //   startedAt: DATE_2,
      //   completedAt: DATE_3,
      //   createdAt: DATE_2,
      //   updatedAt: DATE_2
      // }));
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_4,
        title: "new task",
        status: "cancelled",
        due: DATE_1,
        startedAt: DATE_2,
        completedAt: DATE_3,
        cancelledAt: DATE_4,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_5,
        title: "new task",
        status: "in-progress",
        due: DATE_1,
        startedAt: DATE_2,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_6,
        title: "new task",
        status: "in-progress",
        due: DATE_1,
        startedAt: DATE_2,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);

      // When
      const storeds = await deps.taskRepository.searchByStatus("completed", tx);

      // Then
      assertEquals(storeds.length, 0);
    })
  );

  await t.step("削除済みのタスクは結果に含まれない。", () =>
    dbTest(deps, async tx => {
      // Given
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_1,
        title: "new task",
        status: "unstarted",
        due: DATE_1,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_2,
        title: "new task",
        status: "in-progress",
        due: DATE_1,
        startedAt: DATE_2,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_3,
        title: "new task",
        status: "completed",
        due: DATE_1,
        startedAt: DATE_2,
        completedAt: DATE_3,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_4,
        title: "new task",
        status: "cancelled",
        due: DATE_1,
        startedAt: DATE_2,
        completedAt: DATE_3,
        cancelledAt: DATE_4,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_5,
        title: "new task",
        status: "in-progress",
        due: DATE_1,
        startedAt: DATE_2,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_6,
        title: "new task",
        status: "in-progress",
        due: DATE_1,
        startedAt: DATE_2,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);

      await deps.taskRepository.delete(TASK_ID_5, tx)

      // When
      const storeds = await deps.taskRepository.searchByStatus("in-progress", tx);

      // Then
      assertEquals(storeds.length, 2);
      assertArrayIncludes(storeds.map(t => t.id), [TASK_ID_2, TASK_ID_6]); // 順不同
    })
  );

});