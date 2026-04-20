import { assertExists } from "@std/assert";
import { taskDtoScheme } from "../../feature/Task/handler/web-api/TaskDto.ts";
import { setup, requestJson } from "./helper.ts";
import z from "zod";
import { NOT_SPECIFIED } from "../../feature/Task/domain/Task.ts";

// Deno.test("取得できれば200が返り、取得したDTOがSchemaに合っている", async () => {
//   throw new Error("TODO");
// });

// Deno.test("指定した status のタスクが無ければ空配列が返る", async () => {
//   throw new Error("TODO");
// });

// Deno.test("指定した status のタスクが1件あれば1件のみ取得できる", async () => {
//   throw new Error("TODO");
// });

Deno.test("指定した status のタスクが複数あれば複数取得できる", async () => {
  const app = setup();

  // Given
  await requestJson(app, "/task", "POST", {
    title: "task0",
    status: "unstarted",
    due: NOT_SPECIFIED
  });
  await requestJson(app, "/task", "POST", {
    title: "task1",
    status: "in-progress",
    due: NOT_SPECIFIED, startedAt: NOT_SPECIFIED
  });
  await requestJson(app, "/task", "POST", {
    title: "task2",
    status: "completed",
    due: NOT_SPECIFIED, startedAt: NOT_SPECIFIED, completedAt: NOT_SPECIFIED
  });
  await requestJson(app, "/task", "POST", {
    title: "task3",
    status: "cancelled",
    due: NOT_SPECIFIED, startedAt: NOT_SPECIFIED, completedAt: NOT_SPECIFIED, cancelledAt: NOT_SPECIFIED
  });
  await requestJson(app, "/task", "POST", {
    title: "task4",
    status: "completed",
    due: NOT_SPECIFIED, startedAt: NOT_SPECIFIED, completedAt: NOT_SPECIFIED
  });

  // When
  const resp = await requestJson(app, `/tasks/status/completed`, "GET");
  const respBody = z.array(taskDtoScheme).parse(await resp.json());
  const taskDtos = respBody.map(item => taskDtoScheme.parse(item));

  // Then
  const task2 = taskDtos.find(t => t.title === "task2");
  const task4 = taskDtos.find(t => t.title === "task4");
  assertExists(task2);
  assertExists(task4);
});

