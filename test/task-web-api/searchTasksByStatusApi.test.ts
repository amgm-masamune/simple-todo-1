import { assertEquals, assertExists } from "@std/assert";
import { taskDtoScheme } from "../../feature/Task/handler/web-api/TaskDto.ts";
import { setup, requestJson } from "./helper.ts";

Deno.test("取得できれば200が返り、取得したDTOがSchemaに合っている", async () => {
  throw new Error("TODO");
});

Deno.test("指定した status のタスクが無ければ空配列が返る", async () => {
  throw new Error("TODO");
});

Deno.test("指定した status のタスクが1件あれば1件のみ取得できる", async () => {
  throw new Error("TODO");
});

Deno.test("指定した status のタスクが複数あれば複数取得できる", async () => {
  throw new Error("TODO");
});

