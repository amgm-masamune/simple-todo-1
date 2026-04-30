import { assertEquals, assertExists } from "@std/assert";
import { Task } from "@feature/Task/domain/Task.ts";
import { TASK_ID_1, DATE_1, DATE_2, TASK_ID_2, TASK_ID_3 } from "../../../helper.ts";
import { dbTest, pgDrizzleDbTestAllSetup } from "./helper.ts";

Deno.test("[integration] PgDrizzleTaskRepository.getAll", async t => {
  await using deps = await pgDrizzleDbTestAllSetup();

  await t.step("すべてのタスクを作成時と同等な状態で取得できる。", () =>
    dbTest(deps, async tx => {      // Given
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
      await deps.taskRepository.create(task2, tx);
      await deps.taskRepository.create(task3, tx);

      // When
      const storeds = await deps.taskRepository.getAll(tx);

      // Then
      assertEquals(storeds.length, 3);
      const stored1 = storeds.find(t => t.id === task1.id);
      const stored2 = storeds.find(t => t.id === task2.id);
      const stored3 = storeds.find(t => t.id === task3.id);
      assertExists(stored1);
      assertEquals(stored1, task1);
      assertExists(stored2);
      assertEquals(stored2, task2);
      assertExists(stored3);
      assertEquals(stored3, task3);
    })
  );

  await t.step("タスクが作成されていないと空配列が返る。", () =>
    dbTest(deps, async tx => {      // Given：何もしない

      // When
      const storeds = await deps.taskRepository.getAll(tx);

      // Then
      assertEquals(storeds.length, 0);
    })
  );

  await t.step("削除済みのタスクは結果に含まれない。", () =>
    dbTest(deps, async tx => {      // Given
      const task1 = Task.create({
        id: TASK_ID_1,
        title: "task1",
        status: "unstarted",
        due: DATE_1,
        createdAt: DATE_2,
        updatedAt: DATE_2
      });
      const task2 = Task.create({ // 削除対象
        id: TASK_ID_2,
        title: "task2",
        status: "unstarted",
        due: DATE_1,
        createdAt: DATE_2,
        updatedAt: DATE_2
      });
      await deps.taskRepository.create(task1, tx);
      await deps.taskRepository.create(task2, tx);

      await deps.taskRepository.delete(task2.id, tx);

      // When
      const storeds = await deps.taskRepository.getAll(tx);

      // Then
      assertEquals(storeds.length, 1);
      assertEquals(storeds.find(t => t.id === task2.id), undefined);
    })
  );

});