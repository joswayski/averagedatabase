import { Plugin } from "vite";

//#region src/plugins/cjs.d.ts
declare function cjsModuleRunnerPlugin(): Plugin[];
//#endregion
export { cjsModuleRunnerPlugin };