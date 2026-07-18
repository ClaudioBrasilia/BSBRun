'use client';

import { useEffect } from 'react';

/** Registra o service worker do PWA (torna o site instalável na tela inicial). */
export function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // PWA é progressivo por definição: sem SW, o site continua normal.
      });
    }
  }, []);
  return null;
}
