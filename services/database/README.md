### Average Database data

Keys and values live in an in-memory LRU cache in the Rust API. Restarting the
process, evicting an entry, or looking at it funny will lose your data.

ASS files are real. They live in the `averagedatabase-ass` Railway bucket.
