import { Task, UNSPECIFIED } from "@feature/Task/domain/Task.ts";
import { DATE_1, DATE_2, DATE_3, DATE_4, DATE_5, DATE_6, TASK_ID_1, TASK_ID_2 } from "../../../helper.ts";
import { assertEquals, assertRejects } from "@std/assert";
import { IdAlreadyExistsError } from "@common/Error/IdAlreadyExistsError/IdAlreadyExistsError.ts";
import { createDependencies } from "@deps/CompositionRoot.ts";
import { dbTest } from "./helper.ts";

Deno.test("[integration] PgDrizzleTaskRepository.create", async t => {
  await using deps = await createDependencies("pg-drizzle");

  await t.step("タスクが登録されていない状態で新規にタスクを作成すると1件だけ作成される。", () =>
    dbTest(deps, async tx => {
      // Given
      // When
      await deps.taskRepository.create(Task.create({
        id: TASK_ID_1,
        title: "new task",
        status: "unstarted",
        due: DATE_1,
        createdAt: DATE_2,
        updatedAt: DATE_2
      }), tx);

      // Then
      const storeds = await deps.taskRepository.getAll(tx);
      assertEquals(storeds.length, 1);
      assertEquals(storeds[0].id, TASK_ID_1);
    })
  );

  await t.step("すでに存在するIDで作成しようとすると IdAlreadyExists エラーになる。", () =>
    dbTest(deps, async tx => {
      // Given
      const other = Task.create({
        id: TASK_ID_1,
        title: "other task",
        status: "unstarted",
        due: DATE_1,
        createdAt: DATE_2,
        updatedAt: DATE_2
      });
      await deps.taskRepository.create(other, tx);

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
        deps.taskRepository.create(task, tx),
        IdAlreadyExistsError
      );
    })
  );

  await t.step("複数作成できる。", () =>
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
      const task2 = Task.create({
        id: TASK_ID_2,
        title: "task2",
        status: "in-progress",
        due: DATE_1,
        startedAt: DATE_3,
        createdAt: DATE_2,
        updatedAt: DATE_2
      });

      // When
      await deps.taskRepository.create(task1, tx);
      await deps.taskRepository.create(task2, tx);

      // Then
      const stored1 = await deps.taskRepository.findById(TASK_ID_1, tx);
      const stored2 = await deps.taskRepository.findById(TASK_ID_2, tx);
      assertEquals(stored1, task1);
      assertEquals(stored2, task2);
    })
  );

  await t.step("cancelled タスクのすべてのプロパティを保存できる", () =>
    dbTest(deps, async tx => {
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
      await deps.taskRepository.create(task, tx);

      // Then
      const stored = await deps.taskRepository.findById(task.id, tx);
      assertEquals(stored, task); // 全てのプロパティが保存され取得できていることを確認。
    })
  );

  await t.step("Date が指定されたタスクを正しく作成できる。", () =>
    dbTest(deps, async tx => {
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
      await deps.taskRepository.create(task, tx);

      // Then
      const stored = await deps.taskRepository.findById(task.id, tx);
      assertEquals(stored.due, task.due);
    })
  );

  await t.step("UNSPECIFIED が指定されたタスクを正しく作成できる。", () =>
    dbTest(deps, async tx => {
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
      await deps.taskRepository.create(task, tx);

      // Then
      const stored = await deps.taskRepository.findById(task.id, tx);
      assertEquals(stored.due, task.due);
    })
  );
});

