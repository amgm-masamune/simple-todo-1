import { assertEquals } from "@std/assert/equals";
import { taskDtoScheme } from "../../feature/Task/handler/web-api/TaskDto.ts";
import { setup, requestJson } from "./helper.ts";
import { NOT_SPECIFIED } from "../../feature/Task/domain/Task.ts";


Deno.test("タスクを正常に削除できれば200が返る", async () => {
  const app = setup();

  // Given
  const resp_create = await requestJson(app, "/task", "POST", {
    title: "test",
    status: "unstarted",
    due: NOT_SPECIFIED
  });
  const taskDto_create = taskDtoScheme.parse(await resp_create.json());

  // When
  const resp = await requestJson(app, `/task/${taskDto_create.id}`, "DELETE");

  // Then
  assertEquals(resp.status, 200);
});

Deno.test("存在しないIDであれば404が返る", async () => {
  const app = setup();

  // Given
  // ダミーでタスクを登録しておく
  await requestJson(app, "/task", "POST", {
    title: "dummy",
    status: "unstarted",
    due: NOT_SPECIFIED
  });

  // When
  const resp = await requestJson(app, `/task/not-existed-task`, "DELETE");

  // Then
  assertEquals(resp.status, 404);
});

