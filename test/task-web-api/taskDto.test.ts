import { Task } from "../../feature/Task/domain/Task.ts";
import { taskDtoScheme, taskDtoToEntity, taskEntityToDto } from "../../feature/Task/handler/web-api/TaskDto.ts";
import { assertEquals, assertThrows } from "@std/assert";
import { TASK_ID, DATE_1, DATE_2, DATE_3, DATE_4, DATE_5, DATE_6, DATE_1_STR, DATE_2_STR, DATE_3_STR, DATE_4_STR } from "./helper.ts";

Deno.test("未着手のタスクをSchemaに合っているDTOに変換できる", () => {
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_3
  });

  // When
  const taskDto = taskEntityToDto(task);

  // Then
  taskDtoScheme.parse(taskDto);
});

Deno.test("進行中のタスクをSchemaに合っているDTOに変換できる", () => {
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "in-progress",
    due: DATE_1,
    startedAt: DATE_2,
    createdAt: DATE_3,
    updatedAt: DATE_4
  });

  // When
  const taskDto = taskEntityToDto(task);

  // Then
  taskDtoScheme.parse(taskDto);
});

Deno.test("完了のタスクをSchemaに合っているDTOに変換できる", () => {
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "completed",
    due: DATE_1,
    startedAt: DATE_2,
    completedAt: DATE_3,
    createdAt: DATE_4,
    updatedAt: DATE_5
  });

  // When
  const taskDto = taskEntityToDto(task);

  // Then
  taskDtoScheme.parse(taskDto);
});

Deno.test("キャンセルのタスクをSchemaに合っているDTOに変換できる", () => {
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "cancelled",
    due: DATE_1,
    startedAt: DATE_2,
    completedAt: DATE_3,
    cancelledAt: DATE_4,
    createdAt: DATE_5,
    updatedAt: DATE_6
  });

  // When
  const taskDto = taskEntityToDto(task);

  // Then
  taskDtoScheme.parse(taskDto);
});

Deno.test("日付に null・日付 の指定が入り混じっているタスクをDTOに変換してもSchemaに合っている", () => {
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "cancelled",
    due: null,
    startedAt: DATE_1,
    completedAt: null,
    cancelledAt: DATE_2,
    createdAt: DATE_3,
    updatedAt: DATE_4
  });

  // When
  const taskDto = taskEntityToDto(task);

  // Then
  taskDtoScheme.parse(taskDto);
});

Deno.test("未着手のタスクのDTO Schemaから、ドメインの整合性を保ってエンティティへエラーなく戻せる", () => {
  // Given
  const original = Task.create({
    id: TASK_ID,
    title: "task",
    status: "unstarted",
    due: DATE_1,
    createdAt: DATE_2,
    updatedAt: DATE_3
  });
  const taskDto = taskEntityToDto(original);

  // When・Then
  const task = taskDtoToEntity(taskDto);  // エラーなく戻せる
  assertEquals(task, original);
});

Deno.test("進行中のタスクのDTO Schemaから、ドメインの整合性を保ってエンティティへエラーなく戻せる", () => {
  // Given
  const original = Task.create({
    id: TASK_ID,
    title: "task",
    status: "in-progress",
    due: null,
    startedAt: null,
    createdAt: DATE_1,
    updatedAt: DATE_2
  });
  const taskDto = taskEntityToDto(original);

  // When・Then
  const task = taskDtoToEntity(taskDto);  // エラーなく戻せる
  assertEquals(task, original);
});

Deno.test("完了のタスクのDTO Schemaから、ドメインの整合性を保ってエンティティへエラーなく戻せる", () => {
  // Given
  const original = Task.create({
    id: TASK_ID,
    title: "task",
    status: "completed",
    due: null,
    startedAt: null,
    completedAt: null,
    createdAt: DATE_1,
    updatedAt: DATE_2
  });
  const taskDto = taskEntityToDto(original);

  // When・Then
  const task = taskDtoToEntity(taskDto);  // エラーなく戻せる
  assertEquals(task, original);
});

Deno.test("キャンセルのタスクのDTO Schemaから、ドメインの整合性を保ってエンティティへエラーなく戻せる", () => {
  // Given
  const original = Task.create({
    id: TASK_ID,
    title: "task",
    status: "cancelled",
    due: null,
    startedAt: null,
    completedAt: null,
    cancelledAt: null,
    createdAt: DATE_1,
    updatedAt: DATE_2
  });
  const taskDto = taskEntityToDto(original);

  // When・Then
  const task = taskDtoToEntity(taskDto);  // エラーなく戻せる
  assertEquals(task, original);
});

Deno.test("日付に null・日付 の指定が入り混じっているタスクのDTOでもエラーなくエンティティへ戻せる", () => {
  // Given
  const original = Task.create({
    id: TASK_ID,
    title: "task",
    status: "cancelled",
    due: null,
    startedAt: DATE_1,
    completedAt: null,
    cancelledAt: null,
    createdAt: DATE_2,
    updatedAt: DATE_3
  });
  const taskDto = taskEntityToDto(original);

  // When・Then
  const task = taskDtoToEntity(taskDto);  // エラーなく戻せる
  assertEquals(task, original);
});


Deno.test("進行中だが started が指定されていない（タスクのドメインを満たしていない）DTOはエンティティに戻せずエラーになる", () => {
  // Given
  const taskDto = taskDtoScheme.parse({ // DTOとしてはSchemaを満たしている
    id: TASK_ID,
    title: "task",
    status: "in-progress",
    due: null,
    // startedAt を指定しない
    createdAt: DATE_1_STR,
    updatedAt: DATE_1_STR
  });

  // When・Then
  assertThrows(() => 
    taskDtoToEntity(taskDto)  // エンティティへの変換でエラー
  );
});

Deno.test("startedAt > completedAt となっている（タスクのドメインを満たしていない）DTOはエンティティに戻せずエラーになる", () => {
  // Given
  const taskDto = taskDtoScheme.parse({ // DTOとしてはSchemaを満たしている
    id: TASK_ID,
    title: "task",
    status: "completed",
    due: null,
    startedAt: DATE_2_STR,
    completedAt: DATE_1_STR,
    createdAt: DATE_3_STR,
    updatedAt: DATE_4_STR
  });

  // When・Then
  assertThrows(() => 
    taskDtoToEntity(taskDto)  // エンティティへの変換でエラー
  );
});