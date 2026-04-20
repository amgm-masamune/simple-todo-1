# ToDo - ver.2 APIエンドポイントを実装し、Webサーバー化する

- [x] Honoインストール
- [x] タスク作成 `POST /task`
  - [x] APIテスト実装
  - [x] API実装
- [x] 特定のIDのタスク取得 `GET /task/{id}`
  - [x] APIテスト実装
  - [x] API実装
- [x] 全てのタスク取得 `GET /tasks`
  - [x] APIテスト実装
  - [x] API実装
- [x] 指定した状態のタスク取得 `GET /tasks/status/{status}`
  - [x] APIテスト実装
  - [x] API実装
- [x] タスク更新 `PUT /task/{id}`
  - [x] APIテスト実装
  - [x] API実装
- [x] タスク削除 `DELETE /task/{id}`
  - [x] APIテスト実装
  - [x] API実装
- [ ] コードレビュー
  - [ ] AIコードレビュー
- [ ] リファクタリング
  - [x] テストで共通化をして見通しを良くする（日付を定数にする等）
    - @std/assert の assertEquals では、Date 同士の比較は getTime() で比較してくれる
    - @std/assert の assertEquals では、オブジェクトの比較はプロパティごとにDeep比較してくれる
  - [ ] due等の「指定しない」の表現に `null` をやめる
    Unstarted で startedAt を指定した場合の仕様が決まっていない（明示的に undefined を指定したい）。
    nullだとあやふやになる。
    `"not-specified"` だとJSON化した時にDateの文字列と型レベルで見分けがつかないため `{ type: "not-specified" }` のようにオブジェクトで表現する。
    - [ ] TDDのテストを修正する
    - [ ] テストが通るように実装する
  - [ ] `assertTaskDiff(actual, original, expectedDiff)` みたいな関数があると回帰テストしやすくなるかも
    `assertTaskDiff({ a: 1, b: 2 }, { a: 1, b: 1 }, { b: 2 })`
  - [ ] ActiveTask をやめる
  - [ ] Zod Schema を共通化
    - リクエスト用の Zod Scheme を作る
    - レスポンス用の Zod Scheme を作る
  - [ ] UseCaseの引数がreadonlyか確認する
- [ ] 振り返り
