# Image Studio

## Filter panel

The left
panel filters the gallery, favorites, and saved style sets. Its heading is a single
All / Illustration / Photo / Design dropdown. All shows shared options; Illustration, Photo, and Design add their own
categories. Design has six formats and six design styles, with shared color,
composition, texture, and typography options. Type changes keep shared choices
and clear incompatible categories. The circular-arrow reset icon clears filters and search,
preserving the current type. When the panel is closed, its type selector appears
immediately after the results toolbar's filter icon with the same typography and
control styling, keeping the same selection.
Filter selection is unlimited. No selected options, or every available option in
a category, means that category does not restrict results, including records with
missing option metadata. Other categories remain active. Options use OR within
each category and AND across categories. Options start expanded. Collapsing a
category replaces its buttons with #prefixed selected values. The summary uses
a single line with CSS ellipsis when it overflows; all values remain available
in the title and the expanded options. No remaining count is shown. Empty and fully selected filter categories
summarize as All; an empty builder category summarizes as None selected. Clicking
the category title or chevron reopens it without changing choices or typed text.

The results toolbar contains the filter toggle, a numeric-only count, and thumbnail
size or collection sorting controls. The toolbar sticks during scrolling with
8px backdrop blur and their original translucent white backgrounds. Only collapsed
editable selections fade gently toward the right-side ellipsis control. The main
header has a bottom border. Selected filters appear
as removable chips without an extra heading, and the chip row disappears when
empty. The image type is shown only by the type dropdown, never as a
selected chip or thumbnail tag. Fully selected categories are omitted from the active chips. The old top
navigation and ALL / SELECTED labels are removed. Collection sorting uses compact
New / Old / A–Z labels (최신순 / 과거순 / 이름순 in Korean).

The bottom-right floating button shows an icon at rest. On hover or keyboard focus,
GENERATE PROMPT slides into view to the right of the icon without an opacity fade.
Its right edge follows the gallery content, moving left of an open detail panel;
the expanded label stays inside the gallery. Touch devices open the builder on
the first tap without requiring hover. On mobile the filter panel slides in from
the left at full width with a transparent, unblurred backdrop. Press Escape or
use X to close; there is no swipe-to-close gesture. Vertical scrolling and the
selected chips’ horizontal scrolling retain their normal behavior. Motion follows reduced-motion settings. Both this button and the panel's Generate
prompt button open the full-screen builder. The full builder viewport scrolls;
the option body no longer has its own scrollbar. Its heading and output remain
sticky with 8px backdrop blur, so content passes beneath them. Selected and Prompt
use independent controls without clearing settings or hiding Save/Copy. Editable
Selected chips use the same single-row summary and ellipsis toggle as mobile
filter selections, without a visible Selected heading.
Prompt starts collapsed on mobile and expanded on desktop.
On mobile, collapsing output sections frees room for the options. Closing and
reopening preserves the
draft. Newly changed filters seed the builder, while builder edits do not filter
the gallery. The builder keeps its three-option limit (one for outline, ratio,
and complexity). When transferred filters exceed a limit, the builder lists every
candidate and asks the user to choose within that limit. This selection step shows
only the instructions and option choices, with each limit beside its category
heading rather than repeated explanatory paragraphs; Selected, Prompt, Save, and Copy return
after applying the choices. Design Format is single-select. No candidates are
silently truncated, and unfinished choices survive closing/reopening the builder.
Its circular-arrow reset icon clears the draft and optional choices, restoring
the standard ratio, complexity, and Color Only outline mode.

On mobile, the filter footer repeats active selections as removable chips above
two equal-width actions: white Generate prompt on the left and black View images
on the right, without a title or top divider. View images closes the filter while
keeping its selections; desktop retains its single Generate prompt action. This summary
starts collapsed as a horizontally scrollable single row; a shared 28px ellipsis toggle expands
it into a wrapped list without a height cap or its own vertical scrollbar. It disappears when no filters restrict
results. Filter and builder collapse controls are 28px squares; collapsed option
summaries use orange text, including All and None selected. The builder output scroll area
uses 20px 20px 0 padding and no gap.

