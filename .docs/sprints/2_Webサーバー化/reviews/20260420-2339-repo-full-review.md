# Repo Full Review (2026-04-20)

## Findings（重大度順）

### [Critical] null -> NOT_SPECIFIED 移行が層ごとに不整合で、実行時例外・API破綻・テスト大量失敗を引き起こしている
- 対象箇所:
  - feature/Task/domain/Task.ts:15
  - feature/Task/domain/Task.ts:204
  - feature/Task/domain/Task.ts:209
  - feature/Task/usecase/CreateTaskUseCase.ts:9
  - feature/Task/handler/web-api/handler.ts:17
  - feature/Task/handler/web-api/handler.ts:45
  - feature/Task/handler/web-api/TaskDto.ts:9
  - feature/Task/handler/web-api/TaskDto.ts:51
  - test/task-web-api/zod-scheme.test.ts:13
- 問題:
  - ドメインでは Date | NOT_SPECIFIED に寄せ始めている一方、UseCase/API DTO スキーマは string | null 前提のままで混在している。
  - その結果、date 変換/直列化でオブジェクトを Date 扱いし、toISOString/getTime 実行時に落ちる。
- 根拠:
  - 最新の全テスト実行結果: `FAILED | 88 passed | 23 failed`。
  - 主な失敗は TaskDto の `date.toISOString is not a function`（feature/Task/handler/web-api/TaskDto.ts:51）と、レスポンススキーマ不一致（id/title/due/createdAt/updatedAt が undefined）に集中。
- 影響:
  - APIの入出力契約が崩壊し、Web API テスト群が連鎖的に失敗。
  - リファクタ途中の状態で保存/実行すると、利用者に 4xx/5xx の不整合が露出する。
- 修正案:
  - まず「入力契約」「ドメイン内部表現」「出力契約」を分離する。
  - API入出力は当面 `null` 互換を維持し、ドメイン内部だけ NOT_SPECIFIED へ寄せる（変換レイヤーを TaskDto か Handler に一本化）。
  - `dateToISOStringOrNull*` 系で NOT_SPECIFIED を明示分岐し、Date 以外で toISOString しない。
  - `zod-scheme.test.ts` の `notSpecifiedSchema` 未定義を解消し、schema を実装と共有する。
- 追加テスト案:
  - 入力 `null` / `{ type: "not-specified" }` / ISO文字列 の3パターンを create/update/find/getAll で往復検証。

### [Major] 本番エントリポイントが API ハンドラを接続しておらず、起動してもタスク API が使えない
- 対象箇所:
  - main.ts:5
  - main.ts:10
  - feature/Task/handler/web-api/handler.ts:32
- 問題:
  - `main.ts` は `"/"` の Hello レスポンスだけで、`createHandlers` を呼んでいない。
- 根拠:
  - API ルート定義は `createHandlers` に存在するが、`main.ts` 側の結線がない。
- 影響:
  - テストでは helper 経由で API が動いても、`deno task start` で起動した実アプリでは利用不能。
- 修正案:
  - `main.ts` で `createDependencies("in-memory")` と `createHandlers(app, deps)` を呼ぶ。

### [Major] Web API のエラーハンドリングが内部実装に依存し、運用・セキュリティ上のリスクがある
- 対象箇所:
  - feature/Task/handler/web-api/handler.ts:35
  - feature/Task/handler/web-api/handler.ts:54
  - feature/Task/handler/web-api/handler.ts:67
  - feature/Task/handler/web-api/handler.ts:86
  - feature/Task/handler/web-api/handler.ts:165
- 問題:
  - バリデーション失敗時に request body を丸ごとログ出力。
  - 例外オブジェクトをそのまま `c.json(e, ...)` で返却。
- 根拠:
  - 生ログ出力 + 生例外返却が実装されている。
- 影響:
  - 将来的に機微情報を含む payload が混入した場合、ログ漏えいリスク。
  - クライアント向けエラー契約が不安定（Error 実装依存）。
- 修正案:
  - `ApiErrorResponse` を固定スキーマ化（`code`, `message`, `details?`）。
  - ログは sanitize し、payload 全文は出さない。
  - NotFound 判定を message 部分一致ではなく専用エラー型で分岐する。

### [Major] テストが意図した仕様を検証できていない箇所がある（偽陽性リスク）
- 対象箇所:
  - test/task/handle.test.ts:132
  - test/task/handle.test.ts:146
  - test/task-web-api/updateTaskApi.test.ts:56
  - test/task-web-api/updateTaskApi.test.ts:59
- 問題:
  - 「キャンセル日時を変更できる」テストで `withCancelledAt` ではなく `withCompletedAt` を呼んでいる。
  - 「updatedAt が変わらない」テストで時刻更新が API 呼び出し後に行われており、異常系を検出しにくい。
- 影響:
  - 仕様退行があってもテストが検知しない可能性。
- 修正案:
  - テスト名と呼び出しメソッド/検証対象を一致させる。
  - 時刻依存テストは必ず `clock.setNow()` を操作前に行う。

### [Minor] エラー応答の契約テストが未完了で、回帰防止が弱い
- 対象箇所:
  - test/task-web-api/createTaskApi.test.ts:43
  - test/task-web-api/createTaskApi.test.ts:45
- 問題:
  - TODO コメントのまま、400時レスポンスボディの構造検証が未実装。
- 影響:
  - エラーフォーマット変更時にテストが守ってくれない。
- 修正案:
  - 400/404 の response schema を定義し、APIテストで parse して検証する。

## Open Questions
- API 契約として、`null` を後方互換で維持しますか？それとも `{ type: "not-specified" }` に完全移行しますか？
- `NOT_SPECIFIED` は「外部契約にも露出する値」か、「ドメイン内部のみの表現」か、どちらを採用しますか？

## Summary
- もっとも重大なのは、`null` から `NOT_SPECIFIED` への移行が未完了な点です。層間で型とスキーマが揃っておらず、API/DTO/テストに連鎖障害が出ています。
- 加えて、`main.ts` の配線不足で実行時に API ルートが立たない点、エラーハンドリングの生例外返却・生ログ出力はリリース前に是正が必要です。
- まずは「契約（API）」「変換（DTO/Handler）」「内部表現（Domain）」の境界を固定し、そのうえでテストを仕様ベースに修正するのが最短です。
