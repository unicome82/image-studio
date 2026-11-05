# PROMPT BUILDER — IMAGE STUDIO 부가 기능

## 1. 목표

IMAGE STUDIO의 **부가 메뉴**로 스타일 조합용 영문 지시문을 생성한다. 이미지 갤러리가 메인 화면이다.

- AI API·데이터베이스 불필요
- 기존 React + TypeScript + SCSS 및 디자인 시스템 재사용
- 스타일별 상세 지침은 `reference/{style}/prompt.md` **한 곳에서만 관리**
- Builder는 스타일 **이름/ID와 옵션**만 조합하며 상세 프롬프트를 복제하지 않음
- 결과 지시문을 받은 Codex/Claude Code가 해당 `prompt.md`를 읽어 이미지 생성에 활용

## 2. 선택 라이브러리

각 항목은 영문 표시명과 고유 ID를 가진다. 기존 Reference 스타일 ID는 폴더명과 일치시킨다.

- **Base Style (30):** [Bauhaus](reference/bauhaus/prompt.md), [Art Deco](reference/artdeco/prompt.md), [Art Nouveau](reference/artnouveau/prompt.md), [Cubism](reference/cubism/prompt.md), [Surrealism](reference/surrealism/prompt.md), [Fauvism](reference/fauvism/prompt.md), [Expressionism](reference/expressionism/prompt.md), [Impressionism](reference/impressionism/prompt.md), [Constructivism](reference/constructivism/prompt.md), [Suprematism](reference/suprematism/prompt.md), [Dadaism](reference/dadaism/prompt.md), [Pop Art](reference/popart/prompt.md), [Naive Folk Art](reference/naivefolk/prompt.md), [Childlike Illustration](reference/childlikeillustration/prompt.md), [Editorial Illustration](reference/editorialillustration/prompt.md), [Botanical Illustration](reference/botanicalillustration/prompt.md), [Geometric Illustration](reference/geometricillustration/prompt.md), [Paper Cutout](reference/papercutout/prompt.md), [Storybook Illustration](reference/storybookillustration/prompt.md), [Mid-century Modern](reference/midcentury/prompt.md), [Swiss Graphic Design](reference/swissgraphicdesign/prompt.md), [Memphis Design](reference/memphisdesign/prompt.md), [Brutalism](reference/brutalism/prompt.md), [Minimalism](reference/minimalism/prompt.md), [Maximalism](reference/maximalism/prompt.md), [Psychedelic Art](reference/psychedelicart/prompt.md), [Optical Art](reference/opticalart/prompt.md), [Grunge](reference/grunge/prompt.md), [Y2K](reference/y2k/prompt.md), [Retro Graphic Design](reference/retrographicdesign/prompt.md).
- **Technique (15):** [Flat Color](reference/options/technique/flatcolor/prompt.md), [Hand-drawn](reference/options/technique/handdrawn/prompt.md), [Watercolor](reference/options/technique/watercolor/prompt.md), [Gouache](reference/options/technique/gouache/prompt.md), [Oil Painting](reference/options/technique/oilpainting/prompt.md), [Pencil Drawing](reference/options/technique/pencildrawing/prompt.md), [Charcoal](reference/options/technique/charcoal/prompt.md), [Ink Wash](reference/options/technique/inkwash/prompt.md), [Risograph](reference/options/technique/risograph/prompt.md), [Screen Printing](reference/options/technique/screenprinting/prompt.md), [Linocut](reference/options/technique/linocut/prompt.md), [Woodcut](reference/options/technique/woodcut/prompt.md), [Halftone Printing](reference/options/technique/halftoneprinting/prompt.md), [Collage](reference/options/technique/collage/prompt.md), [Paper Craft](reference/options/technique/papercraft/prompt.md).
- **Typography (15):** [Swiss Typography](reference/options/typography/swisstypography/prompt.md), [Editorial Typography](reference/options/typography/editorialtypography/prompt.md), [Brutalist Typography](reference/options/typography/brutalisttypography/prompt.md), [Experimental Typography](reference/options/typography/experimentaltypography/prompt.md), [Kinetic Typography](reference/options/typography/kinetictypography/prompt.md), [Psychedelic Lettering](reference/options/typography/psychedeliclettering/prompt.md), [Bubble Lettering](reference/options/typography/bubblelettering/prompt.md), [Groovy Typography](reference/options/typography/groovy/prompt.md), [Blackletter](reference/options/typography/blackletter/prompt.md), [Calligraphy](reference/options/typography/calligraphy/prompt.md), [Hand Lettering](reference/options/typography/handlettering/prompt.md), [Childlike Handwriting](reference/options/typography/childlikehandwriting/prompt.md), [Distorted Typography](reference/options/typography/distortedtypography/prompt.md), [Chrome Typography](reference/options/typography/chrometypography/prompt.md), [Modular Typography](reference/options/typography/modulartypography/prompt.md).
- **Rendering Mode (3, 단일 선택):** [Color Only](reference/options/outline/coloronly/prompt.md) (`coloronly`), [Color + Outline](reference/options/outline/coloroutline/prompt.md) (`coloroutline`), [Outline Only](reference/options/outline/outlineonly/prompt.md) (`outlineonly`).
- **Color (12):** [Monochrome](reference/options/color/monochrome/prompt.md), [Duotone](reference/options/color/duotone/prompt.md), [Primary Colors](reference/options/color/primarycolors/prompt.md), [Pastel](reference/options/color/pastel/prompt.md), [Vivid](reference/options/color/vivid/prompt.md), [Muted](reference/options/color/muted/prompt.md), [Earthy](reference/options/color/earthy/prompt.md), [Mid-century Palette](reference/options/color/midcenturypalette/prompt.md), [Neon](reference/options/color/neon/prompt.md), [Warm](reference/options/color/warm/prompt.md), [Cool](reference/options/color/cool/prompt.md), [Complementary](reference/options/color/complementary/prompt.md).
- **Texture (10):** [Clean](reference/options/texture/clean/prompt.md), [Paper Grain](reference/options/texture/papergrain/prompt.md), [Film Grain](reference/options/texture/filmgrain/prompt.md), [Ink Bleed](reference/options/texture/inkbleed/prompt.md), [Rough Print](reference/options/texture/roughprint/prompt.md), [Distressed](reference/options/texture/distressed/prompt.md), [Canvas](reference/options/texture/canvas/prompt.md), [Brushstroke](reference/options/texture/brushstroke/prompt.md), [Digital Noise](reference/options/texture/digitalnoise/prompt.md), [Emboss](reference/options/texture/emboss/prompt.md).
- **Composition (10):** [Minimal](reference/options/composition/minimal/prompt.md), [Centered](reference/options/composition/centered/prompt.md), [Asymmetric](reference/options/composition/asymmetric/prompt.md), [Symmetric](reference/options/composition/symmetric/prompt.md), [Grid](reference/options/composition/grid/prompt.md), [Full Bleed](reference/options/composition/fullbleed/prompt.md), [Editorial](reference/options/composition/editorial/prompt.md), [Diagonal](reference/options/composition/diagonal/prompt.md), [Layered](reference/options/composition/layered/prompt.md), [Dynamic](reference/options/composition/dynamic/prompt.md).
- **Photography (10):** [Film](reference/options/photography/film/prompt.md), [Analog](reference/options/photography/analog/prompt.md), [Cinematic](reference/options/photography/cinematic/prompt.md), [Editorial](reference/options/photography/editorial/prompt.md), [Documentary](reference/options/photography/documentary/prompt.md), [Street](reference/options/photography/street/prompt.md), [Fine Art](reference/options/photography/fineart/prompt.md), [Still Life](reference/options/photography/stilllife/prompt.md), [Architectural](reference/options/photography/architectural/prompt.md), [Monochrome](reference/options/photography/monochrome/prompt.md).

