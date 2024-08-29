import React from 'react';
import ToggleTheme from '@/renderer/components/ToggleTheme';
import Wasm from '@/renderer/components/Wasm';

export default function HomePage() {
  return (
    <>
      <div className="flex h-screen flex-col">
        <ToggleTheme />
        <Wasm className="flex-1"></Wasm>
      </div>
    </>
  );
}
