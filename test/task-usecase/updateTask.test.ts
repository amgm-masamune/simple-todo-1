import { assertEquals, assert, assertRejects } from "@std/assert";
import { createDependencies } from "../../deps/CompositionRoot.ts";
import { DATE_1, DATE_2, DATE_3, DATE_4, fixedClock } from "../helper.ts";
import { UNSPECIFIED } from "../../feature/Task/domain/Task.ts";
import { ValidationError } from "../../common/Error/ValidationError/ValidationError.ts";
import { NotFoundError } from "../../common/Error/NotFoundError/NotFoundError.ts";

Deno.test("タスクを正常に更新すると、更新後のタスクが返る", async () => {
  const { 
    createTaskUseCase,
    updateTaskUseCase,
  } = createDependencies("in-memory");

  // Given
  const original = await createTaskUseCase.execute({
    title: "original",
    status: "unstarted",
    due: UNSPECIFIED
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

Deno.test("指定したIDのタスクが見つからないと NotFound エラーになる", async () => {
  const { 
    createTaskUseCase,
    updateTaskUseCase,
  } = createDependencies("in-memory");

  // Given
  const _dummy = await createTaskUseCase.execute({
    title: "dummy task",
    status: "unstarted",
    due: UNSPECIFIED
  });

  // When・Then
  assertRejects(() =>
    updateTaskUseCase.execute({ id: "Invalid ID", title: "Invalid Task ID" }),
    NotFoundError
  );
});

Deno.test("ドメインルールを満たさないタスクの更新では ValidationError が返る", async () => {
  const { 
    createTaskUseCase,
    updateTaskUseCase,
  } = createDependencies("in-memory");

  // Given
  const original = await createTaskUseCase.execute({ title: "original", status: "completed", due: UNSPECIFIED, startedAt: DATE_2, completedAt: DATE_3 });
  
  // When・Then
  assertRejects(() =>
    updateTaskUseCase.execute({ 
      id: original.id,
      completedAt: DATE_1  // < startedAt = DATE_2 
    }),
    ValidationError
  );
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
    due: UNSPECIFIED
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
    due: UNSPECIFIED,
    startedAt: UNSPECIFIED,
    completedAt: UNSPECIFIED,
    cancelledAt: UNSPECIFIED
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
  assertEquals(updated.due, DATE_1);
  assertEquals(updated.startedAt, DATE_2);
  assertEquals(updated.completedAt, DATE_3);
  assertEquals(updated.cancelledAt, DATE_4);
});

Deno.test("undefined の指定は、変更しないことを表す", async () => {
  const { 
    createTaskUseCase,
    updateTaskUseCase,
  } = createDependencies("in-memory");

  // Given
  const original = await createTaskUseCase.execute({
    title: "original",
    status: "unstarted",
    due: DATE_1
  });

  // When
  const updated = await updateTaskUseCase.execute({
    id: original.id,
    due: undefined
  });

  // Then
  assertEquals(updated.due, DATE_1);  // UNSPECIFIED にならない
});

Deno.test("UNSPECIFIED の指定は「変更しない」ではなく、値として UNSPECIFIED に更新することを表す", async () => {
  const { 
    createTaskUseCase,
    updateTaskUseCase,
  } = createDependencies("in-memory");

  // Given
  const original = await createTaskUseCase.execute({
    title: "original",
    status: "unstarted",
    due: DATE_1
  });

  // When
  const updated = await updateTaskUseCase.execute({
    id: original.id,
    due: UNSPECIFIED
  });

  // Then
  assertEquals(updated.due, UNSPECIFIED);  // 変更される
});


// 以下はTaskエンティティのテストでは？

// Deno.test("未着手への変更の際に startedAt・completed を指定しても undefined になる", async () => {
//   const { 
//     createTaskUseCase,
//     updateTaskUseCase,
//   } = createDependencies("in-memory");

//   // Given
//   const original = await createTaskUseCase.execute({
//     title: "task",
//     status: "in-progress",
//     due: UNSPECIFIED,
//     startedAt: DATE_1
//   });

//   // When・Then
//   const updated = await updateTaskUseCase.execute({ 
//     id: original.id,
//     status: "unstarted",
//     due: UNSPECIFIED,
//     startedAt: DATE_2,
//     completedAt: DATE_3,
//     cancelledAt: DATE_4,
//   });

//   // Then
//   assertEquals(updated.startedAt, undefined);
//   assertEquals(updated.completedAt, undefined);
//   assertEquals(updated.cancelledAt, undefined);
// });

// Deno.test("未着手→進行中 の状態変更で startedAt を指定すると、その値で進行中になる。", async () => {
//   const { createTaskUseCase, updateTaskUseCase } = createDependencies("in-memory");
  
//   // Given
//   const unstartedTask = await createTaskUseCase.execute({ title: "task", status: "unstarted", due: UNSPECIFIED });

//   // When
//   const updated = await updateTaskUseCase.execute({ id: unstartedTask.id, status: "in-progress", startedAt: DATE_1 });

//   // Then
//   assertEquals(updated.status, "in-progress");
//   assertEquals(updated.startedAt, DATE_1);
// });

// Deno.test("未着手→進行中 の状態変更で、startedAt の指定がない(null指定もない)場合は変更できない", async () => {
//   const { createTaskUseCase, updateTaskUseCase } = createDependencies("in-memory");
  
//   /// Given
//   const task = await createTaskUseCase.execute({ title: "task", status: "unstarted", due: UNSPECIFIED });

//   // When・Then
//   await assertRejects(() => 
//     updateTaskUseCase.execute({ id: task.id, status: "in-progress" }),
//     ValidationError
//   );
// });

// Deno.test("進行中→完了 の状態変更で startedAt を指定しない場合、変更されない(nullにはならない)", async () => {
//   const { createTaskUseCase, updateTaskUseCase } = createDependencies("in-memory");
  
//   // Given
//   const inProgressTask = await createTaskUseCase.execute({ title: "task", status: "in-progress", due: UNSPECIFIED, startedAt: DATE_1 });

//   // When
//   const updated = await updateTaskUseCase.execute({ id: inProgressTask.id, status: "completed", completedAt: UNSPECIFIED });

//   // Then
//   assertEquals(updated.status, "completed");
//   assertEquals(updated.startedAt, inProgressTask.startedAt);
// });

// Deno.test("完了→進行中 の状態変更で startedAt を指定しない場合、変更されない(nullにはならない)", async () => {
//   const { createTaskUseCase, updateTaskUseCase } = createDependencies("in-memory");
  
//   // Given
//   const inProgressTask = await createTaskUseCase.execute({ title: "task", status: "completed", due: UNSPECIFIED, startedAt: DATE_1, completedAt: DATE_2 });

//   // When
//   const updated = await updateTaskUseCase.execute({ id: inProgressTask.id, status: "in-progress" });

//   // Then
//   assertEquals(updated.status, "in-progress");
//   assertEquals(updated.startedAt, inProgressTask.startedAt);
// });

// Deno.test("タスクを更新すると updatedAt も更新される", async () => {
//   const expectedCreatedAt = DATE_1;
//   const expectedUpdatedAt = DATE_2;
//   const clock = fixedClock(expectedCreatedAt);
//   const { 
//     createTaskUseCase,
//     updateTaskUseCase,
//     findTaskByIdUseCase
//    } = createDependencies("in-memory", { clock });

//   // Given
//   const original = await createTaskUseCase.execute({
//     title: "task",
//     status: "unstarted",
//     due: UNSPECIFIED
//   });

//   clock.setNow(expectedUpdatedAt);

//   // When
//   await updateTaskUseCase.execute({ id: original.id, due: DATE_3 });

//   // Then
//   const updated = await findTaskByIdUseCase.execute({ id: original.id });
//   assertEquals(updated.title, original.title);
//   assertEquals(updated.due, DATE_3);
//   assertEquals(updated.createdAt, expectedCreatedAt);
//   assertEquals(updated.updatedAt, expectedUpdatedAt);
//   assert(updated.updatedAt.getTime() > updated.createdAt.getTime());
// });

Deno.test("何も指定せずに update してもエラーにならないが、updatedAt は更新されない", async () => {
  const createdAt = DATE_1;
  const updatedAt = DATE_2;
  const clock = fixedClock(createdAt);
  const { 
    createTaskUseCase,
    updateTaskUseCase
   } = createDependencies("in-memory", { clock });

  // Given
  const original = await createTaskUseCase.execute({
    title: "task",
    status: "unstarted",
    due: UNSPECIFIED
  });

  clock.setNow(updatedAt);

  // When
  const updated = await updateTaskUseCase.execute({ id: original.id });

  // Then
  assertEquals(updated.updatedAt, original.updatedAt);
  assertEquals(updated.updatedAt, updated.createdAt);
});