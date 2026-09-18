export type DecodePlugin = (type: string, ...data: unknown[]) => {
    value: unknown;
} | false | null | undefined;
export type DecodeOptions = {
    plugins?: DecodePlugin[];
};
export declare function decode<T>(stream: ReadableStream<string>, { plugins }?: DecodeOptions): Promise<T>;
