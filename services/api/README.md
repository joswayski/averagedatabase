## Blazingly Fast

The Average Database API is a Rust service. Disposable keys and values live in
SQLite. Uploads live on the local disk. Both belong on a Railway volume.

```bash
cargo run
```

The process listens on `PORT` (default `8080`) and stores data in `DATA_DIR`
(default `./data`).
