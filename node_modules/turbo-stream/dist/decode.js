"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = void 0;
const shared_js_1 = require("./shared.js");
let MODE_UNKNOWN = 0;
let MODE_NUMBER = 1;
let MODE_STRING = 2;
let MODE_ASYNC = 3;
let SUB_MODE_UNKNOWN = 0;
let SUB_MODE_BIGINT = 1;
let SUB_MODE_DATE = 2;
let SUB_MODE_URL = 3;
let SUB_MODE_SYMBOL = 4;
let SUB_MODE_REFERENCE = 5;
let SUB_MODE_OBJECT_KEY = 6;
let SUB_MODE_PROMISE_ID = 7;
let SUB_MODE_ASYNC_ITERABLE_ID = 8;
let SUB_MODE_READABLE_STREAM_ID = 9;
let SUB_MODE_ASYNC_STATUS = 10;
let SUB_MODE_ARRAY_BUFFER = 11;
let SUB_MODE_INT_8_ARRAY = 12;
let SUB_MODE_UINT_8_ARRAY = 13;
let SUB_MODE_UINT_8_ARRAY_CLAMPED = 14;
let SUB_MODE_INT_16_ARRAY = 15;
let SUB_MODE_UINT_16_ARRAY = 16;
let SUB_MODE_INT_32_ARRAY = 17;
let SUB_MODE_UINT_32_ARRAY = 18;
let SUB_MODE_FLOAT_32_ARRAY = 19;
let SUB_MODE_FLOAT_64_ARRAY = 20;
let SUB_MODE_BIG_INT_64_ARRAY = 21;
let SUB_MODE_BIG_UINT_64_ARRAY = 22;
let SUB_MODE_DATA_VIEW = 23;
let ARRAY_TYPE_SET = 0;
let ARRAY_TYPE_MAP = 1;
let ARRAY_TYPE_REGEXP = 2;
let ARRAY_TYPE_FORM_DATA = 3;
let ARRAY_TYPE_PLUGIN = 4;
let RELEASE_TYPE_VALUE = 0;
let RELEASE_TYPE_OBJECT = 1;
let RELEASE_TYPE_ARRAY = 2;
let RELEASE_TYPE_PROMISE = 3;
async function decode(stream, { plugins = [] } = {}) {
    let root = new shared_js_1.Deferred();
    let references = new Map();
    let deferredValues = new Map();
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
        }
        else if (type === RELEASE_TYPE_ARRAY) {
            if (!Array.isArray(value)) {
                throw new Error("Expected array");
            }
        }
        if (Array.isArray(value) &&
            typeof value.__type === "number") {
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
                        // TODO: Should this throw? Should we have a way to recover from errors in the options?
                        value = undefined;
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
        }
        else if (typeof parent === "string") {
            stack.pop();
            stack[stack.length - 1][parent] = value;
        }
        else if (typeof parent === "boolean") {
            stack.pop();
            let deferred = deferredValues.get(stack.pop());
            if (!deferred) {
                throw new Error("Invalid stack state");
            }
            if (deferred instanceof shared_js_1.Deferred) {
                if (parent) {
                    deferred.resolve(value);
                }
                else {
                    deferred.reject(value);
                }
            }
            else {
                if (parent) {
                    deferred.yield(value);
                }
                else {
                    deferred.reject(value);
                }
            }
        }
        else {
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
                    // ,
                    mode = MODE_UNKNOWN;
                    subMode = Array.isArray(stack[stack.length - 1])
                        ? SUB_MODE_UNKNOWN
                        : SUB_MODE_OBJECT_KEY;
                }
                else if (charCode === 10) {
                    // \n
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
                }
                else if (charCode === 123) {
                    // {
                    let newObj = {};
                    stack.push(newObj);
                    references.set(references.size, newObj);
                    subMode = SUB_MODE_OBJECT_KEY;
                }
                else if (charCode === 125) {
                    // }
                    releaseValue(stack.pop(), 1);
                }
                else if (charCode === 91) {
                    // [
                    let newArr = [];
                    stack.push(newArr);
                    references.set(references.size, newArr);
                }
                else if (charCode === 83) {
                    // S
                    let newArr = [];
                    newArr.__type = ARRAY_TYPE_SET;
                    newArr.__ref = new Set();
                    stack.push(newArr);
                    references.set(references.size, newArr.__ref);
                    i++;
                }
                else if (charCode === 77) {
                    // M
                    let newArr = [];
                    newArr.__type = ARRAY_TYPE_MAP;
                    newArr.__ref = new Map();
                    stack.push(newArr);
                    references.set(references.size, newArr.__ref);
                    i++;
                }
                else if (charCode === 114) {
                    // r
                    let newArr = [];
                    newArr.__type = ARRAY_TYPE_REGEXP;
                    newArr.__id = references.size;
                    stack.push(newArr);
                    references.set(newArr.__id, newArr);
                    i++;
                }
                else if (charCode === 80) {
                    // P
                    let newArr = [];
                    newArr.__type = ARRAY_TYPE_PLUGIN;
                    newArr.__id = references.size;
                    stack.push(newArr);
                    references.set(newArr.__id, newArr);
                    i++;
                }
                else if (charCode === 93) {
                    // ]
                    releaseValue(stack.pop(), 2);
                }
                else if (charCode === 64) {
                    // @
                    subMode = SUB_MODE_REFERENCE;
                }
                else if (charCode === 68) {
                    // D
                    subMode = SUB_MODE_DATE;
                }
                else if (charCode === 85) {
                    // U
                    subMode = SUB_MODE_URL;
                }
                else if (charCode === 115) {
                    // s
                    subMode = SUB_MODE_SYMBOL;
                }
                else if (charCode === 34) {
                    // "
                    mode = MODE_STRING;
                    buffer = "";
                    lastChar = undefined;
                    numSlashes = 0;
                    hasSlashes = false;
                }
                else if (charCode === 36) {
                    // $
                    subMode = SUB_MODE_PROMISE_ID;
                }
                else if (charCode === 42) {
                    // *
                    subMode = SUB_MODE_ASYNC_ITERABLE_ID;
                }
                else if (charCode === 82) {
                    // R
                    subMode = SUB_MODE_READABLE_STREAM_ID;
                }
                else if (charCode === 58) {
                    // :
                    if (subMode !== SUB_MODE_ASYNC_STATUS) {
                        throw new SyntaxError("Unexpected character: ':'");
                    }
                    stack.push(true);
                }
                else if (charCode === 33) {
                    // !
                    if (subMode !== SUB_MODE_ASYNC_STATUS) {
                        throw new SyntaxError("Unexpected character: '!'");
                    }
                    stack.push(false);
                }
                else if (charCode === 117) {
                    // u
                    releaseValue(undefined, 0);
                    subMode = SUB_MODE_UNKNOWN;
                }
                else if (charCode === 110) {
                    // n
                    i += 3;
                    releaseValue(null, 0);
                    subMode = SUB_MODE_UNKNOWN;
                }
                else if (charCode === 116) {
                    // t
                    i += 3;
                    releaseValue(true, 0);
                    subMode = SUB_MODE_UNKNOWN;
                }
                else if (charCode === 102) {
                    // f
                    i += 4;
                    releaseValue(false, 0);
                    subMode = SUB_MODE_UNKNOWN;
                }
                else if (charCode === 78) {
                    // N
                    i += 2;
                    releaseValue(Number.NaN, 0);
                    subMode = SUB_MODE_UNKNOWN;
                }
                else if (charCode === 73) {
                    // I
                    releaseValue(Number.POSITIVE_INFINITY, 0);
                    subMode = SUB_MODE_UNKNOWN;
                }
                else if (charCode === 105) {
                    // i
                    releaseValue(Number.NEGATIVE_INFINITY, 0);
                    subMode = SUB_MODE_UNKNOWN;
                }
                else if (charCode === 122) {
                    // z
                    releaseValue(-0, 0);
                    subMode = SUB_MODE_UNKNOWN;
                }
                else if (charCode === 98) {
                    // b
                    subMode = SUB_MODE_BIGINT;
                }
                else if (charCode === 45 || // -
                    charCode === 46 || // .
                    (charCode >= 48 && charCode <= 57) // 0-9
                ) {
                    mode = MODE_NUMBER;
                    buffer = chunk[i];
                }
                else if (charCode === 69) {
                    // E
                    let newObj = new Error();
                    stack.push(newObj);
                    references.set(references.size, newObj);
                    subMode = SUB_MODE_OBJECT_KEY;
                    i++;
                }
                else if (charCode === 70) {
                    // F
                    let newArr = [];
                    newArr.__type = ARRAY_TYPE_FORM_DATA;
                    newArr.__id = references.size;
                    stack.push(newArr);
                    references.set(newArr.__id, newArr);
                    i++;
                }
                else if (charCode === 75) {
                    // K
                    let newObj = new shared_js_1.TurboBlob();
                    stack.push(newObj);
                    references.set(references.size, newObj);
                    subMode = SUB_MODE_OBJECT_KEY;
                    i++;
                }
                else if (charCode === 107) {
                    // k
                    let newObj = new shared_js_1.TurboFile();
                    stack.push(newObj);
                    references.set(references.size, newObj);
                    subMode = SUB_MODE_OBJECT_KEY;
                    i++;
                }
                else if (charCode === 65) {
                    // A
                    subMode = SUB_MODE_ARRAY_BUFFER;
                }
                else if (charCode === 79) {
                    // O
                    subMode = SUB_MODE_INT_8_ARRAY;
                }
                else if (charCode === 111) {
                    // o
                    subMode = SUB_MODE_UINT_8_ARRAY;
                }
                else if (charCode === 67) {
                    // C
                    subMode = SUB_MODE_UINT_8_ARRAY_CLAMPED;
                }
                else if (charCode === 76) {
                    // L
                    subMode = SUB_MODE_INT_16_ARRAY;
                }
                else if (charCode === 108) {
                    // l
                    subMode = SUB_MODE_UINT_16_ARRAY;
                }
                else if (charCode === 71) {
                    // G
                    subMode = SUB_MODE_INT_32_ARRAY;
                }
                else if (charCode === 103) {
                    // g
                    subMode = SUB_MODE_UINT_32_ARRAY;
                }
                else if (charCode === 72) {
                    // H
                    subMode = SUB_MODE_FLOAT_32_ARRAY;
                }
                else if (charCode === 104) {
                    // h
                    subMode = SUB_MODE_FLOAT_64_ARRAY;
                }
                else if (charCode === 74) {
                    // J
                    subMode = SUB_MODE_BIG_INT_64_ARRAY;
                }
                else if (charCode === 106) {
                    // j
                    subMode = SUB_MODE_BIG_UINT_64_ARRAY;
                }
                else if (charCode === 86) {
                    // V
                    subMode = SUB_MODE_DATA_VIEW;
                }
                else {
                    throw new SyntaxError(`Unexpected character: '${chunk[i]}'`);
                }
            }
            else if (mode === MODE_NUMBER || mode === MODE_ASYNC) {
                if (charCode === 45 || // -
                    charCode === 46 || // .
                    (charCode >= 48 && charCode <= 57) // 0-9
                ) {
                    buffer += chunk[i];
                }
                else {
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
                        }
                        else {
                            let deferred = new shared_js_1.Deferred();
                            deferredValues.set(id, deferred);
                            releaseValue(deferred.promise, 0);
                        }
                    }
                    else if (subMode === SUB_MODE_ASYNC_ITERABLE_ID) {
                        let id = Number(buffer);
                        let existing = deferredValues.get(id);
                        if (existing) {
                            releaseValue(existing.iterable, 0);
                        }
                        else {
                            let deferred = new shared_js_1.DeferredAsyncIterable();
                            deferredValues.set(id, deferred);
                            releaseValue(deferred.iterable, 0);
                        }
                    }
                    else if (subMode === SUB_MODE_READABLE_STREAM_ID) {
                        let id = Number(buffer);
                        let existing = deferredValues.get(id);
                        if (existing) {
                            releaseValue(existing.readable, 0);
                        }
                        else {
                            let deferred = new shared_js_1.DeferredReadableStream();
                            deferredValues.set(id, deferred);
                            releaseValue(deferred.readable, 0);
                        }
                    }
                    else {
                        releaseValue(subMode === SUB_MODE_BIGINT
                            ? BigInt(buffer)
                            : subMode === SUB_MODE_REFERENCE
                                ? references.get(Number(buffer))
                                : Number(buffer), 0);
                    }
                    buffer = "";
                    mode = MODE_UNKNOWN;
                    subMode = SUB_MODE_UNKNOWN;
                    i--;
                }
            }
            else if (mode === MODE_STRING) {
                let stringEnd = false;
                for (; i < length; i++) {
                    charCode = chunk.charCodeAt(i);
                    if (charCode !== 34 || (lastChar === 92 && numSlashes % 2 === 1)) {
                        buffer += chunk[i];
                        lastChar = charCode;
                        if (lastChar === 92) {
                            numSlashes++;
                            hasSlashes = true;
                        }
                        else {
                            numSlashes = 0;
                        }
                    }
                    else {
                        stringEnd = true;
                        break;
                    }
                }
                if (stringEnd) {
                    let value = hasSlashes ? JSON.parse(`"${buffer}"`) : buffer;
                    if (subMode === SUB_MODE_OBJECT_KEY) {
                        stack.push(value);
                        i++;
                    }
                    else {
                        if (subMode === SUB_MODE_DATE) {
                            value = new Date(value);
                            references.set(references.size, value);
                        }
                        else if (subMode === SUB_MODE_SYMBOL) {
                            value = Symbol.for(value);
                        }
                        else if (subMode === SUB_MODE_URL) {
                            value = new URL(value);
                            references.set(references.size, value);
                        }
                        else if (subMode === SUB_MODE_ARRAY_BUFFER) {
                            value = decodeTypedArray(value).buffer;
                            references.set(references.size, value);
                        }
                        else if (subMode === SUB_MODE_INT_8_ARRAY) {
                            value = new Int8Array(decodeTypedArray(value).buffer);
                            references.set(references.size, value);
                        }
                        else if (subMode === SUB_MODE_UINT_8_ARRAY) {
                            value = decodeTypedArray(value);
                            references.set(references.size, value);
                        }
                        else if (subMode === SUB_MODE_UINT_8_ARRAY_CLAMPED) {
                            value = new Uint8ClampedArray(decodeTypedArray(value).buffer);
                            references.set(references.size, value);
                        }
                        else if (subMode === SUB_MODE_INT_16_ARRAY) {
                            value = new Int16Array(decodeTypedArray(value).buffer);
                            references.set(references.size, value);
                        }
                        else if (subMode === SUB_MODE_UINT_16_ARRAY) {
                            value = new Uint16Array(decodeTypedArray(value).buffer);
                            references.set(references.size, value);
                        }
                        else if (subMode === SUB_MODE_INT_32_ARRAY) {
                            value = new Int32Array(decodeTypedArray(value).buffer);
                            references.set(references.size, value);
                        }
                        else if (subMode === SUB_MODE_UINT_32_ARRAY) {
                            value = new Uint32Array(decodeTypedArray(value).buffer);
                            references.set(references.size, value);
                        }
                        else if (subMode === SUB_MODE_FLOAT_32_ARRAY) {
                            value = new Float32Array(decodeTypedArray(value).buffer);
                            references.set(references.size, value);
                        }
                        else if (subMode === SUB_MODE_FLOAT_64_ARRAY) {
                            value = new Float64Array(decodeTypedArray(value).buffer);
                            references.set(references.size, value);
                        }
                        else if (subMode === SUB_MODE_BIG_INT_64_ARRAY) {
                            value = new BigInt64Array(decodeTypedArray(value).buffer);
                            references.set(references.size, value);
                        }
                        else if (subMode === SUB_MODE_BIG_UINT_64_ARRAY) {
                            value = new BigUint64Array(decodeTypedArray(value).buffer);
                            references.set(references.size, value);
                        }
                        else if (subMode === SUB_MODE_DATA_VIEW) {
                            value = decodeTypedArray(value);
                            value = new DataView(value.buffer, value.byteOffset, value.byteLength);
                            references.set(references.size, value);
                        }
                        releaseValue(value, 0);
                    }
                    mode = MODE_UNKNOWN;
                    subMode = SUB_MODE_UNKNOWN;
                }
                else {
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
    })()
        .catch((error) => {
        if (root) {
            root.reject(error);
            root = null;
        }
        for (let deferred of deferredValues.values()) {
            deferred.reject(error);
        }
    })
        .finally(() => {
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
exports.decode = decode;
function decodeTypedArray(base64) {
    const decodedStr = atob(base64);
    const uint8Array = new Uint8Array(decodedStr.length);
    for (let i = 0; i < decodedStr.length; i++) {
        uint8Array[i] = decodedStr.charCodeAt(i);
    }
    return uint8Array;
}
