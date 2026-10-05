import assert from "node:assert/strict";
import { test } from "node:test";
import {
  MAX_ITEM_BYTES,
  MAX_REQUEST_VALUE_CHARS,
  MAX_STRING_BYTES,
  MAX_VALUE_CHARS,
  decodeItem,
  encodeItemValues,
  formatTxtValue,
  parseTxtValue,
} from "./route53-records.ts";

const meta = { createdAt: 100, expiresAt: 200, sizeBytes: 0 };

test("round-trips values through TXT records in any order", () => {
  for (const value of ["", "hello", "emoji 🚀 and ünïcödé", "x".repeat(9_999)]) {
    const sizeBytes = new TextEncoder().encode(value).byteLength;
    const records = encodeItemValues(value, { ...meta, sizeBytes })
      .map(parseTxtValue)
      .reverse();

    assert.deepEqual(decodeItem(records), {
      meta: { ...meta, sizeBytes },
      value,
    });
  }
});

test("the largest value fits Route 53's TXT and request limits", () => {
  const value = "€".repeat(MAX_ITEM_BYTES / 3);
  const values = encodeItemValues(value, {
    ...meta,
    sizeBytes: MAX_ITEM_BYTES,
  });

  for (const txtValue of values) {
    assert.ok(txtValue.length <= MAX_VALUE_CHARS);
    for (const string of parseTxtValue(txtValue)) {
      assert.ok(string.length <= MAX_STRING_BYTES);
    }
  }

  // The write also deletes and re-creates the API key record.
  const apiKeyValues = 2 * formatTxtValue(["e=4294967295"]).length;
  const total = values.reduce((sum, txtValue) => sum + txtValue.length, 0);
  assert.ok(total + apiKeyValues <= MAX_REQUEST_VALUE_CHARS);
});

test("refuses incomplete or inconsistent items", () => {
  const records = encodeItemValues("hello world".repeat(100), {
    ...meta,
    sizeBytes: 1_100,
  }).map(parseTxtValue);

  assert.equal(decodeItem(records.slice(1)), null);
  assert.equal(
    decodeItem(records.filter((strings) => strings[0] !== "0")),
    null,
  );
  assert.equal(
    decodeItem([["m", "c=1", "e=2", "b=3", "n=0"]]),
    null,
  );
  assert.equal(decodeItem([["unrelated"]]), null);
});

test("formats and parses Route 53 presentation format", () => {
  assert.equal(formatTxtValue(["a", 'say "hi"', "back\\slash"]), '"a" "say \\"hi\\"" "back\\\\slash"');
  assert.deepEqual(parseTxtValue('"a" "say \\"hi\\"" "back\\\\slash"'), [
    "a",
    'say "hi"',
    "back\\slash",
  ]);
  assert.deepEqual(parseTxtValue('"tab\\011here" bare'), ["tab\there", "bare"]);
});
