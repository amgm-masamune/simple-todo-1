import { assertEquals, assert, assertRejects } from "@std/assert";
import { createDependencies } from "../../deps/CompositionRoot.ts";
import { fixedClock } from "./helper.ts";

const DATE_1 = new Date("2026-04-01T00:00:00Z");
const DATE_2 = new Date("2026-04-02T00:00:00Z");
const DATE_3 = new Date("2026-04-03T00:00:00Z");
const DATE_4 = new Date("2026-04-04T00:00:00Z");

Deno.test("タスクを更新した返り値は更新後のタスクになっている", async () => {
  const { 
    createTaskUseCase,
    updateTaskUseCase,
  } = createDependencies("in-memory");

  // Given
  const original = await createTaskUseCase.execute({
    title: "original",
    status: "unstarted",
    due: null
  });

  // When
  const updated = await updateTaskUseCase.execute({
    id: original.id,
    title: "updated"
  });

  // Then
  assertEquals(updated.id, original.id);
  assertEquals(updated.title, "updated");
});

Deno.test("タスクの更新がリポジトリに保存され、findByIdで更新後を取得できる", async () => {
  const { 
    createTaskUseCase,
    updateTaskUseCase,
    findTaskByIdUseCase
  } = createDependencies("in-memory");

  // Given
  const original = await createTaskUseCase.execute({
    title: "original",
    status: "unstarted",
    due: null
  });

  // When
  await updateTaskUseCase.execute({
    id: original.id,
    title: "updated"
  });

  // Then
  const stored = await findTaskByIdUseCase.execute({ id: original.id });
  assertEquals(stored.id, original.id);
  assertEquals(stored.title, "updated");
});

Deno.test("cancelled の status 以外のすべてのパラメータを指定してタスクを更新できる", async () => {
  const {
    createTaskUseCase,
    updateTaskUseCase,
  } = createDependencies("in-memory");

  // Given
  const original = await createTaskUseCase.execute({
    title: "original",
    status: "cancelled",
    due: null,
    startedAt: null,
    completedAt: null,
    cancelledAt: null
  });

  // When
  const updated = await updateTaskUseCase.execute({
    id: original.id,
    title: "updated",
    due: DATE_1,
    startedAt: DATE_2,
    completedAt: DATE_3,
    cancelledAt: DATE_4
  });

  // Then
  assertEquals(updated.title, "updated");
  assertEquals(updated.due?.toISOString(), DATE_1.toISOString());
  assertEquals(updated.startedAt?.toISOString(), DATE_2.toISOString());
  assertEquals(updated.completedAt?.toISOString(), DATE_3.toISOString());
  assertEquals(updated.cancelledAt?.toISOString(), DATE_4.toISOString());
});

Deno.test("未着手への変更の際に startedAt・completed を指定しても undefined になる", async () => {
  const { 
    createTaskUseCase,
    updateTaskUseCase,
  } = createDependencies("in-memory");

  // Given
  const original = await createTaskUseCase.execute({
    title: "task",
    status: "in-progress",
    due: null,
    startedAt: new Date("2026-04-01T00:00:00Z")
  });

  // When・Then
  const updated = await updateTaskUseCase.execute({ 
    id: original.id,
    status: "unstarted",
    due: null,
    startedAt: new Date("2026-05-01T00:00:00"),
    completedAt: new Date("2026-06-01T00:00:00"),
    cancelledAt: new Date("2026-07-01T00:00:00"),
  });

  // Then
  assertEquals(updated.startedAt, undefined);
  assertEquals(updated.completedAt, undefined);
  assertEquals(updated.cancelledAt, undefined);
});

Deno.test("未着手→進行中 の状態変更で startedAt を指定すると、その値で進行中になる。", async () => {
  const { createTaskUseCase, updateTaskUseCase } = createDependencies("in-memory");
  
  // Given
  const unstartedTask = await createTaskUseCase.execute({ title: "task", status: "unstarted", due: null });

  // When
  const updated = await updateTaskUseCase.execute({ id: unstartedTask.id, status: "in-progress", startedAt: new Date("2026-05-01T00:00:00Z") });

  // Then
  assertEquals(updated.status, "in-progress");
  assertEquals(updated.startedAt?.toISOString(), new Date("2026-05-01T00:00:00Z").toISOString());
});

