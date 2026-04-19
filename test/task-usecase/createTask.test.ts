import { assert, assertEquals, assertRejects } from "@std/assert";
import { createDependencies } from "../../deps/CompositionRoot.ts";
import { fixedClock } from "./helper.ts";

Deno.test("title, status, due を指定して未完了タスクを作成できる", async () => {
  const { createTaskUseCase } = createDependencies("in-memory");

  // Given・When
  const created = await createTaskUseCase.execute({
    title: "task",
    status: "unstarted",
    due: new Date("2026-10-01T00:00:00Z"),
  });

  // Then
  assert(created.id.length > 0);
  assertEquals(created.title, "task");
  assertEquals(created.status, "unstarted");
  assertEquals(created.due?.getTime(), new Date("2026-10-01T00:00:00Z").getTime());
});


Deno.test("due の日時が不正なタスクは作成できない", async () => {
  const { createTaskUseCase } = createDependencies("in-memory");
  await assertRejects(() => createTaskUseCase.execute({ 
    title: "task",
    status: "unstarted",
    due: new Date("Invalid Date")
  }));
});

Deno.test("startedAt の日時が不正なタスクは作成できない", async () => {
  const { createTaskUseCase } = createDependencies("in-memory");
  await assertRejects(() => createTaskUseCase.execute({
    title: "task",
    status: "in-progress",
    due: null,
    startedAt: new Date("Invalid Date")
  }));
});

Deno.test("completedAt の日時が不正なタスクは作成できない", async () => {
  const { createTaskUseCase } = createDependencies("in-memory");
  await assertRejects(() => createTaskUseCase.execute({ 
    title: "task", 
    status: "completed",
    due: null, 
    startedAt: null, 
    completedAt: new Date("Invalid Date")
  }));
});

Deno.test("cancelledAt の日時が不正なタスクは作成できない", async () => {
  const { createTaskUseCase } = createDependencies("in-memory");
  await assertRejects(() => 
    createTaskUseCase.execute({ 
      title: "task", 
      status: "cancelled",
      due: null,
      startedAt: null,
      completedAt: null,
      cancelledAt: new Date("Invalid Date")
    })
  );
});

Deno.test("createdAt がタスクの新規作成時の日時になる ", async () => {
  const expectedCreatedAt = new Date("2026-04-01T00:00:00Z");
  const { createTaskUseCase } = createDependencies("in-memory", {
    clock: fixedClock(expectedCreatedAt)
  });

  // When
  const created = await createTaskUseCase.execute({
    title: "task",
    status: "unstarted",
    due: null,
  });

  // Then
  assertEquals(created.createdAt.getTime(), expectedCreatedAt.getTime());
});

Deno.test("タスクの新規作成時は updatedAt が createdAt と同じ日時になる", async () => {
  const { createTaskUseCase } = createDependencies("in-memory");

  // When
  const created = await createTaskUseCase.execute({
    title: "task",
    status: "unstarted",
    due: null,
  });

  // Then
  assertEquals(created.updatedAt.getTime(), created.createdAt.getTime());
});