Design prompts include canonical format and style instructions from
`reference/design/`, preserve Subject and typography text, and save their design
type for reconstruction after reload. Complexity labels range from Very Low to
Very High (매우 낮음–매우 높음); Korean option names omit redundant suffixes.
On mobile, the results chip row scrolls horizontally without wrapping, the filter
animates closed before opening the builder, and desktop editable fields use 13px text (search and generated prompts retain
their own sizes). General input and textarea text is 13px on desktop and mobile; prompt textarea
text stays 11px, with mobile search independently using 16px. Button
hover backgrounds are limited to desktop pointer devices. The larger logo and bounded, content-width copy toast also fit
320px screens.

Save-dialog fields use separate, explicitly associated labels and controls, with
headings matching Selected. Read-only selected values in save dialogs and saved
style sets, and image-detail tags, share `option-tags`: orange 12px text with a
literal # prefix, no chip border/background, and natural wrapping. Editable
builder/filter chips keep their removal controls.

Save prompt pre-fills the editable name from Subject when the save dialog opens,
trimming surrounding whitespace and respecting its 80-character limit. Editing
the title does not change Subject; an empty Subject leaves the name empty. The
shared prompt action row has no top margin. Detail actions use 20px padding on all sides on desktop and mobile. Common control and state classes
remain composed; unused marker classes and the old collapsed-row drag code were
removed.

Gallery placeholders currently have type, style/technique, and dimension metadata.
They do not have inferred color, texture, typography, outline, or complexity tags;
filtering by missing metadata produces no matches. Saved style sets use their
stored options, ratio, and complexity. Preview and main share browser storage.
The sections below describe the original main UI where behavior differs.

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

The gallery includes the left filter panel (no top navigation or style tabs), gallery search, local bookmarks, responsive Builder and detail panels (full-screen dialogs on mobile), self-contained copyable prompts, and image preview. All displays a continuous masonry layout with a total count; style tabs filter it. Masonry uses fixed small columns (approximately 152px on desktop, three columns on mobile), preserving aspect ratios. The small/large icon controls immediately after All switch desktop column targets between 152px and 304px and mobile layouts between two columns and one column. Current placeholders use varied sample dimensions, with no generated images. The header scrolls out of view while navigation stays sticky. Illustration and Photo retain independent selections, and hidden illustration options never enter Photo prompts. Publish stays disabled until real assets and a safe, authorized publishing workflow are connected. Public reading does not authorize repository writes. No upload or simulated CDN approval occurs.

## Structure

- `reference/{style}/prompt.md`: independent style instructions.
- `reference/options/{category}/{id}/prompt.md`: independent option instructions.
- `src/components/promptbuilder/`: Builder controls.
- `src/utils/promptBuilder.ts`: selection and prompt-reference logic.
- `vite.config.ts`: reads title/category/ID/path metadata and canonical Markdown prompt text from existing files. Selected prompt bodies are included in generated/copyable prompts so they work without file access. Images are not bundled; reference files remain the single source.

Bookmarks are stored in this browser only. Placeholder details describe the placeholder's style rather than pretending that a generated image has creation settings. Both `image-studio` and `image-assets` are intended to be Public. Files committed to either repository and their Git history are publicly readable, even before CDN approval. Publish means approved copying to `image-assets`, not making a private image public.

Deploy the static site with GitHub Pages; Cloudflare Pages/Workers are not used. Public assets and prompts can be read without a token. Never put GitHub credentials in frontend code, browser storage, or build output. Publishing requires repository write permission: use authenticated Codex Git operations or a manually dispatched GitHub workflow until safe browser-triggered publishing is implemented. The `.github/workflows/pages.yml` workflow deploys `main` to GitHub Pages after tests and build. In repository Settings → Pages, select GitHub Actions as the source. The site URL is https://unicome82.github.io/image-studio/. Live image data loading is not yet configured. Keep any Pages/Actions usage within free allowances; do not enable paid features without approval. See `IMAGE-STUDIO.md` and `PROMPT-BUILDER.md` for their requirements.

