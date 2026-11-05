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

The gallery includes compact single-row Illustration/Photo and style navigation, gallery search, local bookmarks, responsive Builder and detail panels (full-screen dialogs on mobile), copyable file-reference prompts, and image preview. All displays a continuous masonry layout with a total count; style tabs filter it. Masonry uses fixed small columns (approximately 152px on desktop, three columns on mobile), preserving aspect ratios. The thumbnail size control has been removed for now. Current placeholders use varied sample dimensions, with no generated images. The header scrolls out of view while navigation stays sticky. Illustration and Photo retain independent selections, and hidden illustration options never enter Photo prompts. Publish stays disabled until real assets and a safe, authorized publishing workflow are connected. Public reading does not authorize repository writes. No upload or simulated CDN approval occurs.

## Structure

- `reference/{style}/prompt.md`: independent style instructions.
- `reference/options/{category}/{id}/prompt.md`: independent option instructions.
- `src/components/promptbuilder/`: Builder controls.
- `src/utils/promptBuilder.ts`: selection and prompt-reference logic.
- `vite.config.ts`: reads only title/category/ID/path metadata from existing prompt files. Prompt bodies and images are not bundled into the site. They remain independently managed files in the public repository.

Bookmarks are stored in this browser only. Placeholder details describe the placeholder's style rather than pretending that a generated image has creation settings. Both `image-studio` and `image-assets` are intended to be Public. Files committed to either repository and their Git history are publicly readable, even before CDN approval. Publish means approved copying to `image-assets`, not making a private image public.

Deploy the static site with GitHub Pages; Cloudflare Pages/Workers are not used. Public assets and prompts can be read without a token. Never put GitHub credentials in frontend code, browser storage, or build output. Publishing requires repository write permission: use authenticated Codex Git operations or a manually dispatched GitHub workflow until safe browser-triggered publishing is implemented. The `.github/workflows/pages.yml` workflow deploys `main` to GitHub Pages after tests and build. In repository Settings → Pages, select GitHub Actions as the source. The site URL is https://unicome82.github.io/image-studio/. Live image data loading is not yet configured. Keep any Pages/Actions usage within free allowances; do not enable paid features without approval. See `IMAGE-STUDIO.md` and `PROMPT-BUILDER.md` for their requirements.

## Saved style sets

Use Save in Builder to save current settings, or Save in image detail to save the selected item’s style and aspect ratio. Current placeholders have no generated-image metadata, so detail saving uses only the displayed style and dimensions with default complexity. Save opens a centered modal with a Style name input, the exact prompt preview, Cancel, and Save. Cancel/Escape dismiss it without saving; on mobile it opens above the full-screen Builder or detail panel. The list icon next to bookmarks switches the main content to the saved-prompts page, with one, two, or at most three columns based on available width. Each transparent, bordered card has an edit icon beside its name, the complete reconstructed prompt in a read-only textarea styled like Builder, and background-free, border-free Copy and Delete icon buttons at the upper right. Delete replaces the Copy and Delete controls with Cancel and Delete confirmation buttons in the same area. There is no Load action; copying does not change Builder settings. Clipboard failures offer the same saved prompt for manual copying. It does not open a popup. Bookmark and saved-prompt views are mutually exclusive. Sets contain the image type, option IDs, complexity, and custom fields, not duplicated prompt bodies. They are stored in this browser’s LocalStorage and do not sync across devices. Clearing browser data removes them. Builder initially shows the Selected tab with removable selected-option chips, fixed aspect-ratio/complexity chips, and Generate prompt. Selected and Prompt act as tabs with black active text; generation switches to Prompt and uppercase Save/Copy actions. Changing any option, custom field, complexity, or image type returns to Selected. Aspect ratio has no collapse control. Chips summarize active catalog choices and their X controls remove the corresponding category/ID, including a selected Rendering Mode. Builder has Save on the left and Copy on the right; image detail has Save on the left and Publish on the right. Ordinary input textareas have a white background. Generated prompt textareas use the `prompt-textarea` class for a neutral gray background. Both have 1.3 line height, generous vertical padding, and disabled resizing. Detail prompt text is a plain paragraph without a box or fixed height. Focus outlines are hidden. Only Copy and Publish text buttons have leading icons; icon-only controls retain their symbols; Publish uses a CDN upload icon. Builder has no contrasting background, and its footer has a top divider.

## Compact Builder

