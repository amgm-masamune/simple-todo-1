# Senior Code Review — Sprint2 Web Server 再レビュー

**日時:** 2026-04-26  
**対象:** PR `Feature/sprint2 web server 実装`（再レビュー）  
**レビュアー:** Copilot (senior-code-review スキル)

---

## 前回指摘事項の確認（7件 → 全て修正済み）

| # | 指摘箇所 | 内容 | 状態 |
|---|----------|------|------|
| 1 | `GetAllTasksUseCase.ts` | `execute(_input: void)` → 引数不要に修正 | ✅ 修正済み |
| 2 | `test/task/creation.test.ts` | `node:console` からの未使用 `assert` import | ✅ 修正済み |
| 3 | `feature/Task/domain/Task.ts:322` | `completed` 分岐のエラーメッセージが「進行中」になっていた | ✅ 修正済み |
| 4 | `test/task/changeStatus.test.ts:47` | テスト名の `NOT_SPECIFIED` → `UNSPECIFIED` に統一 | ✅ 修正済み |
| 5 | `feature/Task/handler/web-api/helper.ts:69-74` | `e.message.includes("見つかりません")` → `instanceof NotFoundError` に変更 | ✅ 修正済み |
| 6 | `test/task-web-api/deleteTaskApi.test.ts:45-50` | `assertExists(error.code, NOT_FOUND)` → `assertEquals(error.code, NOT_FOUND)` に修正 | ✅ 修正済み |
| 7 | `.vscode/extentions.json` | ファイル名 typo → `extensions.json` に修正 | ✅ 修正済み |

---

## 新規指摘事項

---

### [Major] `assertRejects` に `await` が欠けており、エラー検証が機能していない

**対象箇所:**  
- `test/task-usecase/updateTask.test.ts:46` （「指定したIDのタスクが見つからないと NotFound エラーになる」）  
- `test/task-usecase/updateTask.test.ts:62` （「ドメインルールを満たさないタスクの更新では ValidationError が返る」）

**問題:**  
```ts
// 現在（誤り）
assertRejects(() =>
  updateTaskUseCase.execute({ id: "Invalid ID", title: "Invalid Task ID" }),
  NotFoundError
);
```
`assertRejects` は `Promise<void>` を返す非同期関数です。`await` なしで呼び出すと、テストランナーはその Promise を待たずにテスト関数が終了し、**実際にエラーが発生してもテストが常に通ってしまいます**。意図した「NotFoundError が発生すること」の検証が機能していません。

**修正案:**
```ts
// 修正後
await assertRejects(() =>
  updateTaskUseCase.execute({ id: "Invalid ID", title: "Invalid Task ID" }),
  NotFoundError
);
```

**追加テスト案:** 修正後は既存テストで意図通りの検証が実現されます。

---

### [Major] 不正な `status` を `GET /tasks/status/:status` に渡すと 500 が返る

**対象箇所:** `feature/Task/handler/web-api/handler.ts:112-120`

**問題:**
```ts
app.get("/tasks/status/:status", async c => {
  try {
    const status = taskStatusSchema.parse(c.req.param("status")); // ← ZodError
    ...
  } catch (e) {
    return handleError(c, e);  // ZodError → UNEXPECTED_ERROR → 500
  }
});
```
`/tasks/status/invalid-status` のようなリクエストを送ると `taskStatusSchema.parse()` が `ZodError` を throw します。`handleError` は `ZodError` を `ValidationError` でも `NotFoundError` でもないとして `UNEXPECTED_ERROR (500)` を返してしまいます。クライアントへは「入力値が不正」として 400 を返すべきです。

**修正案:**
```ts
// handleError に ZodError のケースを追加する
import { ZodError } from "zod";

export function handleError(c: Context, e: unknown) {
  if (e instanceof ValidationError || e instanceof ZodError) {
    return responseFailed(c, { code: VALIDATION_FAILED, message: e instanceof Error ? e.message : "不正な型です" }, 400);
  } else if (e instanceof NotFoundError) {
    return responseFailed(c, { code: NOT_FOUND, message: "指定されたタスクが見つかりません" }, 404);
  } else {
    return responseFailed(c, { code: UNEXPECTED_ERROR, message: "予期しないエラーが発生しました" }, 500);
  }
}
```
または、try 内でスキーマパース失敗を先に検出して `responseFailed` する方法でも可。

