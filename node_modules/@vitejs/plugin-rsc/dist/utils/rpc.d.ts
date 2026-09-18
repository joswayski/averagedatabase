//#region src/utils/rpc.d.ts
declare function createRpcServer<T extends object>(handlers: T): (request: Request) => Promise<Response>;
declare function createRpcClient<T>(options: {
  endpoint: string;
}): T;
//#endregion
export { createRpcClient, createRpcServer };