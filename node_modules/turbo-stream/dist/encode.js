"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeSync = exports.encode = void 0;
const shared_js_1 = require("./shared.js");
let { NEGATIVE_INFINITY, POSITIVE_INFINITY, isNaN: nan } = Number;
const ASYNC_FRAME_TYPE_PROMISE = 1;
const ASYNC_FRAME_TYPE_ITERABLE = 2;
function encode(value, { plugins = [], redactErrors = true, signal } = {}) {
    const aborted = () => signal?.aborted ?? false;
    const waitForAbort = new Promise((_, reject) => {
        signal?.addEventListener("abort", (reason) => {
            reject(new DOMException("Aborted", "AbortError"));
        });
    });
    return new ReadableStream({
        async start(controller) {
            let refCache = new WeakMap();
            let asyncCache = new WeakMap();
            let counters = { refId: 0, promiseId: 0 };
            let wg = new shared_js_1.WaitGroup();
            let chunks = [];
            let encode = (value) => {
                encodeSync(value, chunks, refCache, asyncCache, promises, counters, plugins, redactErrors);
                controller.enqueue(chunks.join("") + "\n");
                chunks.length = 0;
            };
            let handlePromiseResolved = (id, value) => {
                wg.done();
                if (aborted())
                    return;
                controller.enqueue(`${id}${shared_js_1.STR_SUCCESS}`);
                encode(value);
            };
            let handlePromiseRejected = (id, error) => {
                wg.done();
                if (aborted())
                    return;
                controller.enqueue(`${id}${shared_js_1.STR_FAILURE}`);
                encode(error);
            };
            let promises = {
                push: (...promiseFrames) => {
                    for (let [type, id, promise] of promiseFrames) {
                        wg.add();
                        if (type === ASYNC_FRAME_TYPE_PROMISE) {
                            Promise.race([promise, waitForAbort]).then(handlePromiseResolved.bind(null, id), handlePromiseRejected.bind(null, id));
                        }
                        else {
                            (async () => {
                                let iterator = promise[Symbol.asyncIterator]();
                                let result;
                                do {
                                    result = await iterator.next();
                                    if (aborted())
                                        return;
                                    if (!result.done) {
                                        controller.enqueue(`${id}${shared_js_1.STR_SUCCESS}`);
                                        encode(result.value);
                                    }
                                } while (!result.done);
                            })()
                                .then(() => {
                                if (aborted())
                                    return;
                                controller.enqueue(`${id}\n`);
                            }, (error) => {
                                if (aborted())
                                    return;
                                controller.enqueue(`${id}${shared_js_1.STR_FAILURE}`);
                                encode(error);
                            })
                                .finally(() => {
                                wg.done();
                            });
                        }
                    }
                },
            };
            try {
                encode(value);
                do {
                    await Promise.race([wg.wait(), waitForAbort]);
                } while (wg.p > 0);
                controller.close();
            }
            catch (error) {
                controller.error(error);
            }
        },
    });
}
exports.encode = encode;
const ENCODE_FRAME_TYPE_NEEDS_ENCODING = 1;
const ENCODE_FRAME_TYPE_ALREADY_ENCODED = 2;
class EncodeFrame {
    type;
    prefix;
    value;
    constructor(type, prefix, value) {
        this.type = type;
        this.prefix = prefix;
        this.value = value;
    }
}
function encodeSync(value, chunks, refs, promises, asyncFrames, counters, plugins, redactErrors) {
    let encodeStack = [
        new EncodeFrame(ENCODE_FRAME_TYPE_NEEDS_ENCODING, "", value),
    ];
    let frame;
    encodeLoop: while ((frame = encodeStack.pop()) !== undefined) {
        if (frame.type === ENCODE_FRAME_TYPE_ALREADY_ENCODED) {
            chunks.push(frame.prefix);
            continue;
        }
        let { prefix, value } = frame;
        chunks.push(prefix);
        if (value === undefined) {
            chunks.push(shared_js_1.STR_UNDEFINED);
            continue;
        }
        if (value === null) {
            chunks.push(shared_js_1.STR_NULL);
            continue;
        }
        if (value === true) {
            chunks.push(shared_js_1.STR_TRUE);
            continue;
        }
        if (value === false) {
            chunks.push(shared_js_1.STR_FALSE);
            continue;
        }
        const typeOfValue = typeof value;
        if (typeOfValue === "object") {
            if (value instanceof Promise ||
                typeof value.then === "function") {
                let existingId = promises.get(value);
                if (existingId !== undefined) {
                    chunks.push(shared_js_1.STR_PROMISE, existingId.toString());
                    continue;
                }
                let promiseId = counters.promiseId++;
                promises.set(value, promiseId);
                chunks.push(shared_js_1.STR_PROMISE, promiseId.toString());
                asyncFrames.push([
                    ASYNC_FRAME_TYPE_PROMISE,
                    promiseId,
                    value,
                ]);
                continue;
            }
            if (value instanceof ReadableStream) {
                let existingId = promises.get(value);
                if (existingId !== undefined) {
                    chunks.push(shared_js_1.STR_READABLE_STREAM, existingId.toString());
                    continue;
                }
                let iterableId = counters.promiseId++;
                promises.set(value, iterableId);
                chunks.push(shared_js_1.STR_READABLE_STREAM, iterableId.toString());
                asyncFrames.push([
                    ASYNC_FRAME_TYPE_ITERABLE,
                    iterableId,
                    {
                        [Symbol.asyncIterator]: async function* () {
                            let reader = value.getReader();
                            try {
                                while (true) {
                                    let { done, value } = await reader.read();
                                    if (done) {
                                        return;
                                    }
                                    yield value;
                                }
                            }
                            finally {
                                reader.releaseLock();
                            }
                        },
                    },
                ]);
                continue;
            }
            if (typeof value[Symbol.asyncIterator] === "function") {
                let existingId = promises.get(value);
                if (existingId !== undefined) {
                    chunks.push(shared_js_1.STR_ASYNC_ITERABLE, existingId.toString());
                    continue;
                }
                let iterableId = counters.promiseId++;
                promises.set(value, iterableId);
                chunks.push(shared_js_1.STR_ASYNC_ITERABLE, iterableId.toString());
                asyncFrames.push([
                    ASYNC_FRAME_TYPE_ITERABLE,
                    iterableId,
                    value,
                ]);
                continue;
            }
            {
                let existingId = refs.get(value);
                if (existingId !== undefined) {
                    chunks.push(shared_js_1.STR_REFERENCE_SYMBOL, existingId.toString());
                    continue;
                }
                refs.set(value, counters.refId++);
            }
            if (value instanceof Date) {
                chunks.push(shared_js_1.STR_DATE, '"', value.toJSON(), '"');
            }
            else if (value instanceof RegExp) {
                chunks.push(shared_js_1.STR_REGEXP, JSON.stringify([value.source, value.flags]));
            }
            else if (value instanceof URL) {
                chunks.push(shared_js_1.STR_URL, JSON.stringify(value));
            }
            else if (value instanceof ArrayBuffer) {
                chunks.push(shared_js_1.STR_ARRAY_BUFFER, stringifyTypedArray(new Uint8Array(value)));
            }
            else if (value instanceof Int8Array) {
                chunks.push(shared_js_1.STR_INT_8_ARRAY, stringifyTypedArray(value));
            }
            else if (value instanceof Uint8Array) {
                chunks.push(shared_js_1.STR_UINT_8_ARRAY, stringifyTypedArray(value));
            }
            else if (value instanceof Uint8ClampedArray) {
                chunks.push(shared_js_1.STR_UINT_8_ARRAY_CLAMPED, stringifyTypedArray(value));
            }
            else if (value instanceof Int16Array) {
                chunks.push(shared_js_1.STR_INT_16_ARRAY, stringifyTypedArray(value));
            }
            else if (value instanceof Uint16Array) {
                chunks.push(shared_js_1.STR_UINT_16_ARRAY, stringifyTypedArray(value));
            }
            else if (value instanceof Int32Array) {
                chunks.push(shared_js_1.STR_INT_32_ARRAY, stringifyTypedArray(value));
            }
            else if (value instanceof Uint32Array) {
                chunks.push(shared_js_1.STR_UINT_32_ARRAY, stringifyTypedArray(value));
            }
            else if (value instanceof Float32Array) {
                chunks.push(shared_js_1.STR_FLOAT_32_ARRAY, stringifyTypedArray(value));
            }
            else if (value instanceof Float64Array) {
                chunks.push(shared_js_1.STR_FLOAT_64_ARRAY, stringifyTypedArray(value));
            }
            else if (value instanceof BigInt64Array) {
                chunks.push(shared_js_1.STR_BIG_INT_64_ARRAY, stringifyTypedArray(value));
            }
            else if (value instanceof BigUint64Array) {
                chunks.push(shared_js_1.STR_BIG_UINT_64_ARRAY, stringifyTypedArray(value));
            }
            else if (value instanceof DataView) {
                chunks.push(shared_js_1.STR_DATA_VIEW, stringifyTypedArray(value));
            }
            else if (value instanceof FormData) {
                encodeStack.push(new EncodeFrame(ENCODE_FRAME_TYPE_NEEDS_ENCODING, shared_js_1.STR_FORM_DATA, Array.from(value.entries())));
            }
            else if (shared_js_1.SUPPORTS_FILE && value instanceof File) {
                encodeStack.push(new EncodeFrame(ENCODE_FRAME_TYPE_NEEDS_ENCODING, shared_js_1.STR_FILE, {
                    promise: value.arrayBuffer(),
                    size: value.size,
                    type: value.type,
                    name: value.name,
                    lastModified: value.lastModified,
                }));
            }
            else if (value instanceof Blob) {
                encodeStack.push(new EncodeFrame(ENCODE_FRAME_TYPE_NEEDS_ENCODING, shared_js_1.STR_BLOB, {
                    promise: value.arrayBuffer(),
                    size: value.size,
                    type: value.type,
                }));
            }
            else if (value instanceof Error) {
                encodeStack.push(new EncodeFrame(ENCODE_FRAME_TYPE_NEEDS_ENCODING, shared_js_1.STR_ERROR, prepareErrorForEncoding(value, redactErrors)));
            }
            else if (typeof value.toJSON === "function") {
                const newValue = value.toJSON();
                encodeStack.push(new EncodeFrame(ENCODE_FRAME_TYPE_NEEDS_ENCODING, "", newValue));
                if (typeof newValue === "object") {
                    counters.refId--;
                }
                else {
                    refs.delete(value);
                }
            }
            else {
                {
                    let isIterable = typeof value[Symbol.iterator] === "function";
                    if (isIterable) {
                        let isArray = Array.isArray(value);
                        let toEncode = isArray
                            ? value
                            : Array.from(value);
                        encodeStack.push(new EncodeFrame(ENCODE_FRAME_TYPE_ALREADY_ENCODED, "]", undefined));
                        for (let i = toEncode.length - 1; i >= 0; i--) {
                            encodeStack.push(new EncodeFrame(ENCODE_FRAME_TYPE_NEEDS_ENCODING, i === 0 ? "" : ",", toEncode[i]));
                        }
                        chunks.push(isArray
                            ? "["
                            : value instanceof Set
                                ? `${shared_js_1.STR_SET}[`
                                : value instanceof Map
                                    ? `${shared_js_1.STR_MAP}[`
                                    : "[");
                        continue;
                    }
                }
                {
                    let pluginsLength = plugins.length;
                    for (let i = 0; i < pluginsLength; i++) {
                        let result = plugins[i](value);
                        if (Array.isArray(result)) {
                            encodeStack.push(new EncodeFrame(ENCODE_FRAME_TYPE_NEEDS_ENCODING, shared_js_1.STR_PLUGIN, result));
                            counters.refId--;
                            refs.delete(value);
                            continue encodeLoop;
                        }
                    }
                }
                encodeStack.push(new EncodeFrame(ENCODE_FRAME_TYPE_ALREADY_ENCODED, "}", undefined));
                {
                    let keys = Object.keys(value);
                    let end = keys.length;
                    let encodeFrames = new Array(end);
                    end -= 1;
                    for (let i = keys.length - 1; i >= 0; i--) {
                        let key = keys[i];
                        let prefix = i > 0 ? "," : "";
                        encodeFrames[end - i] = new EncodeFrame(ENCODE_FRAME_TYPE_NEEDS_ENCODING, `${prefix}${JSON.stringify(key)}:`, value[key]);
                    }
                    encodeStack.push(...encodeFrames);
                }
                chunks.push("{");
            }
        }
        else if (typeOfValue === "string") {
            chunks.push(JSON.stringify(value));
        }
        else if (typeOfValue === "number") {
            if (nan(value)) {
                chunks.push(shared_js_1.STR_NaN);
            }
            else if (value === POSITIVE_INFINITY) {
                chunks.push(shared_js_1.STR_INFINITY);
            }
            else if (value === NEGATIVE_INFINITY) {
                chunks.push(shared_js_1.STR_NEGATIVE_INFINITY);
            }
            else if (Object.is(value, -0)) {
                chunks.push(shared_js_1.STR_NEGATIVE_ZERO);
            }
            else {
                chunks.push(value.toString());
            }
        }
        else if (typeOfValue === "bigint") {
            chunks.push(shared_js_1.STR_BIGINT, value.toString());
        }
        else if (typeOfValue === "symbol") {
            let symbolKey = Symbol.keyFor(value);
            if (typeof symbolKey === "string") {
                chunks.push(shared_js_1.STR_SYMBOL, JSON.stringify(symbolKey));
            }
            else {
                chunks.push(shared_js_1.STR_UNDEFINED);
            }
        }
        else {
            let pluginsLength = plugins.length;
            for (let i = 0; i < pluginsLength; i++) {
                let result = plugins[i](value);
                if (Array.isArray(result)) {
                    encodeStack.push(new EncodeFrame(ENCODE_FRAME_TYPE_NEEDS_ENCODING, shared_js_1.STR_PLUGIN, result));
                    continue encodeLoop;
                }
            }
            chunks.push(shared_js_1.STR_UNDEFINED);
        }
    }
}
exports.encodeSync = encodeSync;
function prepareErrorForEncoding(error, redactErrors) {
    const shouldRedact = redactErrors === true ||
        typeof redactErrors === "string" ||
        typeof redactErrors === "undefined";
    const redacted = typeof redactErrors === "string" ? redactErrors : shared_js_1.STR_REDACTED;
    return {
        name: shouldRedact ? "Error" : error.name,
        message: shouldRedact ? redacted : error.message,
        stack: shouldRedact ? undefined : error.stack,
        cause: error.cause,
    };
}
function stringifyTypedArray(content) {
    const view = new Uint8Array(content.buffer, content.byteOffset, content.byteLength);
    return `"${btoa(String.fromCharCode.apply(String, view))}"`;
}
