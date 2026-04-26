# 与件

- APIエンドポイントを実装し、Webサーバー化する
  - Honoを使用予定

## 作りたいもの

### API

- タスクの作成：`POST /task`
- タスクの取得
  - 特定のIDのみ：`GET /task/{id}`
  - 全て：`GET /tasks`
  - 指定した状態のもの：`GET /tasks/status/{status}`
- タスクの更新：`PUT /task/{id}`
- タスクの削除：`DELETE /task/{id}`

## 考慮事項

- `/tasks/status/{status}` or `/tasks?status={status}` のどちらにするか
  - 後者はクエリを柔軟に組み立てるように見える。
  - リポジトリパターンではクエリの組み立てがどこまでできるか不明なため、現状は決まったクエリを行う前者にする。
