import { assert, assertEquals, assertNotEquals } from "@std/assert";
import { taskDtoScheme } from "../../feature/Task/handler/web-api/TaskDto.ts";
import { setup, requestJson } from "./helper.ts";
import { DATE_1, DATE_2, fixedClock, DATE_3, DATE_4 } from "../helper.ts";
import { NOT_SPECIFIED } from "../../feature/Task/domain/Task.ts";

Deno.test("タスクを正常に更新すると200が返り、返されるDTOはSchemaを満たす", async () => {
  const app = setup();

  // Given
  const resp_create = await requestJson(app, "/task", "POST", {
    title: "test", status: "unstarted", due: NOT_SPECIFIED
  });
  const created = await resp_create.json();

  const updateTaskInput = {
    title: "test",
    status: "completed",
    due: DATE_1,
    startedAt: NOT_SPECIFIED,
    completedAt: DATE_2
  };

  // When
  const resp = await requestJson(app, `/task/${created.id}`, "PUT", updateTaskInput);

  // Then
  const respBody = await resp.json();
  const updated = taskDtoScheme.parse(respBody);

  assert(updated.id.length > 0);
  assertEquals(updated.title, updateTaskInput.title);
  assertEquals(updated.due, updateTaskInput.due.toISOString());
  assertEquals(updated.startedAt, updateTaskInput.startedAt); // NOT_SPECIFIED
  assertEquals(updated.completedAt, updateTaskInput.completedAt.toISOString());
  assertEquals(created.createdAt, updated.createdAt);
  assertNotEquals(created.updatedAt, updated.updatedAt);
});

Deno.test("何も指定しないで更新しようとすると、エラーにならないが、更新されず updatedAt も変わらない", async () => {
  const createdAt = DATE_1;
  const updatedAt = DATE_2;
  const clock = fixedClock(createdAt);
  const app = setup({ clock });

  // Given
  const resp_create = await requestJson(app, "/task", "POST", {
    title: "test", status: "cancelled", due: DATE_1, startedAt: DATE_2, completedAt: DATE_3, cancelledAt: DATE_4
  });
  const created = taskDtoScheme.parse(await resp_create.json());

  // When
  const updateTaskInput = {
    id: created.id
  };

  const resp = await requestJson(app, `/task/${created.id}`, "PUT", updateTaskInput);
  
  // Then
  clock.setNow(updatedAt);
  const updated = taskDtoScheme.parse(await resp.json());

  assertEquals(created, updated);
});

Deno.test("更新される最小限の指定で更新できる", async () => {
  const createdAt = DATE_1;
  const updatedAt = DATE_2;
  const clock = fixedClock(createdAt);
  const app = setup({ clock });

  // Given
  const resp_create = await requestJson(app, "/task", "POST", {
    title: "test", status: "unstarted", due: NOT_SPECIFIED
  });
  const created = await resp_create.json();

  const updateTaskInput = {
    title: "test"
  };

  // When
  clock.setNow(updatedAt);
  const resp = await requestJson(app, `/task/${created.id}`, "PUT", updateTaskInput);

  // Then
  const respBody = await resp.json();
  const updated = taskDtoScheme.parse(respBody);

  assert(updated.id.length > 0);
  assertEquals(updated.title, updateTaskInput.title);
  assertNotEquals(created.updatedAt, updated.updatedAt);
});


Deno.test("completedAt がないと完了への状態変更はできない", async () => {
  const createdAt = DATE_1;
  const updatedAt = DATE_2;
  const clock = fixedClock(createdAt);
  const app = setup({ clock });

  // Given
  const resp_create = await requestJson(app, "/task", "POST", {
    title: "test", status: "unstarted", due: NOT_SPECIFIED
  });
  const created = await resp_create.json();

  const updateTaskInput = {
    title: "test",
    status: "completed",
    due: DATE_1,
    startedAt: NOT_SPECIFIED,
    // completedAt: DATE_2
  };

  // When
  clock.setNow(updatedAt);
  const resp = await requestJson(app, `/task/${created.id}`, "PUT", updateTaskInput);

  // Then
  assertEquals(resp.status, 400);
});


Deno.test("createdAt を指定しても更新されない", async () => {
  const createdAt = DATE_1;
  const updatedAt = DATE_2;
  const clock = fixedClock(createdAt);
  const app = setup({ clock });

  // Given
  const resp_create = await requestJson(app, "/task", "POST", {
    title: "test", status: "cancelled", due: DATE_1, startedAt: DATE_2, completedAt: DATE_3, cancelledAt: DATE_4
  });
  const created = await resp_create.json();

  const updateTaskInput = {
    createdAt: DATE_4
  };

  // When
  clock.setNow(updatedAt);
  const resp = await requestJson(app, `/task/${created.id}`, "PUT", updateTaskInput);

  // Then
  const updated = await resp.json();

  assertEquals(created.createdAt, updated.createdAt);
});

