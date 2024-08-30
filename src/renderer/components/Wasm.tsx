import React, { useEffect } from 'react';
import { wait } from '@/renderer/lib/utils';

import wasmFileUrl from '@/renderer/wasm/accompany.wasm?url';
let initialized = false;
let go: Go;
let goExitPromise: Promise<void> | undefined;

const CACHE_KEY = 'wasm-cache';

export async function initializeWasm(url: string): Promise<Go | null> {
  if (initialized) {
    return null;
  }

  if (typeof window === 'undefined') {
    return Promise.resolve(null);
  }

  go = new Go();
  let wasm;
  try {
    if ('instantiateStreaming' in WebAssembly) {
      wasm = await WebAssembly.instantiateStreaming(
        fetchWithCache(url),
        go.importObject,
      );
    } else {
      const bytes = await fetchWithCache(url).then((resp) =>
        resp.arrayBuffer(),
      );
      wasm = await WebAssembly.instantiate(bytes, go.importObject);
    }
    go.run(wasm.instance);
  } catch (error) {
    console.error('Failed to initialize WASM:', error);
    return null;
  }

  await wait(100);
  initialized = true;
  return go;
}

export function reset() {
  initialized = false;
}

export function getGO() {
  return go;
}

export function getGoExitPromise() {
  return goExitPromise;
}

async function fetchWithCache(url: string): Promise<Response> {
  if (!('caches' in window)) {
    return fetch(url);
  }

  const isResourceUpdated = async () => {
    const serverResponse = await fetch(url, { method: 'HEAD' });
    const etag = serverResponse.headers.get('ETag');
    const lastModified = serverResponse.headers.get('Last-Modified');
    return (
      serverResponse.ok &&
      (etag !== cachedResponse?.headers.get('ETag') ||
        lastModified !== cachedResponse?.headers.get('Last-Modified'))
    );
  };

  const cache = await caches.open(CACHE_KEY);
  const cachedResponse = await cache.match(url);
  if (cachedResponse && !(await isResourceUpdated())) {
    return cachedResponse;
  }

  return fetchAndUpdateCache(url, cache);
}

let wasmInitializedPromise = initializeWasm(wasmFileUrl);

async function fetchAndUpdateCache(
  url: string,
  cache: Cache,
): Promise<Response> {
  const response = await fetch(url, { cache: 'no-cache' });
  try {
    await cache.put(url, response.clone());
  } catch (error) {
    console.warn('Failed to put cache');
  }
  return response;
}

export default function Wasm(props: { className: string }) {
  useEffect(() => {
    wasmInitializedPromise.then(() => {
      window.commonEventFunc((event) => {
        console.log('event', event);
      });
      const config = {
        platformID: 5,
        dataDir: './',
        logLevel: 5,
        isLogStandardOutput: true,
        logFilePath: './',
        isExternalExtensions: false,
      };
      console.log(window.initSDK('id-2', JSON.stringify(config)));
      window
        .login('id-3', 'user-1', 'token-2')
        .then((res) => {
          console.log('login', res);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }, []);
  return <div className={props.className}>wasm</div>;
}
