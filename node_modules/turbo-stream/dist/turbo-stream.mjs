// src/shared.ts
var STR_ARRAY_BUFFER = "A";
var STR_ASYNC_ITERABLE = "*";
var STR_BIG_INT_64_ARRAY = "J";
var STR_BIG_UINT_64_ARRAY = "j";
var STR_BIGINT = "b";
var STR_BLOB = "K";
var STR_DATA_VIEW = "V";
var STR_DATE = "D";
var STR_ERROR = "E";
var STR_FAILURE = "!";
var STR_FALSE = "false";
var STR_FILE = "k";
var STR_FLOAT_32_ARRAY = "H";
var STR_FLOAT_64_ARRAY = "h";
var STR_FORM_DATA = "F";
var STR_INFINITY = "I";
var STR_INT_16_ARRAY = "L";
var STR_INT_32_ARRAY = "G";
var STR_INT_8_ARRAY = "O";
var STR_MAP = "M";
var STR_NaN = "NaN";
var STR_NEGATIVE_INFINITY = "i";
var STR_NEGATIVE_ZERO = "z";
var STR_NULL = "null";
var STR_PLUGIN = "P";
var STR_PROMISE = "$";
var STR_READABLE_STREAM = "R";
var STR_REDACTED = "<redacted>";
var STR_REFERENCE_SYMBOL = "@";
var STR_REGEXP = "r";
var STR_SET = "S";
var STR_SUCCESS = ":";
var STR_SYMBOL = "s";
var STR_TRUE = "true";
var STR_UINT_16_ARRAY = "l";
var STR_UINT_32_ARRAY = "g";
var STR_UINT_8_ARRAY = "o";
var STR_UINT_8_ARRAY_CLAMPED = "C";
var STR_UNDEFINED = "u";
var STR_URL = "U";
var SUPPORTS_FILE = true;
try {
  new File([], "");
} catch {
  SUPPORTS_FILE = false;
}
var WaitGroup = class {
  p = 0;
  #q = [];
  #waitQueue(resolve) {
    if (this.p === 0) {
      resolve();
    } else {
      this.#q.push(resolve);
    }
  }
  add() {
    this.p++;
  }
  done() {
    if (--this.p === 0) {
      let r;
      while ((r = this.#q.shift()) !== void 0) {
        r();
      }
    }
  }
  wait() {
    return new Promise(this.#waitQueue.bind(this));
  }
};
var Deferred = class {
  promise;
  resolve;
  reject;
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
};
var DeferredAsyncIterable = class {
  iterable;
  #deferred = new Deferred();
  #next = this.#deferred;
  constructor() {
    this.iterable = async function* () {
      let next = this.#deferred;
      while (true) {
        const res = await next.promise;
        if (res.done) {
          return;
        }
        yield res.value;
        next = res.next;
      }
    }.bind(this)();
  }
  resolve() {
    this.#next.resolve({ done: true });
  }
  reject(error) {
    this.#next.promise.catch(() => {
    });
    this.#next.reject(error);
  }
  yield(value) {
    const deferred = new Deferred();
    this.#next.resolve({
      done: false,
      value,
      next: deferred
    });
    this.#next = deferred;
  }
};
var DeferredReadableStream = class extends DeferredAsyncIterable {
  readable = new ReadableStream({
    start: async (controller) => {
      try {
        for await (const value of this.iterable) {
          controller.enqueue(value);
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });
};
var TurboBlob = class _TurboBlob extends Blob {
  promise;
  #size;
  #type;
  #slice = {};
  constructor(from, start, end, contentType) {
    super();
    if (typeof from !== "undefined") {
      this.promise = from.promise;
      let nextStart = from.#slice.start ?? 0;
      if (typeof start !== "undefined") {
        nextStart += start;
      }
      this.#slice.start = nextStart;
      let nextEnd = from.#slice.end;
      if (typeof end !== "undefined") {
        nextEnd = (from.#slice.start ?? 0) + end;
      }
      this.#slice.end = nextEnd;
      this.#type = contentType ?? (from == null ? void 0 : from.type);
      this.#size = (nextEnd ?? from.size) - nextStart;
    }
  }
  get size() {
    if (typeof this.#size === "undefined") {
      throw new Error("Size is not set");
    }
    return this.#size;
  }
  set size(value) {
    this.#size = value;
  }
  get type() {
    if (typeof this.#type === "undefined") {
      throw new Error("Type is not set");
    }
    return this.#type;
  }
  set type(value) {
    this.#type = value;
  }
  async arrayBuffer() {
    if (!this.promise) {
      throw new Error("Promise is not set");
    }
    const buffer = await this.promise;
    if (this.#slice) {
      return buffer.slice(
        this.#slice.start,
        this.#slice.end
      );
    }
    return buffer;
  }
  bytes() {
    return this.arrayBuffer().then((buffer) => new Uint8Array(buffer));
  }
  slice(start, end, contentType) {
    return new _TurboBlob(this, start, end, contentType);
  }
  stream() {
    return new ReadableStream({
      start: async (controller) => {
        try {
          controller.enqueue(await this.bytes());
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });
  }
  text() {
    return this.bytes().then((bytes) => {
      return new TextDecoder().decode(bytes);
    });
  }
};
var FileBaseClass = SUPPORTS_FILE ? File : Blob;
var TurboFile = class _TurboFile extends FileBaseClass {
  promise;
  #size;
  #type;
  #name;
  #lastModified;
  #slice = {};
  constructor(from, start, end, contentType) {
    if (SUPPORTS_FILE) {
      super([], "");
    } else {
      super([]);
    }
    if (typeof from !== "undefined") {
      this.promise = from.promise;
      let nextStart = from.#slice.start ?? 0;
      if (typeof start !== "undefined") {
        nextStart += start;
      }
      this.#slice.start = nextStart;
      let nextEnd = from.#slice.end;
      if (typeof end !== "undefined") {
        nextEnd = (from.#slice.start ?? 0) + end;
      }
      this.#slice.end = nextEnd;
      this.#type = contentType ?? (from == null ? void 0 : from.type);
      this.#name = from.name;
      this.#lastModified = from.lastModified;
    }
  }
  get name() {
    if (typeof this.#name === "undefined") {
      throw new Error("Name is not set");
    }
    return this.#name;
  }
  set name(value) {
    this.#name = value;
  }
  get lastModified() {
    if (typeof this.#lastModified === "undefined") {
      throw new Error("Last modified is not set");
    }
    return this.#lastModified;
  }
  set lastModified(value) {
    this.#lastModified = value;
  }
  get size() {
    if (typeof this.#size === "undefined") {
      throw new Error("Size is not set");
    }
    return this.#size;
  }
  set size(value) {
    this.#size = value;
  }
  get type() {
    if (typeof this.#type === "undefined") {
      throw new Error("Type is not set");
    }
    return this.#type;
  }
  set type(value) {
    this.#type = value;
  }
  async arrayBuffer() {
    if (!this.promise) {
      throw new Error("Promise is not set");
    }
    const buffer = await this.promise;
    if (this.#slice) {
      return buffer.slice(
        this.#slice.start,
        this.#slice.end
      );
    }
    return buffer;
  }
  bytes() {
    return this.arrayBuffer().then((buffer) => new Uint8Array(buffer));
  }
  slice(start, end, contentType) {
    return new _TurboFile(this, start, end, contentType);
  }
  stream() {
    return new ReadableStream({
      start: async (controller) => {
        try {
          controller.enqueue(await this.bytes());
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });
  }
  text() {
    return this.bytes().then((bytes) => {
      return new TextDecoder().decode(bytes);
    });
  }
};

// src/decode.ts
var MODE_UNKNOWN = 0;
var MODE_NUMBER = 1;
var MODE_STRING = 2;
var MODE_ASYNC = 3;
var SUB_MODE_UNKNOWN = 0;
var SUB_MODE_BIGINT = 1;
var SUB_MODE_DATE = 2;
var SUB_MODE_URL = 3;
var SUB_MODE_SYMBOL = 4;
var SUB_MODE_REFERENCE = 5;
var SUB_MODE_OBJECT_KEY = 6;
var SUB_MODE_PROMISE_ID = 7;
var SUB_MODE_ASYNC_ITERABLE_ID = 8;
var SUB_MODE_READABLE_STREAM_ID = 9;
var SUB_MODE_ASYNC_STATUS = 10;
var SUB_MODE_ARRAY_BUFFER = 11;
var SUB_MODE_INT_8_ARRAY = 12;
var SUB_MODE_UINT_8_ARRAY = 13;
var SUB_MODE_UINT_8_ARRAY_CLAMPED = 14;
var SUB_MODE_INT_16_ARRAY = 15;
var SUB_MODE_UINT_16_ARRAY = 16;
var SUB_MODE_INT_32_ARRAY = 17;
var SUB_MODE_UINT_32_ARRAY = 18;
var SUB_MODE_FLOAT_32_ARRAY = 19;
var SUB_MODE_FLOAT_64_ARRAY = 20;
var SUB_MODE_BIG_INT_64_ARRAY = 21;
var SUB_MODE_BIG_UINT_64_ARRAY = 22;
var SUB_MODE_DATA_VIEW = 23;
var ARRAY_TYPE_SET = 0;
var ARRAY_TYPE_MAP = 1;
var ARRAY_TYPE_REGEXP = 2;
var ARRAY_TYPE_FORM_DATA = 3;
var ARRAY_TYPE_PLUGIN = 4;
var RELEASE_TYPE_OBJECT = 1;
var RELEASE_TYPE_ARRAY = 2;
async function decode(stream, { plugins = [] } = {}) {
  let root = new Deferred();
  let references = /* @__PURE__ */ new Map();
  let deferredValues = /* @__PURE__ */ new Map();
  let stack = [];
  let mode = MODE_UNKNOWN;
  let subMode = SUB_MODE_UNKNOWN;
  let buffer = "";
  let shouldSkip = 0;
  let lastChar;
  let numSlashes = 0;
  let hasSlashes = false;
  let releaseValue = (value, type) => {
    if (type === RELEASE_TYPE_OBJECT) {
      if (typeof value !== "object" || value === null) {
        throw new Error("Expected object");
      }
    } else if (type === RELEASE_TYPE_ARRAY) {
      if (!Array.isArray(value)) {
        throw new Error("Expected array");
      }
    }
    if (Array.isArray(value) && typeof value.__type === "number") {
      switch (value.__type) {
        case ARRAY_TYPE_MAP:
          for (let [key, val] of value) {
            value.__ref.set(key, val);
          }
          value = value.__ref;
          break;
        case ARRAY_TYPE_SET:
          for (let val of value) {
            value.__ref.add(val);
          }
          value = value.__ref;
          break;
        case ARRAY_TYPE_REGEXP:
          value = new RegExp(value[0], value[1]);
          references.set(value.__id, value);
          break;
        case ARRAY_TYPE_FORM_DATA: {
          let formData = new FormData();
          for (let [key, val] of value) {
            formData.append(key, val);
          }
          value = formData;
          references.set(value.__id, value);
          break;
        }
        case ARRAY_TYPE_PLUGIN: {
          let pluginHandled = false;
          let pluginsLength = plugins.length;
          for (let i = 0; i < pluginsLength; i++) {
            let result = plugins[i](...value);
            if (typeof result === "object" && result !== null) {
              value = result.value;
              pluginHandled = true;
              break;
            }
          }
          if (!pluginHandled) {
            value = void 0;
          }
          break;
        }
      }
    }
    if (stack.length === 0) {
      if (root === null) {
        throw new Error("Unexpected root value");
      }
      if (root !== null) {
        root.resolve(value);
        root = null;
        return;
      }
    }
    let parent = stack[stack.length - 1];
    if (Array.isArray(parent)) {
      parent.push(value);
    } else if (typeof parent === "string") {
      stack.pop();
      stack[stack.length - 1][parent] = value;
    } else if (typeof parent === "boolean") {
      stack.pop();
      let deferred = deferredValues.get(stack.pop());
      if (!deferred) {
        throw new Error("Invalid stack state");
      }
      if (deferred instanceof Deferred) {
        if (parent) {
          deferred.resolve(value);
        } else {
          deferred.reject(value);
        }
      } else {
        if (parent) {
          deferred.yield(value);
        } else {
          deferred.reject(value);
        }
      }
    } else {
      throw new Error("Invalid stack state");
    }
  };
  let step = (chunk) => {
    let length = chunk.length;
    let charCode;
    let start = shouldSkip;
    shouldSkip = 0;
    let i = start;
    for (; i < length; i++) {
      charCode = chunk.charCodeAt(i);
      if (mode === MODE_UNKNOWN) {
        if (charCode === 44) {
          mode = MODE_UNKNOWN;
          subMode = Array.isArray(stack[stack.length - 1]) ? SUB_MODE_UNKNOWN : SUB_MODE_OBJECT_KEY;
        } else if (charCode === 10) {
          if (subMode === SUB_MODE_ASYNC_STATUS) {
            let id = stack.pop();
            if (typeof id !== "number") {
              throw new Error("Invalid stack state");
            }
            let deferred = deferredValues.get(id);
            deferred.resolve();
            deferredValues.delete(id);
          }
          mode = MODE_ASYNC;
          subMode = MODE_UNKNOWN;
          buffer = "";
        } else if (charCode === 123) {
          let newObj = {};
          stack.push(newObj);
          references.set(references.size, newObj);
          subMode = SUB_MODE_OBJECT_KEY;
        } else if (charCode === 125) {
          releaseValue(stack.pop(), 1);
        } else if (charCode === 91) {
          let newArr = [];
          stack.push(newArr);
          references.set(references.size, newArr);
        } else if (charCode === 83) {
          let newArr = [];
          newArr.__type = ARRAY_TYPE_SET;
          newArr.__ref = /* @__PURE__ */ new Set();
          stack.push(newArr);
          references.set(references.size, newArr.__ref);
          i++;
        } else if (charCode === 77) {
          let newArr = [];
          newArr.__type = ARRAY_TYPE_MAP;
          newArr.__ref = /* @__PURE__ */ new Map();
          stack.push(newArr);
          references.set(references.size, newArr.__ref);
          i++;
        } else if (charCode === 114) {
          let newArr = [];
          newArr.__type = ARRAY_TYPE_REGEXP;
          newArr.__id = references.size;
          stack.push(newArr);
          references.set(newArr.__id, newArr);
          i++;
        } else if (charCode === 80) {
          let newArr = [];
          newArr.__type = ARRAY_TYPE_PLUGIN;
          newArr.__id = references.size;
          stack.push(newArr);
          references.set(newArr.__id, newArr);
          i++;
        } else if (charCode === 93) {
          releaseValue(stack.pop(), 2);
        } else if (charCode === 64) {
          subMode = SUB_MODE_REFERENCE;
        } else if (charCode === 68) {
          subMode = SUB_MODE_DATE;
        } else if (charCode === 85) {
          subMode = SUB_MODE_URL;
        } else if (charCode === 115) {
          subMode = SUB_MODE_SYMBOL;
        } else if (charCode === 34) {
          mode = MODE_STRING;
          buffer = "";
          lastChar = void 0;
          numSlashes = 0;
          hasSlashes = false;
        } else if (charCode === 36) {
          subMode = SUB_MODE_PROMISE_ID;
        } else if (charCode === 42) {
          subMode = SUB_MODE_ASYNC_ITERABLE_ID;
        } else if (charCode === 82) {
          subMode = SUB_MODE_READABLE_STREAM_ID;
        } else if (charCode === 58) {
          if (subMode !== SUB_MODE_ASYNC_STATUS) {
            throw new SyntaxError("Unexpected character: ':'");
          }
          stack.push(true);
        } else if (charCode === 33) {
          if (subMode !== SUB_MODE_ASYNC_STATUS) {
            throw new SyntaxError("Unexpected character: '!'");
          }
          stack.push(false);
        } else if (charCode === 117) {
          releaseValue(void 0, 0);
          subMode = SUB_MODE_UNKNOWN;
        } else if (charCode === 110) {
          i += 3;
          releaseValue(null, 0);
          subMode = SUB_MODE_UNKNOWN;
        } else if (charCode === 116) {
          i += 3;
          releaseValue(true, 0);
          subMode = SUB_MODE_UNKNOWN;
        } else if (charCode === 102) {
          i += 4;
          releaseValue(false, 0);
          subMode = SUB_MODE_UNKNOWN;
        } else if (charCode === 78) {
          i += 2;
          releaseValue(Number.NaN, 0);
          subMode = SUB_MODE_UNKNOWN;
        } else if (charCode === 73) {
          releaseValue(Number.POSITIVE_INFINITY, 0);
          subMode = SUB_MODE_UNKNOWN;
        } else if (charCode === 105) {
          releaseValue(Number.NEGATIVE_INFINITY, 0);
          subMode = SUB_MODE_UNKNOWN;
        } else if (charCode === 122) {
          releaseValue(-0, 0);
          subMode = SUB_MODE_UNKNOWN;
        } else if (charCode === 98) {
          subMode = SUB_MODE_BIGINT;
        } else if (charCode === 45 || // -
        charCode === 46 || // .
        charCode >= 48 && charCode <= 57) {
          mode = MODE_NUMBER;
          buffer = chunk[i];
        } else if (charCode === 69) {
          let newObj = new Error();
          stack.push(newObj);
          references.set(references.size, newObj);
          subMode = SUB_MODE_OBJECT_KEY;
          i++;
        } else if (charCode === 70) {
          let newArr = [];
          newArr.__type = ARRAY_TYPE_FORM_DATA;
          newArr.__id = references.size;
          stack.push(newArr);
          references.set(newArr.__id, newArr);
          i++;
        } else if (charCode === 75) {
          let newObj = new TurboBlob();
          stack.push(newObj);
          references.set(references.size, newObj);
          subMode = SUB_MODE_OBJECT_KEY;
          i++;
        } else if (charCode === 107) {
          let newObj = new TurboFile();
          stack.push(newObj);
          references.set(references.size, newObj);
          subMode = SUB_MODE_OBJECT_KEY;
          i++;
        } else if (charCode === 65) {
          subMode = SUB_MODE_ARRAY_BUFFER;
        } else if (charCode === 79) {
          subMode = SUB_MODE_INT_8_ARRAY;
        } else if (charCode === 111) {
          subMode = SUB_MODE_UINT_8_ARRAY;
        } else if (charCode === 67) {
          subMode = SUB_MODE_UINT_8_ARRAY_CLAMPED;
        } else if (charCode === 76) {
          subMode = SUB_MODE_INT_16_ARRAY;
        } else if (charCode === 108) {
          subMode = SUB_MODE_UINT_16_ARRAY;
        } else if (charCode === 71) {
          subMode = SUB_MODE_INT_32_ARRAY;
        } else if (charCode === 103) {
          subMode = SUB_MODE_UINT_32_ARRAY;
        } else if (charCode === 72) {
          subMode = SUB_MODE_FLOAT_32_ARRAY;
        } else if (charCode === 104) {
          subMode = SUB_MODE_FLOAT_64_ARRAY;
        } else if (charCode === 74) {
          subMode = SUB_MODE_BIG_INT_64_ARRAY;
        } else if (charCode === 106) {
          subMode = SUB_MODE_BIG_UINT_64_ARRAY;
        } else if (charCode === 86) {
          subMode = SUB_MODE_DATA_VIEW;
        } else {
          throw new SyntaxError(`Unexpected character: '${chunk[i]}'`);
        }
      } else if (mode === MODE_NUMBER || mode === MODE_ASYNC) {
        if (charCode === 45 || // -
        charCode === 46 || // .
        charCode >= 48 && charCode <= 57) {
          buffer += chunk[i];
        } else {
          if (mode === MODE_ASYNC) {
            stack.push(Number(buffer));
            mode = MODE_UNKNOWN;
            subMode = SUB_MODE_ASYNC_STATUS;
            i--;
            continue;
          }
          if (subMode === SUB_MODE_PROMISE_ID) {
            let id = Number(buffer);
            let existing = deferredValues.get(id);
            if (existing) {
              releaseValue(existing.promise, 0);
            } else {
              let deferred = new Deferred();
              deferredValues.set(id, deferred);
              releaseValue(deferred.promise, 0);
            }
          } else if (subMode === SUB_MODE_ASYNC_ITERABLE_ID) {
            let id = Number(buffer);
            let existing = deferredValues.get(
              id
            );
            if (existing) {
              releaseValue(existing.iterable, 0);
            } else {
              let deferred = new DeferredAsyncIterable();
              deferredValues.set(id, deferred);
              releaseValue(deferred.iterable, 0);
            }
          } else if (subMode === SUB_MODE_READABLE_STREAM_ID) {
            let id = Number(buffer);
            let existing = deferredValues.get(
              id
            );
            if (existing) {
              releaseValue(existing.readable, 0);
            } else {
              let deferred = new DeferredReadableStream();
              deferredValues.set(id, deferred);
              releaseValue(deferred.readable, 0);
            }
          } else {
            releaseValue(
              subMode === SUB_MODE_BIGINT ? BigInt(buffer) : subMode === SUB_MODE_REFERENCE ? references.get(Number(buffer)) : Number(buffer),
              0
            );
          }
          buffer = "";
          mode = MODE_UNKNOWN;
          subMode = SUB_MODE_UNKNOWN;
          i--;
        }
      } else if (mode === MODE_STRING) {
        let stringEnd = false;
        for (; i < length; i++) {
          charCode = chunk.charCodeAt(i);
          if (charCode !== 34 || lastChar === 92 && numSlashes % 2 === 1) {
            buffer += chunk[i];
            lastChar = charCode;
            if (lastChar === 92) {
              numSlashes++;
              hasSlashes = true;
            } else {
              numSlashes = 0;
            }
          } else {
            stringEnd = true;
            break;
          }
        }
        if (stringEnd) {
          let value = hasSlashes ? JSON.parse(`"${buffer}"`) : buffer;
          if (subMode === SUB_MODE_OBJECT_KEY) {
            stack.push(value);
            i++;
          } else {
            if (subMode === SUB_MODE_DATE) {
              value = new Date(value);
              references.set(references.size, value);
            } else if (subMode === SUB_MODE_SYMBOL) {
              value = Symbol.for(value);
            } else if (subMode === SUB_MODE_URL) {
              value = new URL(value);
              references.set(references.size, value);
            } else if (subMode === SUB_MODE_ARRAY_BUFFER) {
              value = decodeTypedArray(value).buffer;
              references.set(references.size, value);
            } else if (subMode === SUB_MODE_INT_8_ARRAY) {
              value = new Int8Array(decodeTypedArray(value).buffer);
              references.set(references.size, value);
            } else if (subMode === SUB_MODE_UINT_8_ARRAY) {
              value = decodeTypedArray(value);
              references.set(references.size, value);
            } else if (subMode === SUB_MODE_UINT_8_ARRAY_CLAMPED) {
              value = new Uint8ClampedArray(decodeTypedArray(value).buffer);
              references.set(references.size, value);
            } else if (subMode === SUB_MODE_INT_16_ARRAY) {
              value = new Int16Array(decodeTypedArray(value).buffer);
              references.set(references.size, value);
            } else if (subMode === SUB_MODE_UINT_16_ARRAY) {
              value = new Uint16Array(decodeTypedArray(value).buffer);
              references.set(references.size, value);
            } else if (subMode === SUB_MODE_INT_32_ARRAY) {
              value = new Int32Array(decodeTypedArray(value).buffer);
              references.set(references.size, value);
            } else if (subMode === SUB_MODE_UINT_32_ARRAY) {
              value = new Uint32Array(decodeTypedArray(value).buffer);
              references.set(references.size, value);
            } else if (subMode === SUB_MODE_FLOAT_32_ARRAY) {
              value = new Float32Array(decodeTypedArray(value).buffer);
              references.set(references.size, value);
            } else if (subMode === SUB_MODE_FLOAT_64_ARRAY) {
              value = new Float64Array(decodeTypedArray(value).buffer);
              references.set(references.size, value);
            } else if (subMode === SUB_MODE_BIG_INT_64_ARRAY) {
              value = new BigInt64Array(decodeTypedArray(value).buffer);
              references.set(references.size, value);
            } else if (subMode === SUB_MODE_BIG_UINT_64_ARRAY) {
              value = new BigUint64Array(decodeTypedArray(value).buffer);
              references.set(references.size, value);
            } else if (subMode === SUB_MODE_DATA_VIEW) {
              value = decodeTypedArray(value);
              value = new DataView(
                value.buffer,
                value.byteOffset,
                value.byteLength
              );
              references.set(references.size, value);
            }
            releaseValue(value, 0);
          }
          mode = MODE_UNKNOWN;
          subMode = SUB_MODE_UNKNOWN;
        } else {
          i--;
        }
      }
    }
    if (i > length) {
      shouldSkip = i - length;
    }
  };
  let reader = stream.getReader();
  (async () => {
    let read;
    while (!(read = await reader.read()).done) {
      step(read.value);
    }
  })().catch((error) => {
    if (root) {
      root.reject(error);
      root = null;
    }
    for (let deferred of deferredValues.values()) {
      deferred.reject(error);
    }
  }).finally(() => {
    reader.releaseLock();
    if (root) {
      root.reject(new Error("Stream ended before root value was parsed"));
      root = null;
    }
    for (let deferred of deferredValues.values()) {
      deferred.reject(new Error("Stream ended before promise was resolved"));
    }
  });
  return root.promise;
}
function decodeTypedArray(base64) {
  const decodedStr = atob(base64);
  const uint8Array = new Uint8Array(decodedStr.length);
  for (let i = 0; i < decodedStr.length; i++) {
    uint8Array[i] = decodedStr.charCodeAt(i);
  }
  return uint8Array;
}

// src/encode.ts
var { NEGATIVE_INFINITY, POSITIVE_INFINITY, isNaN: nan } = Number;
var ASYNC_FRAME_TYPE_PROMISE = 1;
var ASYNC_FRAME_TYPE_ITERABLE = 2;
function encode(value, { plugins = [], redactErrors = true, signal } = {}) {
  const aborted = () => (signal == null ? void 0 : signal.aborted) ?? false;
  const waitForAbort = new Promise((_, reject) => {
    signal == null ? void 0 : signal.addEventListener("abort", (reason) => {
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
  return new ReadableStream({
    async start(controller) {
      let refCache = /* @__PURE__ */ new WeakMap();
      let asyncCache = /* @__PURE__ */ new WeakMap();
      let counters = { refId: 0, promiseId: 0 };
      let wg = new WaitGroup();
      let chunks = [];
      let encode2 = (value2) => {
        encodeSync(
          value2,
          chunks,
          refCache,
          asyncCache,
          promises,
          counters,
          plugins,
          redactErrors
        );
        controller.enqueue(chunks.join("") + "\n");
        chunks.length = 0;
      };
      let handlePromiseResolved = (id, value2) => {
        wg.done();
        if (aborted())
          return;
        controller.enqueue(`${id}${STR_SUCCESS}`);
        encode2(value2);
      };
      let handlePromiseRejected = (id, error) => {
        wg.done();
        if (aborted())
          return;
        controller.enqueue(`${id}${STR_FAILURE}`);
        encode2(error);
      };
      let promises = {
        push: (...promiseFrames) => {
          for (let [type, id, promise] of promiseFrames) {
            wg.add();
            if (type === ASYNC_FRAME_TYPE_PROMISE) {
              Promise.race([promise, waitForAbort]).then(
                handlePromiseResolved.bind(null, id),
                handlePromiseRejected.bind(null, id)
              );
            } else {
              (async () => {
                let iterator = promise[Symbol.asyncIterator]();
                let result;
                do {
                  result = await iterator.next();
                  if (aborted())
                    return;
                  if (!result.done) {
                    controller.enqueue(`${id}${STR_SUCCESS}`);
                    encode2(result.value);
                  }
                } while (!result.done);
              })().then(
                () => {
                  if (aborted())
                    return;
                  controller.enqueue(`${id}
`);
                },
                (error) => {
                  if (aborted())
                    return;
                  controller.enqueue(`${id}${STR_FAILURE}`);
                  encode2(error);
                }
              ).finally(() => {
                wg.done();
              });
            }
          }
        }
      };
      try {
        encode2(value);
        do {
          await Promise.race([wg.wait(), waitForAbort]);
        } while (wg.p > 0);
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });
}
var ENCODE_FRAME_TYPE_NEEDS_ENCODING = 1;
var ENCODE_FRAME_TYPE_ALREADY_ENCODED = 2;
var EncodeFrame = class {
  type;
  prefix;
  value;
  constructor(type, prefix, value) {
    this.type = type;
    this.prefix = prefix;
    this.value = value;
  }
};
function encodeSync(value, chunks, refs, promises, asyncFrames, counters, plugins, redactErrors) {
  let encodeStack = [
    new EncodeFrame(
      ENCODE_FRAME_TYPE_NEEDS_ENCODING,
      "",
      value
    )
  ];
  let frame;
  encodeLoop:
    while ((frame = encodeStack.pop()) !== void 0) {
      if (frame.type === ENCODE_FRAME_TYPE_ALREADY_ENCODED) {
        chunks.push(frame.prefix);
        continue;
      }
      let { prefix, value: value2 } = frame;
      chunks.push(prefix);
      if (value2 === void 0) {
        chunks.push(STR_UNDEFINED);
        continue;
      }
      if (value2 === null) {
        chunks.push(STR_NULL);
        continue;
      }
      if (value2 === true) {
        chunks.push(STR_TRUE);
        continue;
      }
      if (value2 === false) {
        chunks.push(STR_FALSE);
        continue;
      }
      const typeOfValue = typeof value2;
      if (typeOfValue === "object") {
        if (value2 instanceof Promise || typeof value2.then === "function") {
          let existingId = promises.get(value2);
          if (existingId !== void 0) {
            chunks.push(STR_PROMISE, existingId.toString());
            continue;
          }
          let promiseId = counters.promiseId++;
          promises.set(value2, promiseId);
          chunks.push(STR_PROMISE, promiseId.toString());
          asyncFrames.push([
            ASYNC_FRAME_TYPE_PROMISE,
            promiseId,
            value2
          ]);
          continue;
        }
        if (value2 instanceof ReadableStream) {
          let existingId = promises.get(value2);
          if (existingId !== void 0) {
            chunks.push(STR_READABLE_STREAM, existingId.toString());
            continue;
          }
          let iterableId = counters.promiseId++;
          promises.set(value2, iterableId);
          chunks.push(STR_READABLE_STREAM, iterableId.toString());
          asyncFrames.push([
            ASYNC_FRAME_TYPE_ITERABLE,
            iterableId,
            {
              [Symbol.asyncIterator]: async function* () {
                let reader = value2.getReader();
                try {
                  while (true) {
                    let { done, value: value3 } = await reader.read();
                    if (done) {
                      return;
                    }
                    yield value3;
                  }
                } finally {
                  reader.releaseLock();
                }
              }
            }
          ]);
          continue;
        }
        if (typeof value2[Symbol.asyncIterator] === "function") {
          let existingId = promises.get(value2);
          if (existingId !== void 0) {
            chunks.push(STR_ASYNC_ITERABLE, existingId.toString());
            continue;
          }
          let iterableId = counters.promiseId++;
          promises.set(value2, iterableId);
          chunks.push(STR_ASYNC_ITERABLE, iterableId.toString());
          asyncFrames.push([
            ASYNC_FRAME_TYPE_ITERABLE,
            iterableId,
            value2
          ]);
          continue;
        }
        {
          let existingId = refs.get(value2);
          if (existingId !== void 0) {
            chunks.push(STR_REFERENCE_SYMBOL, existingId.toString());
            continue;
          }
          refs.set(value2, counters.refId++);
        }
        if (value2 instanceof Date) {
          chunks.push(STR_DATE, '"', value2.toJSON(), '"');
        } else if (value2 instanceof RegExp) {
          chunks.push(STR_REGEXP, JSON.stringify([value2.source, value2.flags]));
        } else if (value2 instanceof URL) {
          chunks.push(STR_URL, JSON.stringify(value2));
        } else if (value2 instanceof ArrayBuffer) {
          chunks.push(
            STR_ARRAY_BUFFER,
            stringifyTypedArray(new Uint8Array(value2))
          );
        } else if (value2 instanceof Int8Array) {
          chunks.push(STR_INT_8_ARRAY, stringifyTypedArray(value2));
        } else if (value2 instanceof Uint8Array) {
          chunks.push(STR_UINT_8_ARRAY, stringifyTypedArray(value2));
        } else if (value2 instanceof Uint8ClampedArray) {
          chunks.push(STR_UINT_8_ARRAY_CLAMPED, stringifyTypedArray(value2));
        } else if (value2 instanceof Int16Array) {
          chunks.push(STR_INT_16_ARRAY, stringifyTypedArray(value2));
        } else if (value2 instanceof Uint16Array) {
          chunks.push(STR_UINT_16_ARRAY, stringifyTypedArray(value2));
        } else if (value2 instanceof Int32Array) {
          chunks.push(STR_INT_32_ARRAY, stringifyTypedArray(value2));
        } else if (value2 instanceof Uint32Array) {
          chunks.push(STR_UINT_32_ARRAY, stringifyTypedArray(value2));
        } else if (value2 instanceof Float32Array) {
          chunks.push(STR_FLOAT_32_ARRAY, stringifyTypedArray(value2));
        } else if (value2 instanceof Float64Array) {
          chunks.push(STR_FLOAT_64_ARRAY, stringifyTypedArray(value2));
        } else if (value2 instanceof BigInt64Array) {
          chunks.push(STR_BIG_INT_64_ARRAY, stringifyTypedArray(value2));
        } else if (value2 instanceof BigUint64Array) {
          chunks.push(STR_BIG_UINT_64_ARRAY, stringifyTypedArray(value2));
        } else if (value2 instanceof DataView) {
          chunks.push(STR_DATA_VIEW, stringifyTypedArray(value2));
        } else if (value2 instanceof FormData) {
          encodeStack.push(
            new EncodeFrame(
              ENCODE_FRAME_TYPE_NEEDS_ENCODING,
              STR_FORM_DATA,
              Array.from(value2.entries())
            )
          );
        } else if (SUPPORTS_FILE && value2 instanceof File) {
          encodeStack.push(
            new EncodeFrame(ENCODE_FRAME_TYPE_NEEDS_ENCODING, STR_FILE, {
              promise: value2.arrayBuffer(),
              size: value2.size,
              type: value2.type,
              name: value2.name,
              lastModified: value2.lastModified
            })
          );
        } else if (value2 instanceof Blob) {
          encodeStack.push(
            new EncodeFrame(ENCODE_FRAME_TYPE_NEEDS_ENCODING, STR_BLOB, {
              promise: value2.arrayBuffer(),
              size: value2.size,
              type: value2.type
            })
          );
        } else if (value2 instanceof Error) {
          encodeStack.push(
            new EncodeFrame(
              ENCODE_FRAME_TYPE_NEEDS_ENCODING,
              STR_ERROR,
              prepareErrorForEncoding(value2, redactErrors)
            )
          );
        } else if (typeof value2.toJSON === "function") {
          const newValue = value2.toJSON();
          encodeStack.push(
            new EncodeFrame(
              ENCODE_FRAME_TYPE_NEEDS_ENCODING,
              "",
              newValue
            )
          );
          if (typeof newValue === "object") {
            counters.refId--;
          } else {
            refs.delete(value2);
          }
        } else {
          {
            let isIterable = typeof value2[Symbol.iterator] === "function";
            if (isIterable) {
              let isArray = Array.isArray(value2);
              let toEncode = isArray ? value2 : Array.from(value2);
              encodeStack.push(
                new EncodeFrame(
                  ENCODE_FRAME_TYPE_ALREADY_ENCODED,
                  "]",
                  void 0
                )
              );
              for (let i = toEncode.length - 1; i >= 0; i--) {
                encodeStack.push(
                  new EncodeFrame(
                    ENCODE_FRAME_TYPE_NEEDS_ENCODING,
                    i === 0 ? "" : ",",
                    toEncode[i]
                  )
                );
              }
              chunks.push(
                isArray ? "[" : value2 instanceof Set ? `${STR_SET}[` : value2 instanceof Map ? `${STR_MAP}[` : "["
              );
              continue;
            }
          }
          {
            let pluginsLength = plugins.length;
            for (let i = 0; i < pluginsLength; i++) {
              let result = plugins[i](value2);
              if (Array.isArray(result)) {
                encodeStack.push(
                  new EncodeFrame(
                    ENCODE_FRAME_TYPE_NEEDS_ENCODING,
                    STR_PLUGIN,
                    result
                  )
                );
                counters.refId--;
                refs.delete(value2);
                continue encodeLoop;
              }
            }
          }
          encodeStack.push(
            new EncodeFrame(
              ENCODE_FRAME_TYPE_ALREADY_ENCODED,
              "}",
              void 0
            )
          );
          {
            let keys = Object.keys(value2);
            let end = keys.length;
            let encodeFrames = new Array(end);
            end -= 1;
            for (let i = keys.length - 1; i >= 0; i--) {
              let key = keys[i];
              let prefix2 = i > 0 ? "," : "";
              encodeFrames[end - i] = new EncodeFrame(
                ENCODE_FRAME_TYPE_NEEDS_ENCODING,
                `${prefix2}${JSON.stringify(key)}:`,
                value2[key]
              );
            }
            encodeStack.push(...encodeFrames);
          }
          chunks.push("{");
        }
      } else if (typeOfValue === "string") {
        chunks.push(JSON.stringify(value2));
      } else if (typeOfValue === "number") {
        if (nan(value2)) {
          chunks.push(STR_NaN);
        } else if (value2 === POSITIVE_INFINITY) {
          chunks.push(STR_INFINITY);
        } else if (value2 === NEGATIVE_INFINITY) {
          chunks.push(STR_NEGATIVE_INFINITY);
        } else if (Object.is(value2, -0)) {
          chunks.push(STR_NEGATIVE_ZERO);
        } else {
          chunks.push(value2.toString());
        }
      } else if (typeOfValue === "bigint") {
        chunks.push(STR_BIGINT, value2.toString());
      } else if (typeOfValue === "symbol") {
        let symbolKey = Symbol.keyFor(value2);
        if (typeof symbolKey === "string") {
          chunks.push(STR_SYMBOL, JSON.stringify(symbolKey));
        } else {
          chunks.push(STR_UNDEFINED);
        }
      } else {
        let pluginsLength = plugins.length;
        for (let i = 0; i < pluginsLength; i++) {
          let result = plugins[i](value2);
          if (Array.isArray(result)) {
            encodeStack.push(
              new EncodeFrame(
                ENCODE_FRAME_TYPE_NEEDS_ENCODING,
                STR_PLUGIN,
                result
              )
            );
            continue encodeLoop;
          }
        }
        chunks.push(STR_UNDEFINED);
      }
    }
}
function prepareErrorForEncoding(error, redactErrors) {
  const shouldRedact = redactErrors === true || typeof redactErrors === "string" || typeof redactErrors === "undefined";
  const redacted = typeof redactErrors === "string" ? redactErrors : STR_REDACTED;
  return {
    name: shouldRedact ? "Error" : error.name,
    message: shouldRedact ? redacted : error.message,
    stack: shouldRedact ? void 0 : error.stack,
    cause: error.cause
  };
}
function stringifyTypedArray(content) {
  const view = new Uint8Array(
    content.buffer,
    content.byteOffset,
    content.byteLength
  );
  return `"${btoa(String.fromCharCode.apply(String, view))}"`;
}
export {
  decode,
  encode
};
