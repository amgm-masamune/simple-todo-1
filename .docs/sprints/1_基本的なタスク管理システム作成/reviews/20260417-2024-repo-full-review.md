# リポジトリ全体コードレビュー（2026-04-17）

## Findings（重大度順）

### [Major] Task の状態不変条件が実装上は破れる
- 対象箇所:
  - feature/Task/domain/Task.ts:31
  - feature/Task/domain/Task.ts:285
  - feature/Task/domain/Task.ts:146
- 問題:
  - status が unstarted でも startedAt/completedAt/cancelledAt を持てる。
  - status が in-progress でも completedAt を持てる。
  - status が cancelled へ遷移する際に completedAt を明示的に消していない。
- 根拠:
  - validateStatus の unstarted 分岐は禁止条件をチェックしていない（line 287-288）。
  - in-progress 分岐は startedAt 必須のみで completedAt/cancelledAt の禁止をしていない（line 290-295）。
  - toCancelled は spread 後に status/cancelledAt だけ差し替えるため、既存 completedAt を引き継ぐ（line 146-150）。
  - 実行確認で unstarted に startedAt、in-progress に completedAt を与えて生成できることを確認済み。
- 影響:
  - ドメインデータが矛盾状態になり、後続ロジック（検索・表示・将来の永続化）で状態解釈が不安定になる。
- 修正案:
  - status ごとに許可/禁止される timestamp を明示したバリデーション表を作り、constructor と changeStatus 両方で一貫適用する。
  - toCancelled で completedAt を undefined にリセットするなど、遷移先状態に不要な値を必ず消す。
- 追加テスト案:
  - unstarted + startedAt/completedAt/cancelledAt を拒否するテスト。
  - in-progress + completedAt を拒否するテスト。
  - completed -> cancelled 遷移後に completedAt が消えることを検証するテスト。

### [Major] Entity が外部から破壊可能（Date 参照共有）
- 対象箇所:
  - feature/Task/domain/Task.ts:40
  - feature/Task/domain/Task.ts:55
  - feature/Task/repository/InMemoryTaskRepository.ts:14
  - feature/Task/repository/InMemoryTaskRepository.ts:21
- 問題:
  - Task は readonly プロパティだが Date はミュータブルなため、外部から setUTC* で内部状態を書き換えられる。
  - リポジトリも同一インスタンスを返却しており、参照漏れによる副作用が起きる。
- 根拠:
  - constructor で Date を防御コピーせず代入（line 40-48）。
  - copy も spread で参照を引き継ぐ（line 55-57）。
  - 実行確認で生成時に渡した due を後から変更すると task.due が変化することを確認済み。
- 影響:
  - バリデーションを通らない更新が可能になり、整合性が崩れる。
- 修正案:
  - 受け取り時と返却時に Date を clone する。
  - 可能なら Date を値オブジェクト（ISO文字列や独自 immutable type）へ置き換える。
- 追加テスト案:
  - 入力 Date を mutate しても Task 内部値が変わらないことを検証するテスト。

### [Major] 状態遷移テストに空テストが残っており、回帰を検知できない
- 対象箇所:
  - test/task/changeStatus.test.ts:217
  - test/task/changeStatus.test.ts:221
  - test/task/changeStatus.test.ts:225
  - test/task/changeStatus.test.ts:229
- 問題:
  - TODO のまま assertion なしのテストが4件あり、常に成功する。
- 根拠:
  - テスト本体が空実装で、実際の遷移ロジックを検証していない。
- 影響:
  - 進行中系の遷移ロジックが壊れても CI が検知できない。
- 修正案:
  - TODO テストを Given/When/Then で実装し、最低1件は失敗系（必須値不足）を追加する。

### [Major] 完了日時編集テストが誤ったメソッドを検証している
- 対象箇所:
  - test/task/handle.test.ts:113
  - test/task/handle.test.ts:125
  - test/task/handle.test.ts:127
- 問題:
  - 「完了日時の編集を許容」というテスト名にもかかわらず withStartedAt を呼んで startedAt を検証している。
- 根拠:
  - line 125 で withStartedAt 呼び出し、line 127 で startedAt を比較。
- 影響:
  - completedAt 更新ロジックの回帰が見逃される。
- 修正案:
  - withCompletedAt を呼び、completedAt を比較するテストへ修正する。

### [Major] searchActiveTasks のテストが不正確で期待値を取り違えている
- 対象箇所:
  - test/task-service/task-service.test.ts:96
  - test/task-service/task-service.test.ts:98
- 問題:
  - tasks[0].due と originalInp.due を比較しており、配列2件目の内容を検証していない。
- 根拠:
  - line 96 で length=2 を確認するが、line 98 が tasks[0] を参照したまま。
- 影響:
  - in-progress タスクが混入/欠落しても偶然グリーンになる可能性がある。
- 修正案:
  - 返却配列を id/title の集合で比較する、または sort 後に 2 件それぞれの要素を明示検証する。

### [Minor] CLI の入力バリデーション不足で意図しない状態が作成される
- 対象箇所:
  - feature/Task/handler/CliTaskController.ts:71
  - feature/Task/handler/CliTaskController.ts:78
  - feature/Task/handler/CliTaskController.ts:85
  - feature/Task/handler/CliTaskController.ts:92
  - main.ts:8
- 問題:
  - status が 1/2 以外だと completed 扱いになる分岐になっている。
  - title が null の場合に再帰呼び出しするため、繰り返しでスタックが増える。
  - このコントローラは @deprecated だが main から実行されている。
- 根拠:
  - line 78/85 の if 以外は最終的に completed 作成（line 92）。
  - line 73 で再帰。
  - main.ts line 8 で controller.main() を実行。
- 影響:
  - 入力ミス時の誤登録、運用時の予期しない動作。
- 修正案:
  - status は明示的に switch で分岐し default でエラー再入力。
  - 再帰ではなくループで再入力処理。
  - 使わないなら main から切り離す。

## Open Questions
- completed と cancelled を同時保持可能にする設計意図はありますか（履歴保持目的か、排他にしたいか）。
- CLI は今後も実行経路として維持しますか。それとも検証専用で main から外しますか。

## Summary
- テストは 56 件すべてグリーンでしたが、実装不具合というより「不変条件の抜け」と「テストの偽陽性」が主要リスクでした。
- 特に Task の状態整合性と Date 参照共有は、将来の機能追加時に高確率で不具合源になります。
- まずは Task の不変条件を厳密化し、空テスト/誤テストを埋めることを優先するのが安全です。

### 実行確認
- deno test: ok | 56 passed | 0 failed
- deno eval（再現確認）:
  - unstarted に startedAt を与えて生成可能
  - in-progress に completedAt を与えて生成可能
  - 生成後に外部 Date を mutate すると Task 内部値が変化
