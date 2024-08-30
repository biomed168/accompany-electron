// src/types/wasm-url.d.ts
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
