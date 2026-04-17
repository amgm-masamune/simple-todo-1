# Code Review: DRY / SOLID / DDD

## Findings（重大度順）

### [Major] UpdateTaskUseCase が「状態変更」と「個別フィールド変更」を二重適用しており、入力組み合わせで矛盾エラーを起こす
- 対象:
  - [feature/Task/usecase/UpdateTaskUseCase.ts](../../../../feature/Task/usecase/UpdateTaskUseCase.ts#L35)
  - [feature/Task/usecase/UpdateTaskUseCase.ts](../../../../feature/Task/usecase/UpdateTaskUseCase.ts#L38)
  - [feature/Task/domain/Task.ts](../../../../feature/Task/domain/Task.ts#L67)
  - [feature/Task/domain/Task.ts](../../../../feature/Task/domain/Task.ts#L91)
- 問題:
  - status を changeStatus で更新した後、startedAt/completedAt/cancelledAt を再度 withXxx で個別更新している。
  - そのため、status=unstarted と startedAt=null を同時指定すると、toUnstarted 後に withStartedAt が呼ばれて例外化する（意図しない拒否）。
- 根拠:
  - `deno eval` で再現確認済み: `ERR 開始前のタスクは startedAt を持てません`。
- 影響:
  - API 利用者から見ると「同じ更新リクエストでも項目の組み合わせ次第で失敗」し、アプリケーションサービスの振る舞いが不安定。
  - SRP 的にも、UpdateTaskUseCase が状態遷移ルールと部分更新ルールを重複管理している。
- 修正案:
  - 方針A: status 指定時は changeStatus のみで状態系フィールドを完結させ、後続の withStartedAt/withCompletedAt/withCancelledAt をスキップ。
  - 方針B: status 更新と属性更新をコマンドとして分離し、1リクエスト1意図に制限。
- 追加テスト案:
  - `status: "unstarted", startedAt: null` を同時更新した時に例外にならない（または仕様として明示的に拒否する）ことを確認するテスト。

### [Major] 実行エントリポイントが deprecated な CLI コントローラに依存している
- 対象:
  - [main.ts](../../../../main.ts#L2)
  - [main.ts](../../../../main.ts#L8)
  - [feature/Task/handler/CliTaskController.ts](../../../../feature/Task/handler/CliTaskController.ts#L8)
  - [feature/Task/handler/CliTaskController.ts](../../../../feature/Task/handler/CliTaskController.ts#L23)
- 問題:
  - `@deprecated` と明記されたクラスが実行経路の中核（main）で使われている。
  - CLI 側は無限ループ実装で、入力異常時の回復や終了導線が明示されていない。
- 影響:
  - 運用時の不具合調査コスト上昇。特に UI/入出力境界の失敗時にユーザー体験を損なう可能性。
  - DDD の観点では、アプリケーションの主要ユースケース実行経路が「暫定・廃止予定」実装に依存している状態。
- 修正案:
  - `main.ts` から deprecated 依存を外す。
  - Controller を残すなら、終了条件・例外ハンドリング・入力バリデーションを追加し、テスト可能なインターフェース（I/O抽象）で分離する。
- 追加テスト案:
  - 入力が null/不正日時の場合のエラーハンドリングテスト。
  - 終了コマンドでループを抜けるテスト。

### [Major] 時刻比較テストが文字列連結になっており、意図通りの3秒判定になっていない
- 対象:
  - [test/task-service/task-service.test.ts](../../../../test/task-service/task-service.test.ts#L29)
- 問題:
  - `now.toISOString() + 3000` は「日時 + 3000ms」ではなく文字列連結。
  - 3秒以内判定のテストがロジック上不正確で、将来の変更で誤検知/見逃しを起こしうる。
- 影響:
  - テスト品質低下により、設計変更時に安全網として機能しない。
- 修正案:
  - `task.createdAt.getTime() <= now.getTime() + 3000` のように数値比較へ変更。
  - 可能であれば固定 Clock を使って deterministic にする。
- 追加テスト案:
  - +1ms / +2999ms / +3001ms の境界値テスト。

### [Minor] ドメイン不変条件の判定ロジックが複数箇所に重複している（DRY違反）
- 対象:
  - [feature/Task/domain/Task.ts](../../../../feature/Task/domain/Task.ts#L111)
  - [feature/Task/domain/Task.ts](../../../../feature/Task/domain/Task.ts#L125)
  - [feature/Task/domain/Task.ts](../../../../feature/Task/domain/Task.ts#L292)
  - [feature/Task/domain/Task.ts](../../../../feature/Task/domain/Task.ts#L302)
- 問題:
  - startedAt/completedAt 必須条件が toXxx 系メソッドと validateStatus の双方で判定されている。
- 影響:
  - 仕様変更時の修正漏れリスク。
- 修正案:
  - 状態遷移時の前提チェックを1箇所に集約し、もう片方は委譲する。

### [Minor] 使われていない空のサービスが残存している
- 対象:
  - [feature/Task/usecase/TaskUseCase.ts](../../../../feature/Task/usecase/TaskUseCase.ts#L1)
- 問題:
  - 空オブジェクトのエクスポートのみで責務不明。
- 影響:
  - 読み手に誤解を生み、DDD の層構造理解を妨げる。
- 修正案:
  - 使用予定がないなら削除。将来利用するならインターフェースと責務コメントを追加。

### [Minor] テストの保守性低下（TODO未実装・重複名）
- 対象:
  - [test/task/changeStatus.test.ts](../../../../test/task/changeStatus.test.ts#L267)
  - [test/task/creation.test.ts](../../../../test/task/creation.test.ts#L199)
  - [test/task/creation.test.ts](../../../../test/task/creation.test.ts#L225)
- 問題:
  - 状態遷移テストに TODO が残っている。
  - 同名テストが存在し、失敗時の特定がしづらい。
- 影響:
  - 回帰時の調査時間増加。
- 修正案:
  - TODO の観点をテストに落とし込む。
  - テスト名を一意化する。

## DRY / SOLID / DDD で「即している」点

- DIP（SOLID）
  - ユースケースは `ITaskRepository` に依存しており、具象実装に直接依存していない。
  - 参照: [feature/Task/domain/TaskRepository.ts](../../../../feature/Task/domain/TaskRepository.ts#L3), [feature/Task/usecase/CreateTaskUseCase.ts](../../../../feature/Task/usecase/CreateTaskUseCase.ts#L20)

- 依存解決の集中（SOLID/アーキテクチャ）
  - Composition Root に依存配線を集約している。
  - 参照: [composition-root/CompositionRoot.ts](../../../../composition-root/CompositionRoot.ts#L26), [composition-root/CompositionRoot.ts](../../../../composition-root/CompositionRoot.ts#L40)

- 不変条件のエンティティ集中（DDD）
  - `Task` の private constructor と validate 群でドメインルールを保護している。
  - 参照: [feature/Task/domain/Task.ts](../../../../feature/Task/domain/Task.ts#L27), [feature/Task/domain/Task.ts](../../../../feature/Task/domain/Task.ts#L31), [feature/Task/domain/Task.ts](../../../../feature/Task/domain/Task.ts#L285)

- テスト容易性のための抽象化（SOLID）
  - Clock/IdGenerator を差し替え可能にしている。
  - 参照: [common/Clock.ts](../../../../common/Clock.ts#L1), [common/IdGenerator.ts](../../../../common/IdGenerator.ts#L1), [composition-root/CompositionRoot.ts](../../../../composition-root/CompositionRoot.ts#L20)

## Open Questions

- タイトル空文字を許容する仕様は確定か。
  - 参照: [feature/Task/domain/Task.ts](../../../../feature/Task/domain/Task.ts#L184), [test/task/creation.test.ts](../../../../test/task/creation.test.ts#L63)
- completed/cancelled で startedAt/completedAt/cancelledAt に null を広く許容する設計は、運用要件（監査ログや分析）と整合しているか。

## Summary

重大な設計リスクは 3 点（更新ロジックの二重適用、deprecated 依存の実行経路、時刻比較テスト不備）です。特に UpdateTaskUseCase の二重適用は再現済みで、仕様意図と異なる失敗を引き起こします。DRY/SOLID/DDD の基盤（Repository 抽象、Composition Root、エンティティ不変条件集中）は良い方向なので、まずはアプリケーションサービスの責務整理とテスト品質改善を優先すると全体品質が大きく改善します。