Deno.test("未着手→進行中 の状態変更で、startedAt の指定がない(null指定もない)場合は変更できない", async () => {
  const { createTaskUseCase, updateTaskUseCase } = createDependencies("in-memory");
  
  /// Given
  const task = await createTaskUseCase.execute({ title: "task", status: "unstarted", due: null });

  // When・Then
  await assertRejects(() => 
    updateTaskUseCase.execute({ id: task.id, status: "in-progress" })
  );
});

Deno.test("進行中→完了 の状態変更で startedAt を指定しない場合、変更されない(nullにはならない)", async () => {
  const { createTaskUseCase, updateTaskUseCase } = createDependencies("in-memory");
  
  // Given
  const inProgressTask = await createTaskUseCase.execute({ title: "task", status: "in-progress", due: null, startedAt: new Date("2026-05-01T00:00:00Z") });

  // When
  const updated = await updateTaskUseCase.execute({ id: inProgressTask.id, status: "completed", completedAt: null });

  // Then
  assertEquals(updated.status, "completed");
  assertEquals(updated.startedAt?.toISOString(), inProgressTask.startedAt?.toISOString());
});

Deno.test("完了→進行中 の状態変更で startedAt を指定しない場合、変更されない(nullにはならない)", async () => {
  const { createTaskUseCase, updateTaskUseCase } = createDependencies("in-memory");
  
  // Given
  const inProgressTask = await createTaskUseCase.execute({ title: "task", status: "completed", due: null, startedAt: new Date("2026-05-01T00:00:00Z"), completedAt: new Date("2026-06-01T00:00:00Z") });

  // When
  const updated = await updateTaskUseCase.execute({ id: inProgressTask.id, status: "in-progress" });

  // Then
  assertEquals(updated.status, "in-progress");
  assertEquals(updated.startedAt?.toISOString(), inProgressTask.startedAt?.toISOString());
});

Deno.test("タスクを更新すると updatedAt も更新される", async () => {
  const expectedCreatedAt = DATE_1;
  const expectedUpdatedAt = DATE_2;
  const clock = fixedClock(expectedCreatedAt);
  const { 
    createTaskUseCase,
    updateTaskUseCase,
    findTaskByIdUseCase
   } = createDependencies("in-memory", { clock });

  // Given
  const original = await createTaskUseCase.execute({
    title: "task",
    status: "unstarted",
    due: null
  });

  clock.setNow(expectedUpdatedAt);

  // When
  await updateTaskUseCase.execute({ id: original.id, due: DATE_3 });

  // Then
  const updated = await findTaskByIdUseCase.execute({ id: original.id });
  assertEquals(updated.title, original.title);
  assertEquals(updated.due?.toISOString(), DATE_3.toISOString());
  assertEquals(updated.createdAt.toISOString(), expectedCreatedAt.toISOString());
  assertEquals(updated.updatedAt.toISOString(), expectedUpdatedAt.toISOString());
  assert(updated.updatedAt.getTime() > updated.createdAt.getTime());
});



Deno.test("何も指定せずに update してもエラーにならないが、updatedAt は更新されない", async () => {
  const createdAt = new Date("2026-04-01T00:00:00Z");
  const updatedAt = new Date("2026-04-02T00:00:00Z");
  const clock = fixedClock(createdAt);
  const { 
    createTaskUseCase,
    updateTaskUseCase
   } = createDependencies("in-memory", { clock });

  // Given
  const original = await createTaskUseCase.execute({
    title: "task",
    status: "unstarted",
    due: null
  });

  clock.setNow(updatedAt);

  // When
  const updated = await updateTaskUseCase.execute({ id: original.id });

  // Then
  assertEquals(updated.updatedAt.toISOString(), original.updatedAt.toISOString());
  assertEquals(updated.updatedAt.getTime(), updated.createdAt.getTime());
});