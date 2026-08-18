### Average Database data

Disposable keys, values, and upload metadata live in SQLite next to the Rust
API. Uploaded files live on disk beside that database. On Railway both belong
on the service volume mounted at `/data`.
