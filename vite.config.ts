import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { optionOrder } from './src/utils/promptBuilder';
// Bundle canonical prompt text so copied prompts work without repository access. Images stay out.
function catalog(dir = 'reference'): { category?: string; id?: string; cue?: string }[] {
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
        cue: text.match(/\*\*Cue:\*\* (.+)/)?.[1]?.trim(),
        path,
        prompt: text.trim(),
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
        if (id !== '\0prompt-catalog') return;
        // Curated categories follow optionOrder instead of folder names.
        const options = catalog();
        const sorted = Object.fromEntries(
          Object.entries(optionOrder).map(([category, order]) => [
            category,
            options
              .filter((option) => option.category === category)
              .sort((a, b) => order.indexOf(a.id ?? '') - order.indexOf(b.id ?? '')),
          ]),
        );
        const ordered = options.map((option) =>
          option.category && sorted[option.category] ? sorted[option.category].shift() : option,
        );
        return `export default ${JSON.stringify(ordered)}`;
      },
    },
  ],
});
