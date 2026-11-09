# PROMPT BUILDER — IMAGE STUDIO 부가 기능

## 1. 목표

IMAGE STUDIO의 **부가 메뉴**로 **갤러리 시안** 영문 프롬프트를 만든다: 정한 스타일의 이미지 9–12장이 걸린 헤더와 갤러리만 있는 미니멀 갤러리 사이트 시안 한 장. 이미지 갤러리가 메인 화면이며, 개별 이미지는 Claude Code로 직접 등록한다.

- AI API·데이터베이스 불필요
- 기존 React + TypeScript + SCSS 및 디자인 시스템 재사용
- 옵션 ID·카테고리·표시명·Cue는 `reference/**/prompt.md` **한 곳에서만 관리**

## 2. 선택 라이브러리

각 항목은 영문 표시명과 고유 ID를 가진다. 빌더는 유형별로 아래 카테고리만 사용한다: 일러스트 Style·Color·Rendering Mode, 사진 Photo Style·Color, 디자인 Format·Style·Color. 모든 유형에 Depiction을 둔다. Texture는 갤러리 이미지의 필터·상세 프롬프트에만 쓴다.

- **Illustration Style (26):** [Art Deco](reference/artdeco/prompt.md), [Bauhaus](reference/bauhaus/prompt.md), [Botanical Illustration](reference/botanicalillustration/prompt.md), [Brutalism](reference/brutalism/prompt.md), [Childlike Illustration](reference/childlikeillustration/prompt.md), [Contemporary Flat Illustration](reference/contemporaryflat/prompt.md), [Continuous Line](reference/continuousline/prompt.md), [Editorial Illustration](reference/editorialillustration/prompt.md), [Expressionism](reference/expressionism/prompt.md), [Geometric Illustration](reference/geometricillustration/prompt.md), [Grunge](reference/grunge/prompt.md), [Impressionism](reference/impressionism/prompt.md), [Isometric Illustration](reference/isometric/prompt.md), [Low Poly](reference/lowpoly/prompt.md), [Maximalism](reference/maximalism/prompt.md), [Memphis Design](reference/memphisdesign/prompt.md), [Mid-century Modern](reference/midcentury/prompt.md), [Minimalism](reference/minimalism/prompt.md), [Naive Folk Art](reference/naivefolk/prompt.md), [Paper Cutout](reference/papercutout/prompt.md), [Pixel Art](reference/pixelart/prompt.md), [Pop Art](reference/popart/prompt.md), [Psychedelic Art](reference/psychedelicart/prompt.md), [Risograph](reference/risograph/prompt.md), [Surrealism](reference/surrealism/prompt.md), [Y2K](reference/y2k/prompt.md).
- **Photo Style (12):** [Architectural](reference/options/photography/architectural/prompt.md), [Cinematic](reference/options/photography/cinematic/prompt.md), [Documentary](reference/options/photography/documentary/prompt.md), [Editorial](reference/options/photography/editorial/prompt.md), [Fashion](reference/options/photography/fashion/prompt.md), [Fine Art](reference/options/photography/fineart/prompt.md), [Food](reference/options/photography/food/prompt.md), [Landscape](reference/options/photography/landscape/prompt.md), [Portrait](reference/options/photography/portrait/prompt.md), [Product](reference/options/photography/product/prompt.md), [Still Life](reference/options/photography/stilllife/prompt.md), [Street](reference/options/photography/street/prompt.md).
- **Design Format (13):** [App Screen](reference/design/format/appscreen/prompt.md), [Character](reference/design/format/character/prompt.md), [Emblem](reference/design/format/emblem/prompt.md), [Greeting Card](reference/design/format/greetingcard/prompt.md), [Icon Set](reference/design/format/iconset/prompt.md), [Infographic](reference/design/format/infographic/prompt.md), [Logo](reference/design/format/logo/prompt.md), [Packaging](reference/design/format/packaging/prompt.md), [Pattern](reference/design/format/pattern/prompt.md), [Poster](reference/design/format/poster/prompt.md), [Product](reference/design/format/product/prompt.md), [Signage](reference/design/format/signage/prompt.md), [Website](reference/design/format/website/prompt.md).
- **Design Style (8):** [Bauhaus](reference/design/style/bauhaus/prompt.md), [Bold Geometric](reference/design/style/boldgeometric/prompt.md), [Brutalism](reference/design/style/brutalist/prompt.md), [Gradient & Glass](reference/design/style/gradientglass/prompt.md), [Memphis Design](reference/design/style/memphis/prompt.md), [Minimalism](reference/design/style/minimalist/prompt.md), [Retro Graphic Design](reference/design/style/retro/prompt.md), [Swiss Graphic Design](reference/design/style/swiss/prompt.md).
- **Color (17):** [Analogous](reference/options/color/analogous/prompt.md), [Black & White](reference/options/color/blackwhite/prompt.md), [Complementary](reference/options/color/complementary/prompt.md), [Cool](reference/options/color/cool/prompt.md), [Duotone](reference/options/color/duotone/prompt.md), [Earthy](reference/options/color/earthy/prompt.md), [High Key](reference/options/color/highkey/prompt.md), [Iridescent](reference/options/color/iridescent/prompt.md), [Low Key](reference/options/color/lowkey/prompt.md), [Monochrome](reference/options/color/monochrome/prompt.md), [Muted](reference/options/color/muted/prompt.md), [Neon](reference/options/color/neon/prompt.md), [Neutral + Accent](reference/options/color/neutralaccent/prompt.md), [Pastel](reference/options/color/pastel/prompt.md), [Primary Colors](reference/options/color/primarycolors/prompt.md), [Vivid](reference/options/color/vivid/prompt.md), [Warm](reference/options/color/warm/prompt.md).
- **Texture (10):** [Brushstroke](reference/options/texture/brushstroke/prompt.md), [Canvas](reference/options/texture/canvas/prompt.md), [Clean](reference/options/texture/clean/prompt.md), [Digital Noise](reference/options/texture/digitalnoise/prompt.md), [Emboss](reference/options/texture/emboss/prompt.md), [Film Grain](reference/options/texture/filmgrain/prompt.md), [Frosted Glass](reference/options/texture/frostedglass/prompt.md), [Glossy](reference/options/texture/glossy/prompt.md), [Paper Grain](reference/options/texture/papergrain/prompt.md), [Soft Matte](reference/options/texture/softmatte/prompt.md).
- **Rendering Mode (Outline, 일러스트 전용·필수) (3):** [Color Only](reference/options/outline/coloronly/prompt.md), [Color + Outline](reference/options/outline/coloroutline/prompt.md), [Outline Only](reference/options/outline/outlineonly/prompt.md).