Builder starts at 248px wide on desktop. Drag its right edge between 220px and 420px, or focus the separator and use arrow keys, Home, and End. Mobile remains a full-screen panel. The navigation Builder icon button matches the Illustration/Photo toggle height (28px on desktop and mobile). Option separators are removed. Collapsed options show all choices in a single horizontally scrollable row with a hidden scrollbar, mouse-wheel horizontal movement, mouse dragging without accidental selection, and native left/right touch swipes. A chevron on the right of each heading switches to the wrapped full list. No options are removed or measured to fit. Material Symbols expand_more and expand_less indicate expansion state, while Typography continues to use only its own switch. Option buttons use compact padding, and Builder option titles use regular gray text. Selected options lead only in multi-select categories; single-select Rendering Mode and Aspect Ratio retain their original order. A fourth option leaves all three selections intact and shows a limit toast. Builder buttons use 11px regular text in their original case, a 4px radius, and 4px spacing; expand/collapse controls are 24px squares. Builder section titles retain their compact styling. Buttons use uppercase labels; redundant Illustration suffixes are omitted from style choices and filters. Internal scrollbars are 6px wide with 8px rounded thumbs, using black at 0.1 opacity and 0.4 when their area is hovered. Document scrollbars are black regardless of hover. Outline is directly above the separate Aspect ratio option; Your direction is one textarea. Older saved Subject/Negative Prompt fields are preserved as labeled lines in that textarea; saved Text is kept in the separate optional Typography input. Typography defaults OFF. Its compact switch sits directly beside the title. Turn on its title-side switch to show the text input directly beneath its heading, followed by all typography choices. Single-line inputs, including typography, saved-set renaming, and the Save dialog, share a 28px height; the header search area and header icon buttons are 32px. Option buttons remain 24px tall. Typography uses no expand/collapse button; OFF hides its input and choices. If enabled with no text, the generated instruction asks the AI to choose suitable wording freely. OFF omits the text and typography options. The switch and text persist in saved style sets. Complexity uses names only in the UI and copied prompt; the range track is 1px high. Numeric levels remain internal for saved-set compatibility.

## Image preview and fonts

Preview is a centered, aspect-preserving fit on a black 70% backdrop with 8px background blur shared with all dialogs with only the visual and an upper-right close button. Scroll or pinch to zoom between 1× and 4×. Double-click or press 0 to reset; +/− and arrow keys also zoom. Click outside, press Escape, or use X to close. On mobile the detail panel remains open underneath. Placeholders remain solid colors; no image generation occurs. The original English image name and its copy icon appear above the detail image; the name uses 18px and weight 500. Hashtags appear below the image as badges. The image preview preserves its aspect ratio with a maximum height of 320px or 40dvh, whichever is smaller. Image names use the exact `fileName` when supplied, without translation; current placeholder samples keep their original English label and sequence number. Favorites use shared top-right heart buttons on thumbnails and detail images, with 24px filled hearts that are black at 0.2 opacity by default and red when selected and transparent button backgrounds in all states. Clicking anywhere on the detail image opens the preview; toggling its heart does not open the preview. Clicking the logo returns to the default Illustration gallery and clears active filters.

The logo is IMAGE STUDIO at 16px with font weight 900. Header and navigation horizontal padding match the Builder content at 20px, with a border between the header and navigation. Textarea padding is 8px. Illustration/Photo switching preserves the scroll position. Placeholders use a light shared color. Fixed SCSS lengths of at least 4px use multiples of 4px except font sizes, 6px internal scrollbars, and the 14px Typography switch. General positive corner radii are at least 8px and multiples of 4px; only the navigation Builder and Illustration/Photo toggles have rounded corners, while style filters stay square. Builder option buttons and text fields use 4px, and the Typography switch is a fully rounded 20px-wide, 12px-high control with 2px padding. Material Symbols use even pixel sizes with automatic optical sizing, standard font-size/font-weight properties, and no symbol-specific CSS variables; Builder expand/collapse icons are 16px. Text uses normal letter spacing, with 0.05em only for uppercase labels. Preview mouse or single-finger drags do not zoom, and its larger 40px close symbol uses a thin weight with no button background. All text, including prompt fields, uses Pretendard loaded from the version-pinned jsDelivr CDN (v1.3.9), with a sans-serif fallback.

## Source and style conventions

See `AGENTS.md` for the repository’s coding instructions. Header, Navigation, Gallery, ImageDetail, and the Builder controls each own their adjacent SCSS file. `src/styles.scss` imports only shared base rules, controls, scrollbars, layout, variables, and mixins from `src/styles/`. Update the owning rule instead of appending historical overrides.

Google Material Symbols Outlined icons are loaded through the jsDelivr CDN and rendered through `src/components/Icon.tsx`. No icon files are stored locally. A `fill` attribute or `fill` class on the icon span enables its filled form. The navigation Builder button uses the filled symbol and gradient only while open, with a transparent background while closed. Navigation text is 12px. The page background is white (`#fff`).

```sh
npm run format
npm run format:check
npm test
npm run build
```

The Pages workflow checks formatting before tests and build.

## Languages

The header uses vertical padding instead of a fixed height. The three rightmost header buttons share an 8px gap. The rightmost globe icon opens a custom language menu for English and Korean, with a right-side check for the current language, no resting selection background, and hover highlighting using i18next and react-i18next. UI translations are maintained in `src/locales/en.ts` and `src/locales/ko.ts`; initialization is in `src/i18n.ts`. The first visit follows the browser language (Korean or English fallback). Language selection is saved in LocalStorage when available and updates the document language and page title. Generated prompts, reference files, saved IDs, and user-entered content remain unchanged when switching languages.

Neutral UI grays use a subtle blue tint; the lightest background is #fcfcfe. Document and Builder scrollbar corners are square. Navigation tabs retain their original case. Output content fades in, button colors transition gradually, and reduced-motion preferences disable these animations. Image detail and preview close symbols are 32px with weight 200.
