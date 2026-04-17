# Repository Full Review (2026-04-13)

## Findings

### [Critical] タイトル・期限更新で状態が未着手に巻き戻る
- 対象箇所
  - domain/Task/Task.ts:25
  - domain/Task/Task.ts:29
  - usecase/Task/TaskService.ts:119
  - usecase/Task/TaskService.ts:122
- 問題
  - Task.toTitleChanged と Task.toDueChanged が常に Task.Unstarted を返すため、進行中/完了/キャンセルのタスクに対する title/due 更新時に status と関連日時が失われる。
- 根拠
  - toTitleChanged と toDueChanged の実装がそれぞれ return new Task.Unstarted(...)。
  - TaskService.update は status に関係なくこれらを呼ぶ。
- 影響
  - 進行中/完了/キャンセルタスクの業務状態が意図せず未着手に変わるデータ破壊（状態整合性の破壊）。
- 修正案
  - Task 基底ではなく各状態クラスに title/due 更新メソッドを持たせ、同一状態型を返す。
  - もしくは TaskService 側で現在状態を判定し、同一状態のコンストラクタで再構築する。
- 追加テスト案
  - in-progress, completed, cancelled それぞれに対し title/due 更新後も status が維持されることを検証。

### [Major] cancelled -> completed の遷移が実装と仕様意図で不整合
- 対象箇所
  - usecase/Task/TaskService.ts:94
  - usecase/Task/TaskService.ts:104
  - domain/Task/Task.ts:158
- 問題
  - status: "completed" 指定時に Cancelled からの遷移で toInProgress を呼んでおり、completed にならない。
- 根拠
  - Task.Cancelled には toCompleted(updatedAt) が定義されているにもかかわらず、TaskService 側で未使用。
- 影響
  - API 契約（completed を要求）と実結果（in-progress）が乖離し、クライアント側で誤動作・混乱を招く。
- 修正案
  - TaskService.update の completed 分岐で Cancelled の場合は toCompleted(now) を呼ぶ。
  - 必要なら completedAt 指定ルールを明文化し、null 許容方針を統一する。
- 追加テスト案
  - cancelled -> completed の状態変更で status が completed になること。

### [Major] 主要状態遷移の回帰テスト不足で不具合を検知できていない
- 対象箇所
  - test/task/handle.test.ts:8
  - test/task/handle.test.ts:41
  - test/task-service/task-service.test.ts:157
- 問題
  - title/due 更新テストが未着手のみで、他状態をカバーしていない。
  - cancelled -> completed の遷移ケースがテストされていない。
- 根拠
  - handle.test は Unstarted を起点にした検証のみ。
  - task-service.test に cancelled -> completed を直接検証するテストが存在しない。
- 影響
  - 実運用で起きる状態破壊を CI が検出できない。
- 修正案
  - 状態遷移表に沿ったパラメタライズテストを追加。
  - 更新 API の副作用（status, startedAt, completedAt, cancelledAt 維持/変化）を網羅。

### [Minor] 移植性と可読性の軽微リスク
- 対象箇所
  - repository/Task/InMemoryTaskRepository.ts:1
  - repository/Task/InMemoryTaskRepository.ts:2
  - repository/Task/InMemoryTaskRepository.ts:19
- 問題
  - import パスに二重スラッシュが含まれる。
  - Iterator Helpers 依存の toArray() を使っており、実行環境差異が出る可能性がある。
- 根拠
  - いずれも動作はしているが、環境依存のトラブルシュートを難しくする。
- 影響
  - 将来ランタイム変更時の互換性リスク、読みやすさ低下。
- 修正案
  - パスを正規化し、Array.from(this.#dataset.values()).filter(...) など互換性の高い書き方に寄せる。

## Open Questions
- cancelled -> completed で completedAt を必須にするか、null を許容するかの仕様を確定したい。

## Summary
- 全テストは現時点で通過するが、状態管理のコアロジックに重大な整合性欠陥がある。
- 特に title/due 更新時の状態巻き戻りは優先度最高で修正が必要。
- テスト不足が原因で検知漏れしているため、状態遷移テストの網羅を優先するべき。