// https://hono-ja.pages.dev/docs/getting-started/deno#%E3%83%86%E3%82%B9%E3%83%88

import { assert, assertEquals, assertNotEquals, assertExists } from "@std/assert";
import { taskDtoSchema, taskDtoToEntity } from "../../feature/Task/handler/web-api/TaskDto.ts";
import { setup, requestJson } from "./helper.ts";
import { fixedClock, DATE_1, DATE_2, DATE_3, DATE_4, DATE_5 } from "../helper.ts";
import z from "zod";
import { UNSPECIFIED } from "../../feature/Task/domain/Task.ts";

const responseSchema = taskDtoSchema;

Deno.test("タスクを正常に作成できると200が返り、返されるDTOはSchemaを満たす", async () => {
  const app = setup();

  // Given・When
  const resp = await requestJson(app, "/task", "POST", {
    title: "test",
    status: "unstarted",
    due: UNSPECIFIED
  });
  const respBody = await resp.json();

  // Then
  assertEquals(resp.status, 200);
  const task = taskDtoSchema.parse(respBody);
  assertExists(task.id);
});

Deno.test("タスク作成で異常があると400が返る", async () => {
  const app = setup();

  // Given・When
  const resp = await requestJson(app, "/task", "POST", {
    title: "test",
    status: "completed",
    due: UNSPECIFIED,
    startedAt: DATE_2,
    completedAt: DATE_1 // 完了日時の方が開始日時よりも早いエラー
  });
  const _respBody = await resp.json();

  // Then
  assertEquals(resp.status, 400);
  // TODO: レスポンスにはエラーが返る
  // const task = z.object({ error: z.any() }).parse(respBody);
  // assertExists(task.error)
});

Deno.test("最小限のプロパティ指定でタスクを作成できる", async () => {
  const createdAt = DATE_1;
  const app = setup({ clock: fixedClock(createdAt) });

  // Given・When
  const resp = await requestJson(app, "/task", "POST", {
    title: "test",
    status: "unstarted",
    due: UNSPECIFIED
  });
  const taskDto = responseSchema.parse(await resp.json());

  // Then
  assertEquals(resp.status, 200);
  assert(taskDto.id.length > 0);
  assertEquals(taskDto.title, "test");
  assertEquals(taskDto.due, UNSPECIFIED);
  assertEquals(taskDto.createdAt, createdAt.toISOString());
  assertEquals(taskDto.updatedAt, createdAt.toISOString());
});

Deno.test("最大限のプロパティ指定でタスクを作成できる", async () => {
  const createdAt = DATE_1;
  const app = setup({ clock: fixedClock(createdAt) });

  // Given・When
  const resp = await requestJson(app, "/task", "POST", {
    title: "test",
    status: "cancelled",
    due: DATE_2,
    startedAt: DATE_3,
    completedAt: DATE_4,
    cancelledAt: DATE_5
  });
  const taskDto = responseSchema.parse(await resp.json());

  // Then
  assert(taskDto.id.length > 0);
  assertEquals(taskDto.title, "test");
  assertEquals(taskDto.due, DATE_2.toISOString());
  assertEquals(taskDto.startedAt, DATE_3.toISOString());
  assertEquals(taskDto.completedAt, DATE_4.toISOString());
  assertEquals(taskDto.cancelledAt, DATE_5.toISOString());
  assertEquals(taskDto.createdAt, createdAt.toISOString());
  assertEquals(taskDto.updatedAt, createdAt.toISOString());
});

Deno.test("レスポンスされたデータがTaskドメインを満たしている", async () => {
  const createdAt = DATE_1;
  const app = setup({ clock: fixedClock(createdAt) });

  // Given
  const resp = await requestJson(app, "/task", "POST", {
    title: "test",
    status: "completed",
    due: DATE_2,
    startedAt: UNSPECIFIED,
    completedAt: DATE_3
  });
  const taskDto = responseSchema.parse(await resp.json());
  
  // When
  const task = taskDtoToEntity(taskDto);

  // Then
  assert(taskDto.id.length > 0);
  assertEquals(task.title, "test");
  assertEquals(task.status, "completed");
  assertEquals(task.due, DATE_2);
  assertEquals(task.startedAt, UNSPECIFIED);
  assertEquals(task.completedAt, DATE_3);
  assertEquals(task.createdAt, DATE_1);
  assertEquals(task.updatedAt, DATE_1);
});

Deno.test("必須のプロパティが足りていない作成は400が返る", async () => {
  const app = setup();
  
  // Given
  const createTaskInput = {
    title: "test",
    status: "in-progress",
    due: DATE_1
    // startedAt を指定しない
  };

  // When
  const resp = await requestJson(app, "/task", "POST", createTaskInput);

  // Then
  assertEquals(resp.status, 400);
});

Deno.test("プロパティの値が不正な時の作成は400が返る", async () => {
  const app = setup();
  
  // Given
  const createTaskInput = {
    title: "test",
    status: "Invalid Status", // バリデーションエラー
    due: DATE_1
  };

  // When
  const resp = await requestJson(app, "/task", "POST", createTaskInput);

  // Then
  assertEquals(resp.status, 400);
});

Deno.test("指定できないプロパティを指定しても反映されない", async () => {
  const createdAt = DATE_1;
  const app = setup({ clock: fixedClock(createdAt) });
  
  // Given
  const createTaskInput = {
    id: "specified-id", // 外部から指定できない
    title: "test",
    status: "unstarted",
    due: UNSPECIFIED,
    createdAt: DATE_2,  // 外部から指定できない
    updatedAt: DATE_3   // 外部から指定できない
  };

  // When
  const resp = await requestJson(app, "/task", "POST", createTaskInput);

  // Then
  const taskDto = responseSchema.parse(await resp.json());
  assertNotEquals(taskDto.id, "specified-id");
  assertEquals(taskDto.createdAt, createdAt.toISOString());
  assertEquals(taskDto.updatedAt, createdAt.toISOString());
});


