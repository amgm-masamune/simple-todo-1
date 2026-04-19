# ToDo - ver.2 APIエンドポイントを実装し、Webサーバー化する

- [x] Honoインストール
- [ ] APIテスト実装
- [ ] API実装
- [ ] コードレビュー
  - [ ] AIコードレビュー
- [ ] リファクタリング
  - [ ] due等の「指定しない」の表現に `null` をやめる
    Unstarted で startedAt を指定した場合の仕様が決まっていない（明示的に undefined を指定したい）。
    nullだとあやふやになる。
    `"not-specified"` だとJSON化した時にDateの文字列と型レベルで見分けがつかないため `{ type: "not-specified" }` のようにオブジェクトで表現する。
  - [ ] `assertTaskDiff(actual, original, expectedDiff)` みたいな関数があると回帰テストしやすくなるかも
    `assertTaskDiff({ a: 1, b: 2 }, { a: 1, b: 1 }, { b: 2 })`
- [ ] 振り返り
