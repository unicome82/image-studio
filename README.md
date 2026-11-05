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

The gallery includes Illustration/Photo navigation, style anchors, local bookmarks, responsive Builder and detail panels, copyable file-reference prompts, and image preview. Publish stays disabled until real assets and an authenticated server API are connected. No public upload or simulated CDN approval occurs.

## Structure

- `reference/{style}/prompt.md`: independent style instructions.
- `reference/options/{category}/{id}/prompt.md`: independent option instructions.
- `src/components/promptbuilder/`: Builder controls.
- `src/utils/promptBuilder.ts`: selection and prompt-reference logic.
- `vite.config.ts`: reads only title/category/ID/path metadata from existing prompt files. Detailed private prompt bodies and images are never imported into the public build.

Bookmarks are stored in this browser only. Placeholder details describe the placeholder's style rather than pretending that a generated image has creation settings. Private content, administrator authentication, GitHub API publishing and deployment remain future integrations. See `IMAGE-STUDIO.md` and `PROMPT-BUILDER.md` for their requirements.
