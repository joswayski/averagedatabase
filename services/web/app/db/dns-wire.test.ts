import assert from "node:assert/strict";
import { test } from "node:test";
import {
  RCODE_NXDOMAIN,
  decodeTxtAnswer,
  encodeTxtQuery,
  frameTcpMessage,
} from "./dns-wire.ts";

test("encodes a non-recursive TXT query", () => {
  const query = encodeTxtQuery("ab.db.example.com.", 0x1234);

  assert.deepEqual(
    Array.from(query),
    [
      0x12, 0x34, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      2, 97, 98, 2, 100, 98, 7, 101, 120, 97, 109, 112, 108, 101, 3, 99, 111,
      109, 0, 0x00, 0x10, 0x00, 0x01,
    ],
  );
  assert.deepEqual(Array.from(frameTcpMessage(query).subarray(0, 2)), [0, 35]);
});

test("rejects labels DNS cannot carry", () => {
  assert.throws(() => encodeTxtQuery(`${"a".repeat(64)}.example.com`, 1));
  assert.throws(() => encodeTxtQuery("a..example.com", 1));
});

test("decodes TXT answers that use name compression", () => {
  const name = "k.db.example.com";
  const response = buildResponse(name, 0, [
    ["m", "e=1"],
    ["0", "aGVsbG8="],
  ]);

  const answer = decodeTxtAnswer(response, `${name.toUpperCase()}.`);

  assert.equal(answer.id, 0xbeef);
  assert.equal(answer.rcode, 0);
  assert.equal(answer.authoritative, true);
  assert.equal(answer.truncated, false);
  assert.deepEqual(answer.records, [
    ["m", "e=1"],
    ["0", "aGVsbG8="],
  ]);
});

test("reports NXDOMAIN with no records", () => {
  const answer = decodeTxtAnswer(
    buildResponse("missing.db.example.com", RCODE_NXDOMAIN, []),
    "missing.db.example.com",
  );

  assert.equal(answer.rcode, RCODE_NXDOMAIN);
  assert.deepEqual(answer.records, []);
});

test("rejects answers whose record data runs past the message", () => {
  const response = buildResponse("k.example.com", 0, [["value"]]);

  assert.throws(() =>
    decodeTxtAnswer(response.subarray(0, response.length - 2), "k.example.com"),
  );
});

function buildResponse(
  name: string,
  rcode: number,
  records: string[][],
): Uint8Array {
  const encoder = new TextEncoder();
  const bytes: number[] = [
    0xbe,
    0xef,
    // QR, AA
    0x84,
    rcode,
    0,
    1,
    0,
    records.length,
    0,
    0,
    0,
    0,
  ];
  for (const label of name.split(".")) {
    bytes.push(label.length, ...encoder.encode(label));
  }
  bytes.push(0, 0, 16, 0, 1);

  for (const strings of records) {
    const rdata: number[] = [];
    for (const string of strings) {
      const encoded = encoder.encode(string);
      rdata.push(encoded.length, ...encoded);
    }
    // Pointer to the question name at offset 12, TXT, IN, TTL 60.
    bytes.push(0xc0, 12, 0, 16, 0, 1, 0, 0, 0, 60);
    bytes.push(rdata.length >> 8, rdata.length & 0xff, ...rdata);
  }
  return Uint8Array.from(bytes);
}
