import { connect } from "cloudflare:sockets";
import {
  RCODE_NOERROR,
  RCODE_NXDOMAIN,
  decodeTxtAnswer,
  encodeTxtQuery,
  frameTcpMessage,
} from "./dns-wire.ts";
import type { TxtResolver } from "./route53-store.ts";

const QUERY_TIMEOUT_MS = 2_000;

// Reads go straight to the hosted zone's authoritative nameservers. That is
// the part of Route 53 covered by its 100% SLA, it needs no AWS credentials,
// and no recursive resolver can cache a stale or negative answer in between.
// TCP keeps answers of up to 64 KB intact, which UDP would truncate.
export class AuthoritativeTcpResolver implements TxtResolver {
  private readonly nameServers: string[];

  constructor(nameServers: string[]) {
    if (nameServers.length === 0) {
      throw new Error("At least one Route 53 nameserver is required");
    }
    this.nameServers = nameServers;
  }

  async lookupTxt(name: string): Promise<string[][] | null> {
    const start = Math.floor(Math.random() * this.nameServers.length);
    let lastError: unknown;

    for (let attempt = 0; attempt < this.nameServers.length; attempt += 1) {
      const server =
        this.nameServers[(start + attempt) % this.nameServers.length];
      try {
        return await queryServer(server, name);
      } catch (error) {
        lastError = error;
      }
    }

    throw new Error(`Every Route 53 nameserver failed for ${name}`, {
      cause: lastError,
    });
  }
}

async function queryServer(
  server: string,
  name: string,
): Promise<string[][] | null> {
  const id = crypto.getRandomValues(new Uint16Array(1))[0];
  const socket = connect({ hostname: server, port: 53 });
  const timeout = setTimeout(() => socket.close(), QUERY_TIMEOUT_MS);

  try {
    const writer = socket.writable.getWriter();
    await writer.write(frameTcpMessage(encodeTxtQuery(name, id)));
    writer.releaseLock();

    const message = await readFramedMessage(socket.readable);
    const answer = decodeTxtAnswer(message, name);
    if (answer.id !== id) {
      throw new Error(`${server} answered a different DNS query`);
    }
    if (!answer.authoritative) {
      throw new Error(`${server} is not authoritative for ${name}`);
    }
    if (answer.rcode === RCODE_NXDOMAIN) {
      return null;
    }
    if (answer.rcode !== RCODE_NOERROR) {
      throw new Error(`${server} returned DNS rcode ${answer.rcode}`);
    }
    return answer.records.length > 0 ? answer.records : null;
  } finally {
    clearTimeout(timeout);
    await socket.close().catch(() => undefined);
  }
}

async function readFramedMessage(
  readable: ReadableStream<Uint8Array>,
): Promise<Uint8Array> {
  const reader = readable.getReader();
  let buffer = new Uint8Array(0);
  let expected = -1;

  try {
    for (;;) {
      if (expected === -1 && buffer.length >= 2) {
        expected = 2 + ((buffer[0] << 8) | buffer[1]);
      }
      if (expected !== -1 && buffer.length >= expected) {
        return buffer.subarray(2, expected);
      }

      const { done, value } = await reader.read();
      if (done) {
        throw new Error("DNS connection closed before a full answer arrived");
      }
      const next = new Uint8Array(buffer.length + value.length);
      next.set(buffer);
      next.set(value, buffer.length);
      buffer = next;
    }
  } finally {
    reader.releaseLock();
  }
}
