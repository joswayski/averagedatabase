// Just enough of the DNS wire format (RFC 1035) to ask an authoritative
// Route 53 nameserver for TXT records over TCP and read the answer.

export const DNS_TYPE_TXT = 16;
const DNS_CLASS_IN = 1;

export const RCODE_NOERROR = 0;
export const RCODE_NXDOMAIN = 3;

export type DnsTxtAnswer = {
  id: number;
  rcode: number;
  authoritative: boolean;
  truncated: boolean;
  // One entry per TXT record, each holding that record's character-strings.
  records: string[][];
};

export function encodeTxtQuery(name: string, id: number): Uint8Array {
  const labels = name.replace(/\.$/, "").split(".");
  const encodedName: number[] = [];
  for (const label of labels) {
    const bytes = new TextEncoder().encode(label);
    if (bytes.length === 0 || bytes.length > 63) {
      throw new Error(`Invalid DNS label in ${name}`);
    }
    encodedName.push(bytes.length, ...bytes);
  }
  encodedName.push(0);
  if (encodedName.length > 255) {
    throw new Error(`DNS name is too long: ${name}`);
  }

  const message = new Uint8Array(12 + encodedName.length + 4);
  const view = new DataView(message.buffer);
  view.setUint16(0, id);
  // Standard query, recursion not desired: we only talk to the zone's own
  // nameservers.
  view.setUint16(2, 0);
  view.setUint16(4, 1);
  message.set(encodedName, 12);
  view.setUint16(12 + encodedName.length, DNS_TYPE_TXT);
  view.setUint16(14 + encodedName.length, DNS_CLASS_IN);
  return message;
}

// DNS over TCP prefixes each message with its length (RFC 7766).
export function frameTcpMessage(message: Uint8Array): Uint8Array {
  const framed = new Uint8Array(message.length + 2);
  new DataView(framed.buffer).setUint16(0, message.length);
  framed.set(message, 2);
  return framed;
}

export function decodeTxtAnswer(message: Uint8Array, name: string): DnsTxtAnswer {
  const view = new DataView(
    message.buffer,
    message.byteOffset,
    message.byteLength,
  );
  if (message.length < 12) {
    throw new Error("DNS response is shorter than its header");
  }

  const id = view.getUint16(0);
  const flags = view.getUint16(2);
  if ((flags & 0x8000) === 0) {
    throw new Error("DNS message is not a response");
  }

  const questionCount = view.getUint16(4);
  const answerCount = view.getUint16(6);
  let offset = 12;

  for (let index = 0; index < questionCount; index += 1) {
    offset = skipName(message, offset) + 4;
  }

  const wanted = normalizeName(name);
  const records: string[][] = [];
  for (let index = 0; index < answerCount; index += 1) {
    const [owner, afterName] = readName(message, offset);
    if (afterName + 10 > message.length) {
      throw new Error("DNS answer is truncated");
    }
    const type = view.getUint16(afterName);
    const rdLength = view.getUint16(afterName + 8);
    const rdStart = afterName + 10;
    const rdEnd = rdStart + rdLength;
    if (rdEnd > message.length) {
      throw new Error("DNS record data is truncated");
    }

    if (type === DNS_TYPE_TXT && normalizeName(owner) === wanted) {
      records.push(readCharacterStrings(message, rdStart, rdEnd));
    }
    offset = rdEnd;
  }

  return {
    id,
    rcode: flags & 0x000f,
    authoritative: (flags & 0x0400) !== 0,
    truncated: (flags & 0x0200) !== 0,
    records,
  };
}

function readCharacterStrings(
  message: Uint8Array,
  start: number,
  end: number,
): string[] {
  const strings: string[] = [];
  const decoder = new TextDecoder();
  let offset = start;
  while (offset < end) {
    const length = message[offset];
    const stringEnd = offset + 1 + length;
    if (stringEnd > end) {
      throw new Error("TXT character-string overruns its record");
    }
    strings.push(decoder.decode(message.subarray(offset + 1, stringEnd)));
    offset = stringEnd;
  }
  return strings;
}

function skipName(message: Uint8Array, offset: number): number {
  return readName(message, offset)[1];
}

// Returns the name and the offset just past it in the original position,
// following compression pointers (RFC 1035 section 4.1.4).
function readName(message: Uint8Array, start: number): [string, number] {
  const labels: string[] = [];
  const decoder = new TextDecoder();
  let offset = start;
  let resumeAt = -1;
  let jumps = 0;

  for (;;) {
    if (offset >= message.length) {
      throw new Error("DNS name runs past the end of the message");
    }
    const length = message[offset];

    if ((length & 0xc0) === 0xc0) {
      if (offset + 1 >= message.length || ++jumps > 64) {
        throw new Error("Invalid DNS name compression pointer");
      }
      if (resumeAt === -1) {
        resumeAt = offset + 2;
      }
      offset = ((length & 0x3f) << 8) | message[offset + 1];
      continue;
    }

    if (length === 0) {
      return [labels.join("."), resumeAt === -1 ? offset + 1 : resumeAt];
    }

    labels.push(decoder.decode(message.subarray(offset + 1, offset + 1 + length)));
    offset += 1 + length;
  }
}

function normalizeName(name: string): string {
  return name.replace(/\.$/, "").toLowerCase();
}
