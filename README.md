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

The gallery includes compact single-row Illustration/Photo and style navigation, gallery search, local bookmarks, responsive Builder and detail panels (full-screen dialogs on mobile), copyable file-reference prompts, and image preview. All displays a continuous masonry layout with a total count; style tabs filter it. Masonry uses fixed small columns (approximately 150px on desktop, three columns on mobile), preserving aspect ratios. The thumbnail size control has been removed for now. Current placeholders use varied sample dimensions, with no generated images. The header scrolls out of view while navigation stays sticky. Illustration and Photo retain independent selections, and hidden illustration options never enter Photo prompts. Publish stays disabled until real assets and a safe, authorized publishing workflow are connected. Public reading does not authorize repository writes. No upload or simulated CDN approval occurs.

## Structure

- `reference/{style}/prompt.md`: independent style instructions.
- `reference/options/{category}/{id}/prompt.md`: independent option instructions.
- `src/components/promptbuilder/`: Builder controls.
- `src/utils/promptBuilder.ts`: selection and prompt-reference logic.
- `vite.config.ts`: reads only title/category/ID/path metadata from existing prompt files. Prompt bodies and images are not bundled into the site. They remain independently managed files in the public repository.

Bookmarks are stored in this browser only. Placeholder details describe the placeholder's style rather than pretending that a generated image has creation settings. Both `image-studio` and `image-assets` are intended to be Public. Files committed to either repository and their Git history are publicly readable, even before CDN approval. Publish means approved copying to `image-assets`, not making a private image public.

Deploy the static site with GitHub Pages; Cloudflare Pages/Workers are not used. Public assets and prompts can be read without a token. Never put GitHub credentials in frontend code, browser storage, or build output. Publishing requires repository write permission: use authenticated Codex Git operations or a manually dispatched GitHub workflow until safe browser-triggered publishing is implemented. The `.github/workflows/pages.yml` workflow deploys `main` to GitHub Pages after tests and build. In repository Settings → Pages, select GitHub Actions as the source. The site URL is https://unicome82.github.io/image-studio/. Live image data loading is not yet configured. Keep any Pages/Actions usage within free allowances; do not enable paid features without approval. See `IMAGE-STUDIO.md` and `PROMPT-BUILDER.md` for their requirements.

## Saved style sets

Use Save in Builder to save current settings, or Save in image detail to save the selected item’s style and aspect ratio. Current placeholders have no generated-image metadata, so detail saving uses only the displayed style and dimensions with default complexity. Save opens a centered modal with a Style name input, the exact prompt preview, Cancel, and Save. Cancel/Escape dismiss it without saving; on mobile it opens above the full-screen Builder or detail panel. The list icon next to bookmarks switches the main content to the saved-prompts page, with one, two, or at most three columns based on available width. Each card has an edit icon directly beside its name, the complete prompt reconstructed from its saved settings, a Copy button, and deletion. There is no Load action; copying does not change Builder settings. Clipboard failures offer the same saved prompt for manual copying. It does not open a popup. Bookmark and saved-prompt views are mutually exclusive. Sets contain the image type, option IDs, complexity, and custom fields, not duplicated prompt bodies. They are stored in this browser’s LocalStorage and do not sync across devices. Clearing browser data removes them. Builder has Save on the left and Copy on the right; image detail has Save on the left and Publish on the right. Textareas have a neutral gray background, 1.3 line height, generous vertical padding, and disabled resizing. Detail prompt text is a plain paragraph without a box or fixed height. Focus outlines are hidden. Save/Copy and Publish have leading icons; Publish uses a CDN upload icon. Builder has no contrasting background, and its footer has a top divider.

## Compact Builder

Builder starts at 248px wide on desktop. Drag its right edge between 220px and 420px, or focus the separator and use arrow keys, Home, and End. Mobile remains a full-screen panel. Option separators are removed. Collapsed choices fit one measured row; resizing Builder automatically changes how many buttons fit. The +/− control on the right of each category title expands or collapses the full category. Option buttons use half the former vertical padding, and Builder option titles use bold gray 10px text. All UI text is at least 10px. All scrollbars, including body and save-modal preview, use square corners, 6px width, no arrow buttons, and no thumb-to-track gap. Outline is directly above the separate Aspect ratio option; Your direction is one textarea. Older saved Subject/Negative Prompt fields are preserved as labeled lines in that textarea; saved Text is kept in the separate optional Typography input. Typography defaults OFF. Turn on its title-side switch to enable style choices and the text input. If enabled with no text, the generated instruction asks the AI to choose suitable wording freely. OFF omits the text and typography options. The switch and text persist in saved style sets. Complexity uses names only in the UI and copied prompt; the range track is 1px high. Numeric levels remain internal for saved-set compatibility.

## Image preview and fonts

Preview is a centered, aspect-preserving fit on a black 50% backdrop with only the visual and an upper-right close button. Drag vertically, scroll, or pinch to zoom between 1× and 4×. Double-click or press 0 to reset; +/− and arrow keys also zoom. Click outside, press Escape, or use X to close. On mobile the detail panel remains open underneath. Placeholders remain solid colors; no image generation occurs. The detail heading has no bottom border.

The logo is IMAGE STUDIO. All text uses the browser’s default font, including prompt fields; there are no remote/CDN font imports or requests.
