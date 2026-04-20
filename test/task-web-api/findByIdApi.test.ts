import { assertEquals } from "@std/assert/equals";
import { assertExists } from "@std/assert/exists";
import { taskDtoScheme } from "../../feature/Task/handler/web-api/TaskDto.ts";
import { setup, requestJson } from "./helper.ts";


Deno.test("タスクが存在すれば200が返り、返されるDTOはSchemaを満たす", async () => {
  const app = setup();

  // Given
  const resp_create = await requestJson(app, "/task", "POST", {
    title: "test",
    status: "unstarted",
    due: null
  });
  const taskDto_create = taskDtoScheme.parse(await resp_create.json());

  // When
  const resp = await requestJson(app, `/task/${taskDto_create.id}`, "GET");
  const respBody = await resp.json();

  // Then
  assertEquals(resp.status, 200);
  const taskDto = taskDtoScheme.parse(respBody);
  assertExists(taskDto.id);
});

Deno.test("存在しないIDであれば404が返る", async () => {
  const app = setup();

  // Given
  // ダミーでタスクを登録しておく
  await requestJson(app, "/task", "POST", {
    title: "dummy",
    status: "unstarted",
    due: null
  });

  // When
  const resp = await requestJson(app, `/task/not-existed-task`, "GET");

  // Then
  assertEquals(resp.status, 404);
});

Deno.test("削除後のタスクを取得しようとすると404が返る", async () => {
  const app = setup();

  // Given
  const resp_create = await requestJson(app, "/task", "POST", {
    title: "task",
    status: "unstarted",
    due: null
  });
  const taskDto_create = taskDtoScheme.parse(await resp_create.json());

  await requestJson(app, `/task/${taskDto_create.id}`, "DELETE");

  // When
  const resp = await requestJson(app, `/task/${taskDto_create.id}`, "GET");

  // Then
  assertEquals(resp.status, 404);
});