- **Depiction (5, 필수·기본 Simple):** Very Simple(`verysimple`), Simple(`simple`), Moderately Complex(`balanced`), Complex(`complex`), Very Complex(`verycomplex`). 화면 표시명(모든 언어 동일)과 Cue(소문자)가 같고, Cue가 시안 문장에 그대로 들어간다.

Technique·Camera·Mood·Lighting·Composition·Typography 카테고리는 사용하지 않는다. Color·Rendering Mode는 기본 미선택이다. 빌더 순서는 대표 스타일 → 대상 → Depiction → Color → Rendering Mode이다.

## 3. 기능

1. **Single Select:** 모든 카테고리는 단일 선택이다. Design Format·Depiction은 항상 하나를 유지하고 나머지는 다시 누르면 해제된다.
2. **Live Prompt:** 선택 즉시 갤러리 시안 프롬프트를 갱신한다.
3. **입력:** 시안에는 무엇을 그릴지 적는 대상(한 컷에 모두 담기지 않도록 넓은 주제를 or로 나열, 예: city or garden, 비우면 subject)과 묘사 정도만 쓴다. 각 이미지 설명이나 이미지 번호는 받지 않는다.
4. **시안 저장함:** 유형·선택 옵션·묘사 정도·대상을 LocalStorage에 저장하고, 카드에는 대표 스타일 이름·선택 태그·갤러리 시안 프롬프트를 표시한다. 수정·삭제·복사를 제공한다.