**追加テスト案:** `GET /tasks/status/invalid-status` で 400 が返ることを確認するテストを追加。

---

### [Minor] `UpdateTaskUseCaseInput` のフィールドが `readonly` でない

**対象箇所:** `feature/Task/usecase/UpdateTaskUseCase.ts:5-13`

**問題:**
```ts
// UpdateTaskUseCaseInput — readonly なし
type UpdateTaskUseCaseInput = {
  id: string;
  title?: string;
  ...
};

// CreateTaskUseCaseInput — readonly あり（統一されていない）
export type CreateTaskUseCaseInput = {
  readonly title: string;
  readonly status: TaskStatus;
  ...
};
```
`CreateTaskUseCaseInput` では `readonly` が付いているが `UpdateTaskUseCaseInput` では付いていない。ユースケースの入力値は呼び出し元から変更されないことを型で保証するため、統一すべきです。

**修正案:**
```ts
type UpdateTaskUseCaseInput = {
  readonly id: string;
  readonly title?: string;
  readonly status?: TaskStatus;
  readonly due?: Date | UNSPECIFIED;
  readonly startedAt?: Date | UNSPECIFIED;
  readonly completedAt?: Date | UNSPECIFIED;
  readonly cancelledAt?: Date | UNSPECIFIED;
};
```

---

### [Minor] `zod-scheme.test.ts` でテスト失敗を `console.log` して再 throw するパターン

**対象箇所:** `test/task-web-api/zod-scheme.test.ts:28-35`

**問題:**
```ts
try {
  const res = CreateTaskInputSchema.parse(createTaskInput);
  assertEquals(res.status, "completed");
} catch (e) {
  console.log(e);  // エラー内容を表示するだけ
  throw e;
}
```
パースエラーの詳細をデバッグしたいなら有用ですが、テストとして見ると不要な `try/catch` で可読性が下がります。Deno のテストランナーは既にエラーの詳細を出力するため、このパターンは冗長です。

**修正案:**
```ts
// try/catch を削除してシンプルに
const res = CreateTaskInputSchema.parse(createTaskInput);
assertEquals(res.status, "completed");
```

---

### [Minor] `searchTasksByStatusApi.test.ts` にコメントアウトされたテストが残っている

**対象箇所:** `test/task-web-api/searchTasksByStatusApi.test.ts:32-38`

**問題:**
```ts
// Deno.test("指定した status のタスクが無ければ空配列が返る", async () => {
//   throw new Error("TODO");
// });

// Deno.test("指定した status のタスクが1件あれば1件のみ取得できる", async () => {
//   throw new Error("TODO");
// });
```
コメントアウトされたTODOテストが残っている。前回レビューの反省として「コメントアウトしたテストコードを削除」が commit メッセージに書かれていますが、このファイルには残っています。

**修正案:** 実装するか、削除してください。

---

## Open Questions

**Q1:** `UpdateTaskUseCase` において `changeStatus` で状態変更した後に `withStartedAt` / `withCompletedAt` / `withCancelledAt` を個別に呼ぶ二段階更新の設計意図は何でしょうか？  
現状では `status=in-progress, startedAt=DATE_1` を同時に指定すると、`changeStatus({ startedAt: DATE_1 })` 後に `withStartedAt(DATE_1)` が再度呼ばれる二重適用になっています。仕様上問題はないですが、設計の意図を明示したコメントがあると保守性が上がります。

---

## Summary

**全体所見:**  
- 前回7件の指摘は全て修正されており、対応の速さと丁寧さは評価できます。
- `assertRejects` への `await` 欠如（**Major**）は、テストが意図通りに動作していないバグです。Deno のテストランナーは Promise 待機なしのエラーを検知しないため、早急な修正を推奨します。
- 不正な status への 500 レスポンス（**Major**）は、クライアントへの誤ったエラーコードになるため修正が必要です。
- `readonly` の不統一、コメントアウト残りは Minor ですが、コードベースの一貫性のために対応を推奨します。

**残余リスク（未検証観点）:**  
- `InMemoryTaskRepository` は永続化なし（再起動でデータ消失）。本番用 DB への置き換えは別タスクとして管理が必要。  
- 認証・認可の実装が未着手（現状は誰でも全タスクにアクセス・変更可能）。
- `deno.json` の lint/型チェック設定の確認は未実施。