선택 목록은 간단한 메타데이터로 관리하고, `reference/`에 없는 스타일의 상세 프롬프트를 임의로 생성하거나 존재한다고 가정하지 않는다. `prompt.md`가 있는 항목만 파일 참조 대상으로 지정한다.

## 3. 기능

1. **Multi Select:** 스타일 카테고리별 최대 3개, Base Style 기본 1개 선택; Rendering Mode는 별도 단일 선택
2. **Live Prompt:** 선택 즉시 영문 지시문 갱신
3. **Conflict Prevention:** 색상·구도 등 명백한 충돌만 최근 선택 우선으로 자동 해제; 스타일 혼합은 허용
4. **Reference Preview:** 기존 `reference/` 이미지 1~3장 미리보기·확대, 이미지 없으면 텍스트 표시
5. **Custom Input:** Subject, Text, Aspect Ratio(1:1/4:3/3:4/16:9/9:16), Additional Instructions, Negative Prompt
6. **Copy Prompt:** 영문 지시문 복사
7. **Save Preset:** 이름·선택값·복잡도·입력값 저장/불러오기/수정/삭제; LocalStorage 사용(기기 간 동기화 없음)
8. **Complexity Control:** 전체 이미지 복잡도 5단계 슬라이더, 기본 3
9. **Rendering Mode:** 컬러만 / 컬러 + 윤곽선 / 윤곽선만 중 하나 선택, 기본값 Color Only. 프리셋 저장·불러오기에 포함하며 기존 프리셋에 값이 없으면 기본값 적용.

### Rendering Mode

| ID | 표시명 | 프롬프트 |
|---|---|---|
| `coloronly` | Color Only | [prompt.md](reference/options/outline/coloronly/prompt.md) |
| `coloroutline` | Color + Outline | [prompt.md](reference/options/outline/coloroutline/prompt.md) |
| `outlineonly` | Outline Only | [prompt.md](reference/options/outline/outlineonly/prompt.md) |

Color는 팔레트를, Rendering Mode는 채움과 윤곽선의 표현 방식을 정한다. Outline Only에서는 선택한 팔레트를 선 색상에만 적용한다. 배경·투명도는 별도 지시를 따르며 이 옵션으로 바꾸지 않는다.

