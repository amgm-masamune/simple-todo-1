import { assertEquals } from "@std/assert/equals";
import { setup, request } from "./helper.ts";
import { UNSPECIFIED } from "../../feature/Task/domain/Task.ts";
import { createTaskResponseBodySchema, deleteTaskResponseBodySchema } from "../../feature/Task/handler/web-api/handler.ts";
import { unreachable } from "@std/assert/unreachable";
import { NOT_FOUND } from "../../feature/Task/handler/web-api/ErrorResponse.ts";


Deno.test("タスクを正常に削除できれば200が返る", async () => {
  const app = setup();

  // Given
  const resp_create = await request(app, "/task", "POST", {
    title: "test",
    status: "unstarted",
    due: UNSPECIFIED
  });
  const respBpdy_create = createTaskResponseBodySchema.parse(await resp_create.json());
  const taskDto_create = respBpdy_create.success === true ? respBpdy_create.value : unreachable()

  // When
  const resp = await request(app, `/task/${taskDto_create.id}`, "DELETE");

  // Then
  const _respBody = deleteTaskResponseBodySchema.parse(await resp.json());
  assertEquals(resp.status, 200);
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
  const resp = await request(app, `/task/not-existed-task`, "DELETE");

  // Then
  assertEquals(resp.status, 404);
  const respBody = deleteTaskResponseBodySchema.parse(await resp.json());
  const error = respBody.success === false ? respBody.error : unreachable();
  assertEquals(respBody.success, false);
  assertEquals(error.code, NOT_FOUND)
});

