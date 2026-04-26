import { assert, assertEquals, unreachable } from "@std/assert";
import { setup, request } from "./helper.ts";
import { UNSPECIFIED } from "../../feature/Task/domain/Task.ts";
import { createTaskResponseBodySchema, getAllTasksResponseBodySchema } from "../../feature/Task/handler/web-api/handler.ts";


Deno.test("取得できれば200が返り、tasks[]で返却されるDTOがSchemaに合っている", async () => {
  const app = setup();

  // Given
  await request(app, "/task", "POST", {
    title: "task0",
    status: "unstarted",
    due: UNSPECIFIED
  });
  await request(app, "/task", "POST", {
    title: "task1",
    status: "unstarted",
    due: UNSPECIFIED
  });

  // When
  const resp = await request(app, `/tasks`, "GET");

  // Then
  assertEquals(resp.status, 200);
  const respBody = getAllTasksResponseBodySchema.parse(await resp.json());
  assert(respBody.success === true);
  assertEquals(respBody.value.length, 2);
});

Deno.test("完了済み含めすべてのタスクを取得できる", async () => {
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

  // When
  const resp = await request(app, `/tasks`, "GET");
  const respBody = getAllTasksResponseBodySchema.parse(await resp.json());
  const taskDtos = respBody.success ? respBody.value : unreachable();

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
  const resp_deleting = await request(app, "/task", "POST", {
    title: "will be deleted",
    status: "unstarted",
    due: UNSPECIFIED
  });
  await request(app, "/task", "POST", {
    title: "task1",
    status: "unstarted",
    due: UNSPECIFIED
  });

  // 登録したタスクを1つ削除
  const respBody_deleting_create = createTaskResponseBodySchema.parse(await resp_deleting.json());
  const deletingDto = respBody_deleting_create.success ? respBody_deleting_create.value : unreachable();
  await request(app, `/task/${deletingDto.id}`, "DELETE");

  // When
  const resp = await request(app, `/tasks`, "GET");
  const respBody = getAllTasksResponseBodySchema.parse(await resp.json());
  const taskDtos = respBody.success ? respBody.value : unreachable();

  // Then
  assertEquals(taskDtos.filter(taskDto => taskDto.title === "task0").length, 0);
  assertEquals(taskDtos.filter(taskDto => taskDto.title === "task1").length, 1);
});
