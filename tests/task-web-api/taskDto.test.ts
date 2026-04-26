import { UNSPECIFIED, Task, isUnspecified } from "../../src/feature/Task/domain/Task.ts";
import { taskDtoSchema, taskDtoToEntity, taskEntityToDto } from "../../src/feature/Task/handler/web-api/TaskDto.ts";
import { assert, assertEquals, assertThrows } from "@std/assert";
import { TASK_ID, DATE_1, DATE_2, DATE_3, DATE_4, DATE_5, DATE_6, DATE_1_STR, DATE_2_STR, DATE_3_STR, DATE_4_STR } from "../helper.ts";

/*
# 方針

## 検証する観点
- Entity -> DTO (taskEntityToDto) でスキーマエラーなくプロパティが正しく引き継がれること 
- DTO -> Entity (taskDtoToEntity）で最低限変換できること

## 検証しない観点
- DTO -> Entity ドメインルールを満たしていないEntityに変換すると Entity.create でエラーが出ること（Entityのテストの責務）
- 更新時に createdAt や updatedAt を指定してもその値はセットされずサーバー側の内部値で更新される（Update のAPIのテストの責務）
*/

Deno.test("タスクをDTOへ変換できる", () => {
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
  taskDtoSchema.parse(taskDto);
  assertEquals(task.id, taskDto.id);
  assertEquals(task.title, taskDto.title);
  assertEquals(task.status, taskDto.status);
  assert(isUnspecified(task.due) == false);
  assertEquals(task.due.toISOString(), taskDto.due);
  assertEquals(task.createdAt.toISOString(), taskDto.createdAt);
  assertEquals(task.updatedAt.toISOString(), taskDto.updatedAt);
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
  taskDtoSchema.parse(taskDto);
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
  taskDtoSchema.parse(taskDto);
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
  taskDtoSchema.parse(taskDto);
});

Deno.test("日付に null・日付 の指定が入り混じっているタスクをDTOに変換してもSchemaに合っている", () => {
  // Given
  const task = Task.create({
    id: TASK_ID,
    title: "task",
    status: "cancelled",
    due: UNSPECIFIED,
    startedAt: DATE_1,
    completedAt: UNSPECIFIED,
    cancelledAt: DATE_2,
    createdAt: DATE_3,
    updatedAt: DATE_4
  });

  // When
  const taskDto = taskEntityToDto(task);

  // Then
  taskDtoSchema.parse(taskDto);
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
    due: UNSPECIFIED,
    startedAt: UNSPECIFIED,
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
    due: UNSPECIFIED,
    startedAt: UNSPECIFIED,
    completedAt: UNSPECIFIED,
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
    due: UNSPECIFIED,
    startedAt: UNSPECIFIED,
    completedAt: UNSPECIFIED,
    cancelledAt: UNSPECIFIED,
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
    due: UNSPECIFIED,
    startedAt: DATE_1,
    completedAt: UNSPECIFIED,
    cancelledAt: UNSPECIFIED,
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
  const taskDto = taskDtoSchema.parse({ // DTOとしてはSchemaを満たしている
    id: TASK_ID,
    title: "task",
    status: "in-progress",
    due: UNSPECIFIED,
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
  const taskDto = taskDtoSchema.parse({ // DTOとしてはSchemaを満たしている
    id: TASK_ID,
    title: "task",
    status: "completed",
    due: UNSPECIFIED,
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