import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
// Expose names and paths only. Private prompt bodies and images never enter the build.
function catalog(dir = 'reference'): object[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return catalog(path);
    if (entry.name !== 'prompt.md') return [];
    const text = readFileSync(path, 'utf8');
    return [
      {
        label: text.match(/^## (.+)$/m)?.[1],
        category: text.match(/\*\*Category:\*\* (.+)/)?.[1],
        id: text.match(/\*\*Style ID:\*\* `([^`]+)`/)?.[1],
        path,
      },
    ];
  });
}
export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'prompt-metadata',
      resolveId(id) {
        if (id === 'virtual:prompt-catalog') return '\0prompt-catalog';
      },
      load(id) {
        if (id === '\0prompt-catalog') return `export default ${JSON.stringify(catalog())}`;
      },
    },
  ],
});
