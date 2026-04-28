import { assert, assertEquals, assertNotEquals, unreachable } from "@std/assert";
import { setup, request } from "./helper.ts";
import { DATE_1, DATE_2, fixedClock, DATE_3, DATE_4, DATE_1_STR, DATE_3_STR } from "../helper.ts";
import { UNSPECIFIED } from "@feature/Task/domain/Task.ts";
import { createTaskResponseBodySchema, updateTaskResponseBodySchema } from "@feature/Task/handler/web-api/handler.ts";
import { NOT_FOUND, VALIDATION_FAILED } from "@feature/Task/handler/web-api/ErrorResponse.ts";

/*
# 方針

## 重点的に確認する観点
- 更新成功時のリクエスト・レスポンスのスキーマ
- 見つからないときのリクエスト・レスポンスのスキーマ
- ドメインルールを満たさないときのリクエスト・レスポンスのスキーマ
- ネットワークリクエストで壊れそうなところ（null/undfined/指定なし の扱い）

## 委譲する観点
- 詳細なドメインルール整合（UseCase のテストに委譲）
*/

Deno.test("タスクを正常に更新すると200が返り、返されるDTOはSchemaを満たす", async () => {
  const app = await setup();
  const resp_create = await request(app, "/task", "POST", {
    title: "task", status: "unstarted", due: UNSPECIFIED
  });
  const respBody_created = createTaskResponseBodySchema.parse(await resp_create.json());
  const created = respBody_created.success ? respBody_created.value : unreachable();


  // Given
  const updateTaskInput = {
    title: "task-updated"
  };

  // When
  const resp = await request(app, `/task/${created.id}`, "PUT", updateTaskInput);

  // Then
  assertEquals(resp.status, 200);
  const respBody = updateTaskResponseBodySchema.parse(await resp.json());
  assert(respBody.success === true);
  const updated = respBody.value;
  assertEquals(updated.title, "task-updated");
});


Deno.test("指定したIDのタスクが見つからないと404が返り、返されるDTOはSchemaを満たす", async () => {
  const app = await setup();

  // Given
  await request(app, "/task", "POST", {
    title: "dummy", status: "unstarted", due: UNSPECIFIED
  });

  const updateTaskInput = {
    title: "task"
  };

  // When
  const resp = await request(app, `/task/Invalid ID`, "PUT", updateTaskInput);

  // Then
  assertEquals(resp.status, 404);
  const respBody = updateTaskResponseBodySchema.parse(await resp.json());
  assert(respBody.success === false);
  assertEquals(respBody.error.code, NOT_FOUND);
});


Deno.test("タスクの更新の指定が不正（ドメインルールを満たさない）だと400が返り、返されるDTOはSchemaを満たす", async () => {
  const app = await setup();

  // Given
  const resp_create = await request(app, "/task", "POST", {
    title: "task", status: "unstarted", due: UNSPECIFIED
  });
  const respBody_created = createTaskResponseBodySchema.parse(await resp_create.json());
  const created = respBody_created.success ? respBody_created.value : unreachable();

  const updateTaskInput = {
    status: "in-progress"
    // startedAt 指定なし
  };

  // When
  const resp = await request(app, `/task/${created.id}`, "PUT", updateTaskInput);

  // Then
  assertEquals(resp.status, 400);
  const respBody = updateTaskResponseBodySchema.parse(await resp.json());
  assert(respBody.success === false);
  assertEquals(respBody.error.code, VALIDATION_FAILED);
});



Deno.test("idは不変であり、指定しても更新されない", async () => {
  const app = await setup();

  // Given
  const resp_create = await request(app, "/task", "POST", {
    title: "task", status: "unstarted", due: UNSPECIFIED
  });
  const respBody_created = createTaskResponseBodySchema.parse(await resp_create.json());
  const created = respBody_created.success ? respBody_created.value : unreachable();

  const updateTaskInput = {
    id: "Test-ID",
    title: "ID changed"
  };

  // When
  const resp = await request(app, `/task/${created.id}`, "PUT", updateTaskInput);
  const respBody = updateTaskResponseBodySchema.parse(await resp.json());
  const updated = respBody.success ? respBody.value : unreachable();
  
  // Then
  assertEquals(updated.id, created.id);
  assertEquals(updated.title, "ID changed");
});