## 4. 생성 규칙

- 모든 원본 MD는 Style ID 아래에 `- **Cue:** …` 한 줄을 둔다. 15단어 이내 긍정문으로 해당 카테고리 범위의 결정적 규칙·수치만 쓴다. 시안 프롬프트에는 표시명만, 갤러리 상세 프롬프트에는 `카테고리: 표시명 — Cue`를 출력하고 나머지 본문은 보관만 한다. Depiction Cue는 시안 문장의 묘사 정도 구절로 쓴다. Outline은 `Rendering Mode`로 표기한다.
- 옵션 순서는 대표 스타일 → Color → Rendering Mode(상세 프롬프트는 이어서 Texture)이다. 선택하지 않은 항목과 현재 유형에서 숨겨진 항목은 제외한다.
- **갤러리 시안:**
  ```text
  Design a mockup of a minimal {gallery | photography portfolio | design studio portfolio} website: white background, only a simple header and a masonry gallery of 9 to 12 images in mixed aspect ratios.

  All images share one style: {대표 스타일 | Design Style + Design Format}
  Mood: modern and chic, refined and grown-up
  Color: {표시명}, with different colors for each image
  (Black & White) Color: Black & White, with a different grayscale tone for each image
  (Monochrome) Color: Monochrome, with a different hue for each image
  (Color 미선택) Color: different colors for each image
  {Rendering Mode: 표시명 — 선택한 경우만}
  Each image shows a different {Depiction Cue} take on the subject: {대상}
  (대상이 비면) Each image shows a different {Depiction Cue} subject.
  ```
  Texture·비율은 넣지 않는다. 대표 스타일이 없으면 `All images share one consistent style.`로 쓴다.
- **갤러리 상세 (단독 사용):** `Create a standalone {…} of "{Subject}".`, 옵션 줄, `Aspect Ratio: {비율}` 순서다.
- 입력·Subject는 원문 그대로 유지한다. 피할 대상을 나열하는 부정문, 완성도 강조 문구, 파일 읽기 지시·경로는 출력하지 않는다.
- 저장소에는 선택 ID·입력값만 저장하고 프롬프트 본문을 복제하지 않는다.
- 삭제한 ID는 저장된 시안을 불러올 때 흡수한 옵션으로 바꾼다: Jewel Tones→Vivid(Color), Constructivism→Bauhaus, Suprematism·Cubism·Optical Art·Swiss Graphic Design(일러스트)→Geometric Illustration, Dadaism→Surrealism, Fauvism→Expressionism, Art Nouveau→Art Deco, Retro Graphic Design(일러스트)→Mid-century Modern, Cel-shaded Anime→Contemporary Flat Illustration, Storybook Illustration→Naive Folk Art, Technique Risograph·Linocut·Woodcut·Screen Printing·Halftone Printing→Illustration Style Risograph, Vintage Faded·Mid-century Palette→Muted, 사진 Film·Analog→Texture Film Grain + Color Muted, 사진 Monochrome→Color Black & White, Rough Print·Distressed·Ink Bleed→Paper Grain. 변환 값은 비어 있는 카테고리에만 채우고, 제공하지 않는 카테고리는 지운다.

## 5. 연동 및 UI

- 기존 IMAGE STUDIO에 플로팅 버튼·필터의 Generate prompt 버튼으로 여는 전체화면 Builder를 둔다. Gallery는 기본 화면을 유지한다.
- 필요한 컴포넌트는 `src/components/promptbuilder/`, 생성 로직은 `src/utils/promptBuilder.ts`에 둔다.
- GitHub 조회·쓰기 권한 처리·Publish·이미지 최적화 중복 구현 금지; 브라우저에 GitHub 토큰을 저장하지 않는다.
