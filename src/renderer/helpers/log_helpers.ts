import { SUFFIX } from '@/constants';

async function _proxyLog() {
  const originalConsoleInfo = console.info;

  console.info = (...args: string[]) => {
    if (window[SUFFIX as keyof typeof window]?.logMode?.info) {
      window[SUFFIX as keyof typeof window].logMode.info(...args);
    }
    console.log(...args);
    originalConsoleInfo(...args);
  };
}

export async function proxyLog() {
  _proxyLog();
}