## Saved style sets

Use Save in Builder to save current settings, or Save in image detail to save the selected item’s style and aspect ratio. Current placeholders have no generated-image metadata, so detail saving uses only the displayed style and dimensions with default complexity. Save opens a centered modal with a Style name input, the exact prompt preview, Cancel, and Save. Cancel/Escape dismiss it without saving; on mobile it opens above the full-screen Builder or detail panel. The list icon next to bookmarks switches the main content to the saved-prompts page, with one, two, or at most three columns based on available width. Each transparent, bordered card has an edit icon beside its name, the complete reconstructed prompt in a read-only textarea styled like Builder, and background-free, border-free Copy and Delete icon buttons at the upper right. Delete replaces the Copy and Delete controls with Cancel and Delete confirmation buttons in the same area. There is no Load action; copying does not change Builder settings. Clipboard failures offer the same saved prompt for manual copying. It does not open a popup. Bookmark and saved-prompt views are mutually exclusive. Sets contain the image type, option IDs, complexity, and custom fields, not duplicated prompt bodies. They are stored in this browser’s LocalStorage and do not sync across devices. Clearing browser data removes them. Builder initially shows the Selected tab with removable selected-option chips, fixed aspect-ratio/complexity chips, and Generate prompt. Selected and Prompt act as tabs with black active text; generation switches to Prompt and uppercase Save/Copy actions. Changing any option, custom field, complexity, or image type returns to Selected. Aspect ratio has no collapse control. Chips summarize active catalog choices and their X controls remove the corresponding category/ID, including a selected Rendering Mode. Builder has Save on the left and Copy on the right; image detail has Save on the left and Publish on the right. Ordinary input textareas have a white background. Generated prompt textareas use the `prompt-textarea` class for a neutral gray background. Both have 1.3 line height, generous vertical padding, and disabled resizing. Detail prompt text is a plain paragraph without a box or fixed height. Focus outlines are hidden. Only Copy and Publish text buttons have leading icons; icon-only controls retain their symbols; Publish uses a CDN upload icon. Builder has no contrasting background, and its footer has a top divider.

## Compact Builder

The filter panel starts at 280px wide on desktop. Drag its right edge between 280px and 600px, or focus the separator and use arrow keys, Home, and End. Builder always opens as a full-screen dialog without width resizing. The navigation Builder icon button matches the Illustration/Photo toggle height (28px on desktop and mobile). Option separators are removed. Collapsed options show all choices in a single horizontally scrollable row with a hidden scrollbar, mouse-wheel horizontal movement, mouse dragging without accidental selection, and native left/right touch swipes. A chevron on the right of each heading switches to the wrapped full list. No options are removed or measured to fit. Material Symbols expand_more and expand_less indicate expansion state, while Typography continues to use only its own switch. Option buttons use compact padding, and Builder option titles use regular gray text. Selected options lead only in multi-select categories; single-select Rendering Mode and Aspect Ratio retain their original order. A fourth option leaves all three selections intact and shows a limit toast. Builder buttons use 11px regular text in their original case, a 4px radius, and 4px spacing; expand/collapse controls are 24px squares. Builder section titles retain their compact styling. Buttons use uppercase labels; redundant Illustration suffixes are omitted from style choices and filters. Internal scrollbars are 6px wide with 8px rounded thumbs, using black at 0.1 opacity and 0.4 when their area is hovered. Document scrollbars are black regardless of hover. Outline is directly above the separate Aspect ratio option; Your direction is one textarea. Older saved Subject/Negative Prompt fields are preserved as labeled lines in that textarea; saved Text is kept in the separate optional Typography input. Typography defaults OFF. Its compact switch sits directly beside the title. Turn on its title-side switch to show the text input directly beneath its heading, followed by all typography choices. Single-line inputs, including typography, saved-set renaming, and the Save dialog, share a 28px height; the header search area and header icon buttons are 32px. Option buttons remain 24px tall. Typography uses no expand/collapse button; OFF hides its input and choices. If enabled with no text, the generated instruction asks the AI to choose suitable wording freely. OFF omits the text and typography options. The switch and text persist in saved style sets. Complexity uses five fixed-order, single-select option buttons and names only in the UI and copied prompt. Numeric levels remain internal for saved-set compatibility.

