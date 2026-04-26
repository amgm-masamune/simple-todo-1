import { assertEquals, assertExists, unreachable } from "@std/assert";
import { setup, request } from "./helper.ts";
import { UNSPECIFIED } from "@feature/Task/domain/Task.ts";
import { createTaskResponseBodySchema, deleteTaskResponseBodySchema, findTaskByIdResponseBodySchema } from "@feature/Task/handler/web-api/handler.ts";
import { NOT_FOUND } from "@feature/Task/handler/web-api/ErrorResponse.ts";

Deno.test("タスクが存在すれば200が返り、返されるDTOはSchemaを満たす", async () => {
  const app = setup();

  // Given
  const resp_create = await request(app, "/task", "POST", {
    title: "test",
    status: "unstarted",
    due: UNSPECIFIED
  });
  const respBody_create = createTaskResponseBodySchema.parse(await resp_create.json());
  const taskDto_create = respBody_create.success ? respBody_create.value : unreachable();

  // When
  const resp = await request(app, `/task/${taskDto_create.id}`, "GET");
  const respBody = findTaskByIdResponseBodySchema.parse(await resp.json());

  // Then
  assertEquals(resp.status, 200);
  assertEquals(respBody.success, true);
  const taskDto = respBody.success ? respBody.value : unreachable();
  assertExists(taskDto.id);
});

Deno.test("存在しないIDであれば404が返る", async () => {
  const app = setup();

  // Given
  // ダミーでタスクを登録しておく
  await request(app, "/task", "POST", {
    title: "dummy",
    status: "unstarted",
    due: UNSPECIFIED
  });

  // When
  const resp = await request(app, `/task/not-existed-task`, "GET");
  const respBody = findTaskByIdResponseBodySchema.parse(await resp.json());

  // Then
  assertEquals(resp.status, 404);
  assertEquals(respBody.success, false);
  const error = !respBody.success ? respBody.error : unreachable();
  assertEquals(error.code, "NotFound");
});

Deno.test("削除後のタスクを取得しようとすると404が返る", async () => {
  const app = setup();

  // Given
  const resp_create = await request(app, "/task", "POST", {
    title: "task",
    status: "unstarted",
    due: UNSPECIFIED
  });
  const respBody_create = createTaskResponseBodySchema.parse(await resp_create.json());
  const taskDto_create = respBody_create.success ? respBody_create.value : unreachable();

  await request(app, `/task/${taskDto_create.id}`, "DELETE");

  // When
  const resp = await request(app, `/task/${taskDto_create.id}`, "GET");

  // Then
  assertEquals(resp.status, 404);
  const respBody = deleteTaskResponseBodySchema.parse(await resp.json());
  assertEquals(respBody.success, false);
  const error = !respBody.success ? respBody.error : unreachable();
  assertEquals(error.code, NOT_FOUND);
});
