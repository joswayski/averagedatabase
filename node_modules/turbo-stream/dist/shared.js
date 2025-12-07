"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TurboFile = exports.TurboBlob = exports.DeferredReadableStream = exports.DeferredAsyncIterable = exports.Deferred = exports.WaitGroup = exports.SUPPORTS_FILE = exports.STR_URL = exports.STR_UNDEFINED = exports.STR_UINT_8_ARRAY_CLAMPED = exports.STR_UINT_8_ARRAY = exports.STR_UINT_32_ARRAY = exports.STR_UINT_16_ARRAY = exports.STR_TRUE = exports.STR_SYMBOL = exports.STR_SUCCESS = exports.STR_SET = exports.STR_REGEXP = exports.STR_REFERENCE_SYMBOL = exports.STR_REDACTED = exports.STR_READABLE_STREAM = exports.STR_PROMISE = exports.STR_PLUGIN = exports.STR_NULL = exports.STR_NEGATIVE_ZERO = exports.STR_NEGATIVE_INFINITY = exports.STR_NaN = exports.STR_MAP = exports.STR_INT_8_ARRAY = exports.STR_INT_32_ARRAY = exports.STR_INT_16_ARRAY = exports.STR_INFINITY = exports.STR_FORM_DATA = exports.STR_FLOAT_64_ARRAY = exports.STR_FLOAT_32_ARRAY = exports.STR_FILE = exports.STR_FALSE = exports.STR_FAILURE = exports.STR_ERROR = exports.STR_DATE = exports.STR_DATA_VIEW = exports.STR_BLOB = exports.STR_BIGINT = exports.STR_BIG_UINT_64_ARRAY = exports.STR_BIG_INT_64_ARRAY = exports.STR_ASYNC_ITERABLE = exports.STR_ARRAY_BUFFER = void 0;
exports.STR_ARRAY_BUFFER = "A";
exports.STR_ASYNC_ITERABLE = "*";
exports.STR_BIG_INT_64_ARRAY = "J";
exports.STR_BIG_UINT_64_ARRAY = "j";
exports.STR_BIGINT = "b";
exports.STR_BLOB = "K";
exports.STR_DATA_VIEW = "V";
exports.STR_DATE = "D";
exports.STR_ERROR = "E";
exports.STR_FAILURE = "!";
exports.STR_FALSE = "false";
exports.STR_FILE = "k";
exports.STR_FLOAT_32_ARRAY = "H";
exports.STR_FLOAT_64_ARRAY = "h";
exports.STR_FORM_DATA = "F";
exports.STR_INFINITY = "I";
exports.STR_INT_16_ARRAY = "L";
exports.STR_INT_32_ARRAY = "G";
exports.STR_INT_8_ARRAY = "O";
exports.STR_MAP = "M";
exports.STR_NaN = "NaN";
exports.STR_NEGATIVE_INFINITY = "i";
exports.STR_NEGATIVE_ZERO = "z";
exports.STR_NULL = "null";
exports.STR_PLUGIN = "P";
exports.STR_PROMISE = "$";
exports.STR_READABLE_STREAM = "R";
exports.STR_REDACTED = "<redacted>";
exports.STR_REFERENCE_SYMBOL = "@";
exports.STR_REGEXP = "r";
exports.STR_SET = "S";
exports.STR_SUCCESS = ":";
exports.STR_SYMBOL = "s";
exports.STR_TRUE = "true";
exports.STR_UINT_16_ARRAY = "l";
exports.STR_UINT_32_ARRAY = "g";
exports.STR_UINT_8_ARRAY = "o";
exports.STR_UINT_8_ARRAY_CLAMPED = "C";
exports.STR_UNDEFINED = "u";
exports.STR_URL = "U";
let SUPPORTS_FILE = true;
exports.SUPPORTS_FILE = SUPPORTS_FILE;
try {
    new File([], "");
}
catch {
    exports.SUPPORTS_FILE = SUPPORTS_FILE = false;
}
class WaitGroup {
    p = 0;
    #q = [];
    #waitQueue(resolve) {
        if (this.p === 0) {
            resolve();
        }
        else {
            this.#q.push(resolve);
        }
    }
    add() {
        this.p++;
    }
    done() {
        if (--this.p === 0) {
            let r;
            while ((r = this.#q.shift()) !== undefined) {
                r();
            }
        }
    }
    wait() {
        return new Promise(this.#waitQueue.bind(this));
    }
}
exports.WaitGroup = WaitGroup;
class Deferred {
    promise;
    resolve;
    reject;
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}
exports.Deferred = Deferred;
class DeferredAsyncIterable {
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
        // We reject before there is a chance to consume the error, so we need to catch it
        // to avoid an unhandled rejection.
        this.#next.promise.catch(() => { });
        this.#next.reject(error);
    }
    yield(value) {
        const deferred = new Deferred();
        this.#next.resolve({
            done: false,
            value,
            next: deferred,
        });
        this.#next = deferred;
    }
}
exports.DeferredAsyncIterable = DeferredAsyncIterable;
class DeferredReadableStream extends DeferredAsyncIterable {
    readable = new ReadableStream({
        start: async (controller) => {
            try {
                for await (const value of this.iterable) {
                    controller.enqueue(value);
                }
                controller.close();
            }
            catch (error) {
                controller.error(error);
            }
        },
    });
}
exports.DeferredReadableStream = DeferredReadableStream;
class TurboBlob extends Blob {
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
            this.#type = contentType ?? from?.type;
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
            return buffer.slice(this.#slice.start, this.#slice.end);
        }
        return buffer;
    }
    bytes() {
        return this.arrayBuffer().then((buffer) => new Uint8Array(buffer));
    }
    slice(start, end, contentType) {
        return new TurboBlob(this, start, end, contentType);
    }
    stream() {
        return new ReadableStream({
            start: async (controller) => {
                try {
                    controller.enqueue(await this.bytes());
                    controller.close();
                }
                catch (err) {
                    controller.error(err);
                }
            },
        });
    }
    text() {
        return this.bytes().then((bytes) => {
            return new TextDecoder().decode(bytes);
        });
    }
}
exports.TurboBlob = TurboBlob;
const FileBaseClass = SUPPORTS_FILE ? File : Blob;
class TurboFile extends FileBaseClass {
    promise;
    #size;
    #type;
    #name;
    #lastModified;
    #slice = {};
    constructor(from, start, end, contentType) {
        if (SUPPORTS_FILE) {
            super([], "");
        }
        else {
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
            this.#type = contentType ?? from?.type;
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
            return buffer.slice(this.#slice.start, this.#slice.end);
        }
        return buffer;
    }
    bytes() {
        return this.arrayBuffer().then((buffer) => new Uint8Array(buffer));
    }
    slice(start, end, contentType) {
        return new TurboFile(this, start, end, contentType);
    }
    stream() {
        return new ReadableStream({
            start: async (controller) => {
                try {
                    controller.enqueue(await this.bytes());
                    controller.close();
                }
                catch (err) {
                    controller.error(err);
                }
            },
        });
    }
    text() {
        return this.bytes().then((bytes) => {
            return new TextDecoder().decode(bytes);
        });
    }
}
exports.TurboFile = TurboFile;