## Image preview and fonts

Preview is a centered, aspect-preserving fit on a black 70% backdrop with 8px background blur shared with all dialogs with only the visual and an upper-right close button. Scroll or pinch to zoom between 1× and 4×. Double-click or press 0 to reset; +/− and arrow keys also zoom. Click outside, press Escape, or use X to close. On mobile the detail panel remains open underneath. Placeholders remain solid colors; no image generation occurs. The original English image name and its copy icon appear above the detail image; the name uses 18px and weight 500. Hashtags appear below the image as badges. The image preview preserves its aspect ratio with a maximum height of 320px or 40dvh, whichever is smaller. Image names use the exact `fileName` when supplied, without translation; current placeholder samples keep their original English label and sequence number. Favorites use shared top-right heart buttons on thumbnails and detail images, with 24px filled hearts that are black at 0.2 opacity by default and red when selected and transparent button backgrounds in all states. Clicking anywhere on the detail image opens the preview; toggling its heart does not open the preview. Clicking the logo returns to the default Illustration gallery and clears active filters.

The logo is IMAGE STUDIO at 16px with font weight 900. Header and navigation horizontal padding match the Builder content at 20px, with a border between the header and navigation. Textarea padding is 8px. Illustration/Photo switching preserves the scroll position. Placeholders use a light shared color. Fixed SCSS lengths of at least 4px use multiples of 4px except font sizes, 6px internal scrollbars, and the 14px Typography switch. General positive corner radii are at least 8px and multiples of 4px; only the navigation Builder and Illustration/Photo toggles have rounded corners, while style filters stay square. Builder option buttons and text fields use 4px, and the Typography switch is a fully rounded 20px-wide, 12px-high control with 2px padding. Material Symbols use even pixel sizes with automatic optical sizing, standard font-size/font-weight properties, and no symbol-specific CSS variables; Builder expand/collapse icons are 16px. Text uses normal letter spacing, with 0.05em only for uppercase labels. Preview mouse or single-finger drags do not zoom, and its larger 40px close symbol uses a thin weight with no button background. All text, including prompt fields, uses Pretendard loaded from the version-pinned jsDelivr CDN (v1.3.9), with a sans-serif fallback.

## Source and style conventions

See `AGENTS.md` for the repository’s coding instructions. All SCSS lives in `src/styles/`: `_variable.scss` for tokens, `_mixin.scss` for reusable patterns, `_reset.scss` for element resets and base/mobile defaults, `common.scss` for shared controls and UI, `layout.scss` for page layout, and `style.scss` as the single entry imported by `main.tsx`. The entry uses reset and forwards common/layout; only variable, mixin, and reset are `@use` dependencies. Use nested selectors, `&` states, and media queries inside the owning selector instead of component-specific files or repeated flat selectors.

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

Gallery thumbnail-size controls sit to the right of each gallery heading, with outlined icons and a filled active icon. Gallery keeps a viewport-based minimum height so the copyright stays at the bottom even with no results; empty views use text with contextual guidance. Builder headings and footers use sticky positioning on desktop and mobile. Builder scroll areas have 20px padding; their inner wrappers and selected-option lists have no padding. Desktop header action buttons are 36px with unchanged icons; style-set rename buttons use 12px text on all screen sizes. Textareas use their standard padding without expand/collapse controls.

Builder output content has 20px bottom spacing. Textarea scrollbars appear only on hover with stable space reserved.

Favorites and saved style sets are independent collection views: navigation and Builder are hidden, while returning to the gallery restores its filter and Builder state. Favorites combine illustration and photo bookmarks regardless of the gallery filter. Each collection has its own sort menu (recently saved, oldest saved, name ascending, name descending); sorting never rewrites storage order. Preset cards show read-only Selected chips above their reconstructed prompt.
