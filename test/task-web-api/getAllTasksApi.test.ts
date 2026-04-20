import { assertEquals } from "@std/assert";
import { taskDtoScheme } from "../../feature/Task/handler/web-api/TaskDto.ts";
import { setup, requestJson } from "./helper.ts";
import z from "zod";
import { NOT_SPECIFIED } from "../../feature/Task/domain/Task.ts";


Deno.test("取得できれば200が返り、tasks[]で返却されるDTOがSchemaに合っている", async () => {
  const app = setup();

  // Given
  await requestJson(app, "/task", "POST", {
    title: "task0",
    status: "unstarted",
    due: NOT_SPECIFIED
  });
  await requestJson(app, "/task", "POST", {
    title: "task1",
    status: "unstarted",
    due: NOT_SPECIFIED
  });

  // When
  const resp = await requestJson(app, `/tasks`, "GET");
  const respBody = await resp.json();

  // Then
  assertEquals(resp.status, 200);
  const respBodySchema = z.array(taskDtoScheme);
  const taskDtos = respBodySchema.parse(respBody);
  assertEquals(taskDtos.length, 2);
});

Deno.test("完了済み含めすべてのタスクを取得できる", async () => {
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

  // When
  const resp = await requestJson(app, `/tasks`, "GET");
  const respBody = await resp.json();
  
  const respBodySchema = z.array(taskDtoScheme);
  const taskDtos = respBodySchema.parse(respBody);

  // Then
  assertEquals(taskDtos.length, 4);
  assertEquals(taskDtos.filter(taskDto => taskDto.title === "task0").length, 1);
  assertEquals(taskDtos.filter(taskDto => taskDto.title === "task1").length, 1);
  assertEquals(taskDtos.filter(taskDto => taskDto.title === "task2").length, 1);
  assertEquals(taskDtos.filter(taskDto => taskDto.title === "task3").length, 1);
});


Deno.test("削除済みのタスクは全タスクの取得結果に含まれない", async () => {
  const app = setup();

  // Given
  const resp_task0 = await requestJson(app, "/task", "POST", {
    title: "task0",
    status: "unstarted",
    due: NOT_SPECIFIED
  });
  await requestJson(app, "/task", "POST", {
    title: "task1",
    status: "unstarted",
    due: NOT_SPECIFIED
  });

  const task0Dto = taskDtoScheme.parse(await resp_task0.json());
  await requestJson(app, `/task/${task0Dto.id}`, "DELETE");

  // When
  const resp = await requestJson(app, `/tasks`, "GET");
  const respBody = await resp.json();

  const respBodySchema = z.array(taskDtoScheme);
  const taskDtos = respBodySchema.parse(respBody);

  // Then
  assertEquals(taskDtos.filter(taskDto => taskDto.title === "task0").length, 0);
  assertEquals(taskDtos.filter(taskDto => taskDto.title === "task1").length, 1);
});
