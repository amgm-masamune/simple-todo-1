import { assertEquals, assertExists, assertRejects } from "@std/assert";
import { createDependencies } from "@deps/CompositionRoot.ts";
import { DATE_1, fixedClock } from "../helper.ts";
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
