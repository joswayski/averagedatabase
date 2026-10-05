### Average Database data

API keys, values and upload counters live in Amazon Route 53 TXT records,
written and read by the web Worker's [store](../web/app/db). The
[D1 migrations](../web/migrations) remain only until values from before the
Route 53 cutover expire. The old in-process Rust cache has been retired.
