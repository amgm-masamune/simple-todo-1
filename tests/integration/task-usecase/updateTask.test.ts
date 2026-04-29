// import { createDependencies } from "@deps/CompositionRoot.ts";
// import { dbTest } from "../task-repository/PgDrizzleTaskRepository/helper.ts";
// import { UNSPECIFIED } from "@feature/Task/domain/Task.ts";
// import { DATE_1, DATE_2, DATE_6, fixedClock } from "../../helper.ts";
// import { assertEquals } from "@std/assert";

// Deno.test("[integration] UpdateTaskUseCase", async t => {
//   const clock = fixedClock(DATE_1);
//   await using deps = await createDependencies("pg-drizzle", { clock });

//   await t.step("更新中に同じプロパティの更新があった場合、後の更新が採用される", () =>
//     dbTest(deps, async tx => {
//       // Given
//       const task = await deps.createTaskUseCase.execute({ 
//         title: "ver1", 
//         status: "in-progress", 
//         due: UNSPECIFIED,
//         startedAt: UNSPECIFIED
//       });
      
//       // 100ミリ秒待機するクロック 
//       clock.now = async () => {
//         await new Promise(r => setTimeout(r, 100));
//         return DATE_6
//       };

//       // When
//       const [ver2, ver3] = await Promise.all([
//         deps.updateTaskUseCase.execute({ 
//           id: task.id, 
//           title: "ver2", 
//           status: "completed", 
//           completedAt: DATE_1
//         }),
//         deps.updateTaskUseCase.execute({ 
//           id: task.id, 
//           title: "ver3",
//           startedAt: DATE_2
//         })
//       ]);

//       // Then
//       const stored = await deps.findTaskByIdUseCase.execute({ id: task.id });
//       assertEquals(stored.title, ver3.title);
//       assertEquals(stored.status, ver2.status);
//       assertEquals(stored.due, task.due);
//       assertEquals(stored.startedAt, ver3.startedAt);
//       assertEquals(stored.completedAt, ver2.completedAt);

//       // 後処理
//       // トランザクションを利用していないため対象をこの場で削除
//       await deps.deleteTaskUseCase.execute({ id: task.id });
//     })
//   );
  
//   await t.step("更新中に異なるプロパティの更新があった場合、両方の更新が反映される", () =>
//     dbTest(deps, async tx => {
//       throw "TODO"
  
//     })
//   );
  
//   await t.step("更新中に削除の要求があった場合、更新後エラーなく削除される。", () =>
//     dbTest(deps, async tx => {
//       throw "TODO"
  
//     })
//   );
// });