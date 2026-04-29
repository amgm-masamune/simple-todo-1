# TaskUsecase の Integration テスト

基本的には Unit テストで行っているが、一部実DBを利用した挙動を確認する必要がある。

## やるべき

- トランザクションを利用したテスト（update実施中にdeleteや別のupdateが入るなど）
