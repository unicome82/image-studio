# Image Studio

React + TypeScript + SCSS personal image gallery. The current interface uses solid-color placeholders; no images are generated or uploaded.

## Development

Node.js 22+ and npm:

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

The gallery includes Illustration/Photo navigation, style anchors, local bookmarks, responsive Builder and detail panels, copyable file-reference prompts, and image preview. Publish stays disabled until real assets and a safe, authorized publishing workflow are connected. Public reading does not authorize repository writes. No upload or simulated CDN approval occurs.

## Structure

- `reference/{style}/prompt.md`: independent style instructions.
- `reference/options/{category}/{id}/prompt.md`: independent option instructions.
- `src/components/promptbuilder/`: Builder controls.
- `src/utils/promptBuilder.ts`: selection and prompt-reference logic.
- `vite.config.ts`: reads only title/category/ID/path metadata from existing prompt files. Prompt bodies and images are not bundled into the site. They remain independently managed files in the public repository.

Bookmarks are stored in this browser only. Placeholder details describe the placeholder's style rather than pretending that a generated image has creation settings. Both `image-studio` and `image-assets` are intended to be Public. Files committed to either repository and their Git history are publicly readable, even before CDN approval. Publish means approved copying to `image-assets`, not making a private image public.

Deploy the static site with GitHub Pages; Cloudflare Pages/Workers are not used. Public assets and prompts can be read without a token. Never put GitHub credentials in frontend code, browser storage, or build output. Publishing requires repository write permission: use authenticated Codex Git operations or a manually dispatched GitHub workflow until safe browser-triggered publishing is implemented. The `.github/workflows/pages.yml` workflow deploys `main` to GitHub Pages after tests and build. In repository Settings → Pages, select GitHub Actions as the source. The site URL is https://unicome82.github.io/image-studio/. Live image data loading is not yet configured. Keep any Pages/Actions usage within free allowances; do not enable paid features without approval. See `IMAGE-STUDIO.md` and `PROMPT-BUILDER.md` for their requirements.
