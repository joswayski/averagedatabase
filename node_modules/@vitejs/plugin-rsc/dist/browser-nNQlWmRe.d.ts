//#region src/core/browser.d.ts
declare function setRequireModule(options: {
  load: (id: string) => Promise<unknown>;
}): void;
//#endregion
export { setRequireModule as t };