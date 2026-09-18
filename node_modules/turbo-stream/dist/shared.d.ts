export declare const STR_ARRAY_BUFFER = "A";
export declare const STR_ASYNC_ITERABLE = "*";
export declare const STR_BIG_INT_64_ARRAY = "J";
export declare const STR_BIG_UINT_64_ARRAY = "j";
export declare const STR_BIGINT = "b";
export declare const STR_BLOB = "K";
export declare const STR_DATA_VIEW = "V";
export declare const STR_DATE = "D";
export declare const STR_ERROR = "E";
export declare const STR_FAILURE = "!";
export declare const STR_FALSE = "false";
export declare const STR_FILE = "k";
export declare const STR_FLOAT_32_ARRAY = "H";
export declare const STR_FLOAT_64_ARRAY = "h";
export declare const STR_FORM_DATA = "F";
export declare const STR_INFINITY = "I";
export declare const STR_INT_16_ARRAY = "L";
export declare const STR_INT_32_ARRAY = "G";
export declare const STR_INT_8_ARRAY = "O";
export declare const STR_MAP = "M";
export declare const STR_NaN = "NaN";
export declare const STR_NEGATIVE_INFINITY = "i";
export declare const STR_NEGATIVE_ZERO = "z";
export declare const STR_NULL = "null";
export declare const STR_PLUGIN = "P";
export declare const STR_PROMISE = "$";
export declare const STR_READABLE_STREAM = "R";
export declare const STR_REDACTED = "<redacted>";
export declare const STR_REFERENCE_SYMBOL = "@";
export declare const STR_REGEXP = "r";
export declare const STR_SET = "S";
export declare const STR_SUCCESS = ":";
export declare const STR_SYMBOL = "s";
export declare const STR_TRUE = "true";
export declare const STR_UINT_16_ARRAY = "l";
export declare const STR_UINT_32_ARRAY = "g";
export declare const STR_UINT_8_ARRAY = "o";
export declare const STR_UINT_8_ARRAY_CLAMPED = "C";
export declare const STR_UNDEFINED = "u";
export declare const STR_URL = "U";
declare let SUPPORTS_FILE: boolean;
export { SUPPORTS_FILE };
export declare class WaitGroup {
    #private;
    p: number;
    add(): void;
    done(): void;
    wait(): Promise<void>;
}
export declare class Deferred<T> {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (error: unknown) => void;
    constructor();
}
export declare class DeferredAsyncIterable<T> {
    #private;
    iterable: AsyncIterable<T>;
    constructor();
    resolve(): void;
    reject(error: unknown): void;
    yield(value: T): void;
}
export declare class DeferredReadableStream<T> extends DeferredAsyncIterable<T> {
    readable: ReadableStream<T>;
}
export declare class TurboBlob extends Blob {
    #private;
    promise?: Promise<ArrayBuffer>;
    constructor();
    constructor(from: TurboBlob, start: number | undefined, end: number | undefined, contentType: string | undefined);
    get size(): number;
    set size(value: number);
    get type(): string;
    set type(value: string);
    arrayBuffer(): Promise<ArrayBuffer>;
    bytes(): Promise<Uint8Array>;
    slice(start?: number, end?: number, contentType?: string): Blob;
    stream(): ReadableStream<Uint8Array>;
    text(): Promise<string>;
}
declare const FileBaseClass: {
    new (fileBits: BlobPart[], fileName: string, options?: FilePropertyBag | undefined): File;
    prototype: File;
} | {
    new (blobParts?: BlobPart[] | undefined, options?: BlobPropertyBag | undefined): Blob;
    prototype: Blob;
};
export declare class TurboFile extends FileBaseClass {
    #private;
    promise?: Promise<ArrayBuffer>;
    constructor();
    constructor(from: TurboFile, start: number | undefined, end: number | undefined, contentType: string | undefined);
    get name(): string;
    set name(value: string);
    get lastModified(): number;
    set lastModified(value: number);
    get size(): number;
    set size(value: number);
    get type(): string;
    set type(value: string);
    arrayBuffer(): Promise<ArrayBuffer>;
    bytes(): Promise<Uint8Array>;
    slice(start?: number, end?: number, contentType?: string): Blob;
    stream(): ReadableStream<Uint8Array>;
    text(): Promise<string>;
}
