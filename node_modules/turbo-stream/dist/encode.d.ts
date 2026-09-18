declare const ASYNC_FRAME_TYPE_PROMISE = 1;
declare const ASYNC_FRAME_TYPE_ITERABLE = 2;
type AsyncFrame = [
    type: typeof ASYNC_FRAME_TYPE_PROMISE,
    id: number,
    promise: PromiseLike<unknown>
] | [
    type: typeof ASYNC_FRAME_TYPE_ITERABLE,
    id: number,
    iterable: AsyncIterable<unknown>
];
export type EncodePlugin = (value: unknown) => [string, ...unknown[]] | false | null | undefined;
export type EncodeOptions = {
    plugins?: EncodePlugin[];
    redactErrors?: boolean | string;
    signal?: AbortSignal;
};
export declare function encode(value: unknown, { plugins, redactErrors, signal }?: EncodeOptions): ReadableStream<string>;
export declare function encodeSync(value: unknown, chunks: {
    push(...chunk: string[]): void;
}, refs: WeakMap<object, number>, promises: WeakMap<object, number>, asyncFrames: {
    push(frame: AsyncFrame): void;
}, counters: {
    refId: number;
    promiseId: number;
}, plugins: EncodePlugin[], redactErrors: boolean | string): void;
export {};
