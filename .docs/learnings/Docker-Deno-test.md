# Docker を用いた Deno のテスト

## ホストでテストを実行する場合

- 環境変数は `settings.json` の `deno.envFile` で指定
- Connection Timeout の時
  - port は公開されているか確認（ローカルのみでは compose.override.yml で上書き）
  - DBのホストは `db:5432` ではなく `localhost:5432`
- Schema が作成できないとき
  - 指定している名前のデータベースが作成されているか確認