## 4. Complexity

| 값 | 이름 | 프롬프트 |
|---|---|---|
| 1 | Very Simple | [prompt.md](reference/options/complexity/verysimple/prompt.md) |
| 2 | Simple | [prompt.md](reference/options/complexity/simple/prompt.md) |
| 3 | Balanced | [prompt.md](reference/options/complexity/balanced/prompt.md) |
| 4 | Detailed | [prompt.md](reference/options/complexity/detailed/prompt.md) |
| 5 | Intricate | [prompt.md](reference/options/complexity/intricate/prompt.md) |

스타일 특징과 사용자가 고른 색상 옵션을 우선한다. 사진은 배경·피사체·구도 밀도 중심으로 조절한다.

## 5. 생성 규칙

- `Subject → Base Style → Technique → Typography → Rendering Mode → Color → Texture → Composition → Photography → Complexity → Aspect Ratio → Additional Instructions → Negative Prompt` 순서
- 선택하지 않은 항목은 생략, Subject·Text는 사용자 입력 그대로 유지
- Typography는 Text 입력이 있을 때만 적용
- Rendering Mode의 표시명과 선택한 실제 프롬프트 경로를 출력한다. 채움·윤곽선에 관한 스타일·기법·질감 지침과 충돌하면 Rendering Mode를 우선하고, 나머지 스타일 특징은 유지한다. 사진 스타일을 선택해도 같은 표현 규칙을 적용한다.
- Base Style은 `reference/{id}/prompt.md`, 옵션은 `reference/options/{category}/{id}/prompt.md`에 연결한다. Rendering Mode의 경로 카테고리는 `outline`이다. Complexity는 1~5를 위 표의 파일에 연결한다.
- 위 선택 목록의 링크가 Builder ID와 실제 파일의 매핑이다. ID·표시명은 각 파일의 Category·Style ID·제목에서 읽으며 별도 목록이나 상세 설명 데이터를 복제하지 않는다. 동일 ID가 다른 카테고리에 있으면 카테고리와 ID를 함께 식별자로 사용한다.
- **실제로 존재하는 파일만** 선택한 항목의 경로로 출력하고 해당 파일을 읽도록 지시한다. Typography는 Text가 있을 때, Photography는 사진 기반 결과를 요청할 때만 포함한다.
- 파일이 없는 옵션은 표시명만 전달
- 스타일 상세 설명·Mix Prompt를 별도 데이터로 중복 관리하지 않음

**출력 예시**

```text
Read only the selected prompt files listed below. Do not assume missing files exist.

reference/naivefolk/prompt.md
reference/midcentury/prompt.md
reference/options/technique/risograph/prompt.md
reference/options/typography/groovy/prompt.md
reference/options/outline/coloronly/prompt.md
reference/options/color/muted/prompt.md
reference/options/texture/papergrain/prompt.md
reference/options/composition/asymmetric/prompt.md
reference/options/complexity/verysimple/prompt.md

Base Style: naivefolk, midcentury
Technique: risograph
Typography: groovy
Rendering Mode: Color Only
Color: muted
Texture: papergrain
Composition: asymmetric
Complexity: 1 (Very Simple)
Subject: A woman holding a flower
Text: FLOWER
Aspect Ratio: 3:4

Combine the selected prompt file instructions while preserving their defining characteristics. Generate an image based on these settings.
```

이 출력은 **파일 접근 권한이 있는 AI 코딩 도구용 지시문**이다. 일반 이미지 생성 서비스에서 Private GitHub의 `.md`를 자동으로 읽는다고 가정하지 않는다.

## 6. 연동 및 UI

- 기존 IMAGE STUDIO 메뉴에 `Prompt Builder` 추가; Gallery는 기본 화면 유지
- 스타일 선택·레퍼런스 미리보기·표현 방식 단일 선택·복잡도·입력·결과·복사·저장 UI 제공
- 카테고리 접기/펼치기, 선택 상태 표시, 반응형 구성
- `reference/`의 기존 이미지·프롬프트와 인증 API 재사용
- 필요한 컴포넌트는 `src/components/promptbuilder/`, 생성 로직은 `src/utils/promptBuilder.ts`에 배치하되 기존 구조에 맞게 조정
- GitHub API·인증·Publish·이미지 최적화 중복 구현 금지

## 7. 구현 순서

1. **Step 1 — Data:** Reference 연동, 선택 목록, 공통 옵션·충돌 규칙
2. **Step 2 — UI:** 스타일 선택, 레퍼런스, 입력, 슬라이더
3. **Step 3 — Generator:** 실시간 조합, 충돌 처리, 복사
4. **Step 4 — Preset:** 저장·불러오기·수정·삭제
5. **Step 5 — Integration:** 기존 IMAGE STUDIO에 연결

`IMAGE-STUDIO.md`를 먼저 읽고 현재 프로젝트 구조를 확인한다. **우선 Step 1만 진행**하고 나머지는 요청 시 실행한다. 불필요한 파일·기능을 추가하지 않는다.
