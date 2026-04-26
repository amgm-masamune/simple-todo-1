import { assert, assertEquals, assertExists, unreachable } from "@std/assert";
import { taskDtoSchema } from "../../feature/Task/handler/web-api/TaskDto.ts";
import { setup, request as request } from "./helper.ts";
import { UNSPECIFIED } from "../../feature/Task/domain/Task.ts";
import { searchTasksByStatusResponseBodySchema } from "../../feature/Task/handler/web-api/handler.ts";

Deno.test("取得できれば200が返り、取得したDTOがSchemaに合っている", async () => {
  const app = setup();

  // Given
  await request(app, "/task", "POST", {
    title: "task0",
    status: "unstarted",
    due: UNSPECIFIED
  });
  await request(app, "/task", "POST", {
    title: "task1",
    status: "in-progress",
    due: UNSPECIFIED, startedAt: UNSPECIFIED
  });

  // When
  const resp = await request(app, `/tasks/status/in-progress`, "GET");
  
  // Then
  assertEquals(resp.status, 200);
  const respBody = searchTasksByStatusResponseBodySchema.parse(await resp.json());
  assert(respBody.success === true);
  assertEquals(respBody.value.length, 1);
});

Deno.test("指定した status のタスクが複数あれば複数取得できる", async () => {
  const app = setup();

  // Given
  await request(app, "/task", "POST", {
    title: "task0",
    status: "unstarted",
    due: UNSPECIFIED
  });
  await request(app, "/task", "POST", {
    title: "task1",
    status: "in-progress",
    due: UNSPECIFIED, startedAt: UNSPECIFIED
  });
  await request(app, "/task", "POST", {
    title: "task2",
    status: "completed",
    due: UNSPECIFIED, startedAt: UNSPECIFIED, completedAt: UNSPECIFIED
  });
  await request(app, "/task", "POST", {
    title: "task3",
    status: "cancelled",
    due: UNSPECIFIED, startedAt: UNSPECIFIED, completedAt: UNSPECIFIED, cancelledAt: UNSPECIFIED
  });
  await request(app, "/task", "POST", {
    title: "task4",
    status: "completed",
    due: UNSPECIFIED, startedAt: UNSPECIFIED, completedAt: UNSPECIFIED
  });

  // When
  const resp = await request(app, `/tasks/status/completed`, "GET");
  const respBody = searchTasksByStatusResponseBodySchema.parse(await resp.json());
  const taskDtos = respBody.success ? respBody.value.map(item => taskDtoSchema.parse(item)) : unreachable();

  // Then
  const task2 = taskDtos.find(t => t.title === "task2");
  const task4 = taskDtos.find(t => t.title === "task4");
  assertExists(task2);
  assertExists(task4);
});

