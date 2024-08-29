export {};
declare module '*.wasm?url' {
  const value: string;
  export default value;
}

declare module '*.wasm' {
  const initWasm: (
    options?: WebAssembly.Imports,
  ) => Promise<WebAssembly.Instance>;
  export default initWasm;
}
declare global {
  interface Window {
    commonEventFunc: (listener: (event: string) => void) => void;
    initSDK: (operationID: string, config: string) => void;
    login: (operationID: string, userID: string, token: string) => Promise<any>;
  }
  class Go {
    exited: boolean;
    importObject: WebAssembly.Imports;
    run: (instance: WebAssembly.Instance) => Promise<void>;
  }
}
