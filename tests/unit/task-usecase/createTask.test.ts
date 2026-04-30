import { assertEquals, assertExists, assertRejects, unreachable } from "@std/assert";
import { createDependencies } from "@deps/CompositionRoot.ts";
import { DATE_1, fixedClock, TASK_ID_1, TASK_ID_2, TASK_ID_3 } from "../../helper.ts";
import { UNSPECIFIED } from "@feature/Task/domain/Task.ts";
import { ValidationError } from "@common/Error/ValidationError/ValidationError.ts";

Deno.test("タスクを作成すると取得できるようになる", async () => {
  const deps = await createDependencies("in-memory");

  // Given・When
  const created = await deps.createTaskUseCase.execute({
    title: "task",
    status: "unstarted",
    due: DATE_1,
  });

  // Then
  const got = await deps.findTaskByIdUseCase.execute({ id: created.id });

  assertExists(got);
});

Deno.test("異常なタスクを作成しようとするとエラーになる", async () => {
  const deps = await createDependencies("in-memory");

  // Given・When・Then
  await assertRejects(() => 
    deps.createTaskUseCase.execute({
      title: "task",
      status: "in-progress",
      due: DATE_1,
      // startedAt がない
    }),
    ValidationError
  );
});

Deno.test("createdAt がタスクの新規作成時の日時になる ", async () => {
  const expectedCreatedAt = DATE_1;
  const deps = await createDependencies("in-memory", {
    clock: fixedClock(expectedCreatedAt)
  });

  // When
  const created = await deps.createTaskUseCase.execute({
    title: "task",
    status: "unstarted",
    due: UNSPECIFIED,
  });

  // Then
  assertEquals(created.createdAt, expectedCreatedAt);
});

Deno.test("タスクの新規作成時は updatedAt が createdAt と同じ日時になる", async () => {
  const deps = await createDependencies("in-memory");

  // When
  const created = await deps.createTaskUseCase.execute({
    title: "task",
    status: "unstarted",
    due: UNSPECIFIED,
  });

  // Then
  assertEquals(created.updatedAt, created.createdAt);
});

Deno.test("IDが重複すると内部で再試行され、重複しないものになる", async () => {
  const idGenerator = {
    ids: [
      // 1つ目のタスクのID
      TASK_ID_1,
      // 2つ目のタスクのID
      TASK_ID_2,
      // 3つ目のタスクのID（試行順）
      TASK_ID_1, TASK_ID_2, TASK_ID_3
    ].values(),

    generate() {
      // 順番通りにIDを返す
      return Promise.resolve(this.ids.next().value ?? unreachable())
    }
  };

  const deps = await createDependencies("in-memory", { idGenerator });

  // Given
  await deps.createTaskUseCase.execute({
    title: "ID1 を持つタスク",
    status: "unstarted",
    due: DATE_1,
  });
  await deps.createTaskUseCase.execute({
    title: "ID2 を持つタスク",
    status: "unstarted",
    due: DATE_1,
  });

  // When  
  const created = await deps.createTaskUseCase.execute({
    title: "task",
    status: "unstarted",
    due: DATE_1,
  });

  // Then
  assertEquals(created.id, TASK_ID_3);

  const stored = await deps.findTaskByIdUseCase.execute({ id: created.id });
  assertEquals(stored.id, TASK_ID_3);
});

Deno.test("何度もIDが重複しても無限ループにならずにエラーになる", async () => {
  const idGenerator = {
    generate() {
      // 同じIDを返し続ける
      return Promise.resolve(TASK_ID_1);
    } 
  };

  const deps = await createDependencies("in-memory", { idGenerator });

  // Given
  await deps.createTaskUseCase.execute({
    title: "ID1 を持つタスク",
    status: "unstarted",
    due: DATE_1,
  });

  // When・Then
  await assertRejects(() => 
    deps.createTaskUseCase.execute({
      title: "task",
      status: "unstarted",
      due: DATE_1,
    })
  );
});