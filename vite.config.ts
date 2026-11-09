import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { optionOrder } from './src/utils/promptBuilder';
// Gallery tiles load a 480px-wide copy; detail and zoom keep the original.
const thumbnailWidth = 480;
async function thumbnails(dir = 'public/samples') {
  const out = join(dir, 'thumbs');
  mkdirSync(out, { recursive: true });
  for (const name of readdirSync(dir).filter((file) => file.endsWith('.webp'))) {
    const source = join(dir, name);
    const target = join(out, name);
    let stale = true;
    try {
      stale = statSync(target).mtimeMs < statSync(source).mtimeMs;
    } catch {
      /* Missing thumbnail. */
    }
    if (stale)
      await sharp(source)
        .resize({ width: thumbnailWidth, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(target);
  }
}
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
      name: 'sample-thumbnails',
      buildStart: () => thumbnails(),
    },
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