Deno.test("すでに指定がされているプロパティにUNSPECIFIEDを指定すると、UNSPECIFIEDで更新される", async () => {
  const app = await setup();

  // Given
  const resp_create = await request(app, "/task", "POST", {
    title: "task",
    status: "unstarted",
    due: DATE_1
  });
  const respBody_created = createTaskResponseBodySchema.parse(await resp_create.json());
  const created = respBody_created.success ? respBody_created.value : unreachable();

  const updateTaskInput = {
    due: UNSPECIFIED
  };

  // When
  const resp = await request(app, `/task/${created.id}`, "PUT", updateTaskInput);
  const respBody = updateTaskResponseBodySchema.parse(await resp.json());
  const updated = respBody.success ? respBody.value : unreachable();

  // Then
  assertEquals(updated.due, UNSPECIFIED);
});

Deno.test("UNSPECIFIED許容でも、更新の指示を指定していないところはUNSPECIFIEDに更新されない", async () => {
  const app = await setup();

  // Given
  const resp_create = await request(app, "/task", "POST", {
    title: "task",
    status: "unstarted",
    due: DATE_1 // UNSPECIFIED許容
  });
  const respBody_created = createTaskResponseBodySchema.parse(await resp_create.json());
  const created = respBody_created.success ? respBody_created.value : unreachable();

  const updateTaskInput = {
    title: "task-updated"
    // due の更新を指定しない
  };

  // When
  const resp = await request(app, `/task/${created.id}`, "PUT", updateTaskInput);
  const respBody = updateTaskResponseBodySchema.parse(await resp.json());
  const updated = respBody.success ? respBody.value : unreachable();

  // Then
  assertEquals(updated.due, DATE_1_STR); // UNSPECIFIEDにならない
});

Deno.test("createdAtは不変であり、指定しても更新されない", async () => {
  const app = await setup();

  // Given
  const resp_create = await request(app, "/task", "POST", {
    title: "task", status: "unstarted", due: UNSPECIFIED
  });
  const respBody_created = createTaskResponseBodySchema.parse(await resp_create.json());
  const created = respBody_created.success ? respBody_created.value : unreachable();

  const updateTaskInput = {
    title: "updated task", // 更新を発生させるため指定
    createdAt: DATE_3
  };

  // When
  const resp = await request(app, `/task/${created.id}`, "PUT", updateTaskInput);
  const respBody = updateTaskResponseBodySchema.parse(await resp.json());
  const updated = respBody.success ? respBody.value : unreachable();
  
  // Then
  assertEquals(updated.createdAt, created.createdAt);
  assertNotEquals(updated.createdAt, DATE_3_STR);
});

Deno.test("updatedAtは更新時にサーバー側で決められ、指定してもその値にならない", async () => {
  const createdAt = DATE_1;
  const updatedAt = DATE_2;
  const clock = fixedClock(createdAt);
  const app = await setup({ clock });

  // Given
  const resp_create = await request(app, "/task", "POST", {
    title: "task", status: "unstarted", due: UNSPECIFIED
  });
  const respBody_created = createTaskResponseBodySchema.parse(await resp_create.json());
  const created = respBody_created.success ? respBody_created.value : unreachable();

  const updateTaskInput = {
    title: "updated task", // 更新を発生させるため指定
    createdAt: DATE_3
  };

  // When
  clock.setNow(updatedAt);
  const resp = await request(app, `/task/${created.id}`, "PUT", updateTaskInput);
  const respBody = updateTaskResponseBodySchema.parse(await resp.json());
  const updated = respBody.success ? respBody.value : unreachable();
  
  // Then
  assertEquals(updated.updatedAt, updatedAt.toISOString());
  assertNotEquals(updated.updatedAt, DATE_3_STR);
});



Deno.test("何も指定しないで更新しようとすると、エラーにならないが、更新されず updatedAt も変わらない", async () => {
  const createdAt = DATE_1;
  const updatedAt = DATE_2;
  const clock = fixedClock(createdAt);
  const app = await setup({ clock });

  // Given
  const resp_create = await request(app, "/task", "POST", {
    title: "task", status: "cancelled", due: DATE_1, startedAt: DATE_2, completedAt: DATE_3, cancelledAt: DATE_4
  });
  const respBody_created = createTaskResponseBodySchema.parse(await resp_create.json());
  const created = respBody_created.success ? respBody_created.value : unreachable();

  const updateTaskInput = { };

  // When
  clock.setNow(updatedAt);
  const resp = await request(app, `/task/${created.id}`, "PUT", updateTaskInput);
  const respBody = updateTaskResponseBodySchema.parse(await resp.json());
  const updated = respBody.success ? respBody.value : unreachable();
  
  // Then
  assertEquals(updated.updatedAt, created.updatedAt);
});
