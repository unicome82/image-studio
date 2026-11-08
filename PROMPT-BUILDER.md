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

- **Illustration Style (27):** [Bauhaus](reference/bauhaus/prompt.md), [Art Deco](reference/artdeco/prompt.md), [Surrealism](reference/surrealism/prompt.md), [Expressionism](reference/expressionism/prompt.md), [Impressionism](reference/impressionism/prompt.md), [Pop Art](reference/popart/prompt.md), [Naive Folk Art](reference/naivefolk/prompt.md), [Childlike Illustration](reference/childlikeillustration/prompt.md), [Editorial Illustration](reference/editorialillustration/prompt.md), [Botanical Illustration](reference/botanicalillustration/prompt.md), [Geometric Illustration](reference/geometricillustration/prompt.md), [Paper Cutout](reference/papercutout/prompt.md), [Storybook Illustration](reference/storybookillustration/prompt.md), [Mid-century Modern](reference/midcentury/prompt.md), [Memphis Design](reference/memphisdesign/prompt.md), [Brutalism](reference/brutalism/prompt.md), [Minimalism](reference/minimalism/prompt.md), [Maximalism](reference/maximalism/prompt.md), [Psychedelic Art](reference/psychedelicart/prompt.md), [Grunge](reference/grunge/prompt.md), [Y2K](reference/y2k/prompt.md), [Contemporary Flat Illustration](reference/contemporaryflat/prompt.md), [Isometric Illustration](reference/isometric/prompt.md), [Continuous Line](reference/continuousline/prompt.md), [Low Poly](reference/lowpoly/prompt.md), [Pixel Art](reference/pixelart/prompt.md), [Cel-shaded Anime](reference/celshadedanime/prompt.md).
- **Technique (16):** [Flat Color](reference/options/technique/flatcolor/prompt.md), [Watercolor](reference/options/technique/watercolor/prompt.md), [Gouache](reference/options/technique/gouache/prompt.md), [Oil Painting](reference/options/technique/oilpainting/prompt.md), [Pencil Drawing](reference/options/technique/pencildrawing/prompt.md), [Charcoal](reference/options/technique/charcoal/prompt.md), [Ink Wash](reference/options/technique/inkwash/prompt.md), [Risograph](reference/options/technique/risograph/prompt.md), [Collage](reference/options/technique/collage/prompt.md), [Paper Craft](reference/options/technique/papercraft/prompt.md), [3D Render](reference/options/technique/3drender/prompt.md), [Vector](reference/options/technique/vector/prompt.md), [Digital Painting](reference/options/technique/digitalpainting/prompt.md), [Clay Render](reference/options/technique/clayrender/prompt.md), [Gradient Mesh](reference/options/technique/gradientmesh/prompt.md), [Marker](reference/options/technique/marker/prompt.md).
- **Typography (12):** [Swiss Typography](reference/options/typography/swisstypography/prompt.md), [Editorial Typography](reference/options/typography/editorialtypography/prompt.md), [Brutalist Typography](reference/options/typography/brutalisttypography/prompt.md), [Experimental Typography](reference/options/typography/experimentaltypography/prompt.md), [Bubble Lettering](reference/options/typography/bubblelettering/prompt.md), [Calligraphy](reference/options/typography/calligraphy/prompt.md), [Hand Lettering](reference/options/typography/handlettering/prompt.md), [Childlike Handwriting](reference/options/typography/childlikehandwriting/prompt.md), [Chrome Typography](reference/options/typography/chrometypography/prompt.md), [Modular Typography](reference/options/typography/modulartypography/prompt.md), [Bold Grotesk](reference/options/typography/boldgrotesk/prompt.md), [Outline Type](reference/options/typography/outlinetype/prompt.md).
- **Rendering Mode (3, 단일 선택):** [Color Only](reference/options/outline/coloronly/prompt.md) (`coloronly`), [Color + Outline](reference/options/outline/coloroutline/prompt.md) (`coloroutline`), [Outline Only](reference/options/outline/outlineonly/prompt.md) (`outlineonly`).
- **Color (18):** [Monochrome](reference/options/color/monochrome/prompt.md), [Duotone](reference/options/color/duotone/prompt.md), [Primary Colors](reference/options/color/primarycolors/prompt.md), [Pastel](reference/options/color/pastel/prompt.md), [Vivid](reference/options/color/vivid/prompt.md), [Muted](reference/options/color/muted/prompt.md), [Earthy](reference/options/color/earthy/prompt.md), [Neon](reference/options/color/neon/prompt.md), [Warm](reference/options/color/warm/prompt.md), [Cool](reference/options/color/cool/prompt.md), [Complementary](reference/options/color/complementary/prompt.md), [Analogous](reference/options/color/analogous/prompt.md), [High Key](reference/options/color/highkey/prompt.md), [Low Key](reference/options/color/lowkey/prompt.md), [Black & White](reference/options/color/blackwhite/prompt.md), [Neutral + Accent](reference/options/color/neutralaccent/prompt.md), [Jewel Tones](reference/options/color/jeweltones/prompt.md), [Iridescent](reference/options/color/iridescent/prompt.md).
- **Texture (10):** [Clean](reference/options/texture/clean/prompt.md), [Paper Grain](reference/options/texture/papergrain/prompt.md), [Film Grain](reference/options/texture/filmgrain/prompt.md), [Canvas](reference/options/texture/canvas/prompt.md), [Brushstroke](reference/options/texture/brushstroke/prompt.md), [Digital Noise](reference/options/texture/digitalnoise/prompt.md), [Emboss](reference/options/texture/emboss/prompt.md), [Glossy](reference/options/texture/glossy/prompt.md), [Frosted Glass](reference/options/texture/frostedglass/prompt.md), [Soft Matte](reference/options/texture/softmatte/prompt.md).
- **Composition (9):** [Minimal](reference/options/composition/minimal/prompt.md), [Centered](reference/options/composition/centered/prompt.md), [Asymmetric](reference/options/composition/asymmetric/prompt.md), [Symmetric](reference/options/composition/symmetric/prompt.md), [Grid](reference/options/composition/grid/prompt.md), [Full Bleed](reference/options/composition/fullbleed/prompt.md), [Editorial](reference/options/composition/editorial/prompt.md), [Layered](reference/options/composition/layered/prompt.md), [Dynamic](reference/options/composition/dynamic/prompt.md).
- **Photo Style (12):** [Portrait](reference/options/photography/portrait/prompt.md), [Product](reference/options/photography/product/prompt.md), [Food](reference/options/photography/food/prompt.md), [Landscape](reference/options/photography/landscape/prompt.md), [Fashion](reference/options/photography/fashion/prompt.md), [Still Life](reference/options/photography/stilllife/prompt.md), [Architectural](reference/options/photography/architectural/prompt.md), [Street](reference/options/photography/street/prompt.md), [Documentary](reference/options/photography/documentary/prompt.md), [Editorial](reference/options/photography/editorial/prompt.md), [Fine Art](reference/options/photography/fineart/prompt.md), [Cinematic](reference/options/photography/cinematic/prompt.md). 사진 장르 하나의 기준으로 구성한다.
- **Mood (13):** [Cute](reference/options/mood/cute/prompt.md), [Chic](reference/options/mood/chic/prompt.md), [Playful](reference/options/mood/playful/prompt.md), [Serene](reference/options/mood/serene/prompt.md), [Dreamy](reference/options/mood/dreamy/prompt.md), [Moody](reference/options/mood/moody/prompt.md), [Luxe](reference/options/mood/luxe/prompt.md), [Cozy](reference/options/mood/cozy/prompt.md), [Whimsical](reference/options/mood/whimsical/prompt.md), [Raw](reference/options/mood/raw/prompt.md), [Fresh](reference/options/mood/fresh/prompt.md), [Bold](reference/options/mood/bold/prompt.md), [Futuristic](reference/options/mood/futuristic/prompt.md). 이미지의 감정 톤을 정하며 모든 유형에 표시한다.
- **Camera (5, 사진 전용):** [Macro Close-up](reference/options/camera/macro/prompt.md), [Overhead Flat Lay](reference/options/camera/flatlay/prompt.md), [Shallow Depth of Field](reference/options/camera/shallowdepth/prompt.md), [Wide Angle](reference/options/camera/wideangle/prompt.md), [Portrait Lens](reference/options/camera/portraitlens/prompt.md). Photo Style 바로 뒤에 표시한다.
- **Lighting (8):** [Golden Hour](reference/options/lighting/goldenhour/prompt.md), [Studio Light](reference/options/lighting/studio/prompt.md), [Backlit](reference/options/lighting/backlit/prompt.md), [Dramatic](reference/options/lighting/dramatic/prompt.md), [Neon Night](reference/options/lighting/neonnight/prompt.md), [Soft Daylight](reference/options/lighting/softdaylight/prompt.md), [Colored Gel](reference/options/lighting/coloredgel/prompt.md), [Hard Flash](reference/options/lighting/hardflash/prompt.md). 모든 유형에 표시한다.

선택 목록은 간단한 메타데이터로 관리하고, `reference/`에 없는 스타일의 상세 프롬프트를 임의로 생성하거나 존재한다고 가정하지 않는다. `prompt.md`가 있는 항목만 파일 참조 대상으로 지정한다.

## 3. 기능

1. **Single Select:** 모든 옵션 카테고리는 단일 선택이다. Rendering Mode·Design Format은 항상 하나를 유지하고, 나머지는 다시 누르면 해제된다. 전체 선택이 6개를 넘으면 차단하지 않고 선명도 안내 토스트를 표시한다
10. **Recipe:** 유형별 큐레이션 4개(`src/utils/recipes.ts`)를 첫 화면에서 일러스트·사진·디자인 제목 아래 카드로 나열하고 유형마다 마지막에 '새로 만들기 +' 카드를 둔다. 선택하면 해당 유형의 옵션·비율·Typography ON/OFF를 바꾸고 Subject·추가 지시는 유지하며 하단에 선택값·프롬프트를 바로 표시한다. '옵션 수정'·'새로 만들기'는 현재 값으로 전체 옵션 편집 화면을 열고, '처음부터 다시하기'는 값을 지우지 않고 레시피 화면으로 돌아간다. 레시피는 선택값 묶음일 뿐이며 직접 셋팅과 같은 생성 규칙을 거친다
11. **기본값:** 비율 2:3, 일러스트 기본 Contemporary Flat·Digital Painting·Neutral + Accent·Minimal, 사진 기본 Portrait·Portrait Lens·Soft Daylight
2. **Live Prompt:** 선택 즉시 영문 지시문 갱신
3. **Conflict Prevention:** 카테고리마다 하나만 고르므로 같은 카테고리 충돌 규칙은 두지 않는다. 카테고리 간 우선순위 문장도 출력하지 않는다
4. **Reference Preview:** 기존 `reference/` 이미지 1~3장 미리보기·확대, 이미지 없으면 텍스트 표시
5. **Custom Input:** 최상단 라벨 없는 Subject input으로 피사체를 입력하고 Your direction textarea로 추가 지시를 입력. Aspect ratio(1:1/4:5/3:4/2:3/9:16/4:3/3:2/16:9)는 상위 독립 옵션으로 선택. 기존 프리셋의 Subject는 주제 입력란에 보존하고 Negative Prompt는 이름표와 함께 Your direction으로 합쳐 보존하며, Text는 별도 Typography 입력칸에 보존
6. **Copy Prompt:** 영문 지시문 복사
7. **Save Preset:** 스타일명·선택값·입력값 저장/목록 조회·복사/이름 수정/삭제; Save 클릭 시 스타일명 입력·프롬프트 미리보기·Cancel·Save가 있는 팝업 제공. 저장 목록은 본문 페이지에서 실제 콘텐츠 폭에 따라 최대 3열로 표시. 이름 바로 옆에 편집 아이콘, 하단에 저장값으로 재구성한 전체 프롬프트와 Copy 버튼을 제공하며 Load 버튼은 사용하지 않는다. LocalStorage 사용(기기 간 동기화 없음)
8. **Simple Depiction:** 복잡도 옵션은 없다. 모든 프롬프트에 단순한 묘사(Depiction: Simple)를 고정 기본값으로 넣으며 UI에서 바꾸지 않는다. 기존 스타일셋의 복잡도 값은 로드 시 버린다
9. **Rendering Mode:** 컬러만 / 컬러 + 윤곽선 / 윤곽선만 중 하나 선택, 기본값 Color Only. 프리셋 저장·프롬프트 재구성에 포함하며 기존 프리셋에 값이 없으면 기본값 적용.

### Rendering Mode

| ID | 표시명 | 프롬프트 |
|---|---|---|
| `coloronly` | Color Only | [prompt.md](reference/options/outline/coloronly/prompt.md) |
| `coloroutline` | Color + Outline | [prompt.md](reference/options/outline/coloroutline/prompt.md) |
| `outlineonly` | Outline Only | [prompt.md](reference/options/outline/outlineonly/prompt.md) |

Color는 팔레트를, Rendering Mode는 채움과 윤곽선의 표현 방식을 정한다. Outline Only에서는 선택한 팔레트를 선 색상에만 적용한다. 배경·투명도는 별도 지시를 따르며 이 옵션으로 바꾸지 않는다.

## 4. Depiction

| ID | 이름 | 프롬프트 |
|---|---|---|
| `simple` | Simple | [prompt.md](reference/options/depiction/simple/prompt.md) |

일러스트는 항상 Mid-century Modern을 `## Base Style`로 먼저 출력하고, 다른 Illustration Style을 고르면 `## Accent Style`로 그 뒤에 출력한다. Accent 본문은 Base와 중복된 줄·Color·Lighting·Texture 기본값 줄을 빼고 `### Blend`에 `Let Mid-century Modern lead the shapes and layout, and add {Accent} as a light accent in motifs and details.`를 둔다. Key direction도 `Base Style`·`Accent Style`로 표기한다. 사진·디자인에는 적용하지 않는다. 기존 레시피·스타일셋 데이터는 그대로 두고 프롬프트에서만 이 규칙을 적용한다.

선택 옵션 본문 뒤에 `## Depiction: Simple`로 항상 출력하고 Settings에는 반복하지 않는다. 'complexity' 단어는 프롬프트에 쓰지 않는다.

## 5. 생성 규칙

- `Subject → Illustration Style → Technique → Typography → Rendering Mode → Color → Lighting → Texture → Composition → Mood → Photo Style → Depiction → Aspect Ratio → Additional Instructions → Negative Prompt` 순서
- 선택하지 않은 항목은 생략, Subject·Text는 사용자 입력 그대로 유지
- Typography는 옵션 제목 옆 ON/OFF 토글로 제어하며 기본 OFF. ON이면 스타일 선택과 별도 문구 input을 활성화한다. 문구가 있으면 그대로 사용하고 비어 있으면 AI가 적절한 문구를 자유롭게 정하도록 지시한다. OFF에서는 저장된 문구·Typography 옵션을 생성 지시문에서 제외한다. 토글 상태와 입력값은 스타일셋에 저장한다.
- Rendering Mode의 표시명과 선택한 실제 프롬프트 본문을 출력한다. 채움·윤곽선에 관한 스타일·기법·질감 지침과 충돌하면 Rendering Mode를 우선하고, 나머지 스타일 특징은 유지한다. 사진 스타일을 선택해도 같은 표현 규칙을 적용한다.
- Illustration Style은 `reference/{id}/prompt.md`, 옵션은 `reference/options/{category}/{id}/prompt.md`에 연결한다. Rendering Mode의 경로 카테고리는 `outline`이다. Depiction은 항상 `depiction/simple`을 연결한다.
- 위 선택 목록의 링크가 Builder ID와 실제 파일의 매핑이다. ID·표시명은 각 파일의 Category·Style ID·제목에서 읽으며 별도 목록이나 상세 설명 데이터를 복제하지 않는다. 동일 ID가 다른 카테고리에 있으면 카테고리와 ID를 함께 식별자로 사용한다.
- **실제로 존재하는 파일만** 선택한 항목의 원문 본문을 출력하며, 파일 경로를 읽으라는 지시는 출력하지 않는다. Typography는 ON일 때, Photo Style은 사진 기반 결과를 요청할 때만 포함한다.
- 파일이 없는 옵션은 표시명만 전달
- 스타일 상세 설명·Mix Prompt를 별도 데이터로 중복 관리하지 않음
- 옵션 정리로 삭제한 ID는 스타일셋 로드 시 흡수한 옵션으로 바꾼다: Constructivism→Bauhaus, Suprematism·Cubism·Optical Art·Swiss Graphic Design(일러스트)→Geometric Illustration, Dadaism→Surrealism, Fauvism→Expressionism, Art Nouveau→Art Deco, Retro Graphic Design(일러스트)→Mid-century Modern, Linocut·Woodcut·Screen Printing·Halftone Printing→Risograph, Hand-drawn→Marker, Vintage Faded·Mid-century Palette→Muted, 사진 Film·Analog→Texture Film Grain + Color Muted, 사진 Monochrome→Color Black & White, Diagonal→Dynamic, Mood Epic→Bold·Dark→Moody·Elegant→Luxe·Nostalgic→Cozy, Rough Print·Distressed·Ink Bleed→Paper Grain, Blackletter→Calligraphy, Groovy·Psychedelic Lettering→Bubble Lettering, Distorted·Kinetic Typography→Experimental Typography. 변환 값은 비어 있는 카테고리에만 채운다.
- 모든 Illustration·Design·Photo Style 원본 MD에는 Color·Lighting·Texture 지시가 없을 때 쓸 기본 짝(팔레트·빛·표면)을 한 줄로 둔다.
- 프롬프트 복잡도를 낮추기 위해 `## Final Instructions` 섹션은 출력하지 않는다. 장면 확장·고급 에디토리얼·포트폴리오·crisp focus 같은 완성도 강조 문구는 넣지 않는다.
- 옛 사조 스타일은 현대적 재해석 문장을, 종이 기반 기법과 Warm·Earthy·Golden Hour·Paper Grain은 밝은 흰 바탕·정확한 색 지시를 원본 MD에 긍정문으로 포함한다(세피아·노화 등 피할 대상은 적지 않는다).
- 주 스타일 카테고리는 유형별로 Illustration Style·Photo Style·Design Style로 부른다. 기존 저장 데이터의 Base Style·Photography는 로드 시 새 이름으로 변환한다.
- 원본 MD에는 `### Avoid` 섹션을 두지 않고 해야 할 지시를 `### Apply`·`### Style` 등에 긍정문으로 쓴다. 상표·기존 캐릭터 모방, 통계·제품 주장 지어내기 금지 등 꼭 필요한 제한만 해당 지시 문장 안에 둔다.
- 목업·잡동사니·광택 등 피할 대상을 나열하지 않고 "flat … artwork itself as the full image"처럼 원하는 결과를 쓴다. crisp·polished·refined·luminous 같은 완성도 강조어는 기법·질감을 정의하는 경우(Flat Color·Vector·Pixel Art·Low Poly·Glossy·Hard Flash·Backlit·Gradient 등)에만 쓴다.
- 원본 MD는 이미지 모델이 볼 수 없는 빌더 상태(typography is enabled, selected palette 등)를 조건으로 쓰지 않는다. 글자는 "rendered text", 색은 "the Color instructions when given"처럼 프롬프트 안에서 확인할 수 있는 표현을 쓴다.

**출력 방식**

선택된 스타일·기법·색상·Typography·Rendering Mode의 MD 본문과 고정 Depiction 본문을 원본에서 빌드 시 읽어 출력에 포함한다. 각 옵션은 원본 제목과 Category·Style ID 메타데이터 줄 대신 `## {카테고리}: {표시명}` 제목 아래 본문 섹션만 빈 줄로 구분해 출력하고, Outline은 제목·요약 모두 Rendering Mode로 표기한다. 첫 줄 다음 Key direction 한 줄, 옵션 본문, 이어서 `## Settings`에는 Key direction·옵션 제목에 없는 내용만 출력한다: Subject 미입력 시 랜덤 Subject 지시, 추가 지시, Typography ON일 때만 `Typography: On`·Text(OFF이면 Typography를 언급하지 않음). 입력 Subject·비율·선택 요약·Depiction은 반복하지 않으며, 출력할 내용이 없으면 Settings 섹션을 생략한다. `## Final Instructions`(결합·주 방향·초점·Rendering Mode 우선·충돌 우선순위·글자 규칙·보존·Key direction 재강조)는 출력하지 않는다. 도입·랜덤 Subject·자동 문구 지시는 유형(image·photograph·graphic design)에 맞춘다. 선택하지 않았거나 현재 유형에서 숨겨진 옵션은 제외한다. 복사한 프롬프트만으로 사용할 수 있으며 외부 도구의 파일 또는 URL 접근을 요구하지 않는다. LocalStorage에는 기존처럼 선택 ID·설정만 저장하고 본문을 중복 저장하지 않는다.

## 6. 연동 및 UI

- 기존 IMAGE STUDIO 메뉴에 `Prompt Builder` 추가; Gallery는 기본 화면 유지
- 스타일 선택·레퍼런스 미리보기·표현 방식 단일 선택·입력·결과·복사·저장 UI 제공
- Typography는 예외로 제목 옆 토글 ON일 때 제목 바로 아래 공통 높이 28px의 입력창, 그 아래 전체 옵션을 표시한다. OFF일 때 입력창과 옵션은 숨기며 별도 펼치기·접기 버튼은 사용하지 않는다.
- 다른 카테고리는 접힌 상태에서 최대 한 줄만 표시하고, 실제 버튼 폭을 측정해 Builder 너비에 맞게 개수를 조절한다. 옵션 버튼 옆의 `…` 버튼으로 전체 목록을 펼치거나 접는다. 접힌 행의 폭 계산에 `…` 버튼과 간격을 포함한다. 선택 상태 표시와 반응형 구성 유지
- 옵션 타이틀과 전체 UI 글자는 최소 12px. 버튼 패딩은 공통 em 비율·모바일 2px 단위를 사용. Outline은 Aspect ratio 바로 위에 배치. 본문·textarea·저장 팝업을 포함한 모든 스크롤바는 6px, radius 0, 화살표와 thumb/track 간격 제거
- 옵션 사이 구분선 제거. Builder 기본 폭 248px, 데스크톱에서 최소 220px~최대 420px까지 우측 경계 드래그로 조절. 경계의 방향키·Home·End 조작 지원. 모바일 전체 화면 팝업은 너비 조절 제외
- Public `reference/`의 기존 이미지·프롬프트와 공개 GitHub 조회 경로 재사용; Cloudflare API를 전제로 하지 않음
- 필요한 컴포넌트는 `src/components/promptbuilder/`, 생성 로직은 `src/utils/promptBuilder.ts`에 배치하되 기존 구조에 맞게 조정
- GitHub 조회·쓰기 권한 처리·Publish·이미지 최적화 중복 구현 금지; 브라우저에 GitHub 토큰을 저장하지 않음

## 7. 구현 순서

1. **Step 1 — Data:** Reference 연동, 선택 목록, 공통 옵션·충돌 규칙
2. **Step 2 — UI:** 스타일 선택, 레퍼런스, 입력, 슬라이더
3. **Step 3 — Generator:** 실시간 조합, 충돌 처리, 복사
4. **Step 4 — Preset:** 저장·목록 조회·프롬프트 복사·이름 수정·삭제
5. **Step 5 — Integration:** 기존 IMAGE STUDIO에 연결

`IMAGE-STUDIO.md`를 먼저 읽고 현재 프로젝트 구조를 확인한다. **우선 Step 1만 진행**하고 나머지는 요청 시 실행한다. 불필요한 파일·기능을 추가하지 않는다.

- Subject를 최상위에 배치하고 아래에 Outline·Aspect ratio 버튼을 별도 그룹 래퍼 없이 배치한다. Subject는 생성·복사·스타일셋 저장에 포함하며 언어 변경 시 원문을 유지한다. Selected 영역은 우측 음수 마진과 같은 크기 패딩으로 스크롤바를 패널 우측 경계에 정렬한다.

- Selected에는 비율·Outline의 값만 표시한다. 필터 X는 회전 없이 opacity 0.5에서 hover 시 1로 전환한다. Selected·Prompt 탭은 옵션 제목 스타일을 공유하며, Outline·Aspect ratio는 고정 순서의 단일 선택 옵션 버튼을 사용한다. Typography 표시명에서 Typography·Lettering·Handwriting 접미어를 생략하되 프롬프트 원문은 유지한다.

- Subject 미입력 시 선택 설정·추가 지시에 맞는 랜덤 피사체와 장면을 정해 추가 질문 없이 이미지를 생성하도록 지시한다. 미입력 안내를 Subject 아래 표시한다. 모바일에서는 카테고리 옵션을 모두 펼치고 접기 버튼을 숨긴다.

- 하단 Selected·Prompt 활성 탭은 bold, 나머지 버튼·탭은 medium으로 표시한다. 출력 영역 접기는 선택 칩·프롬프트 내용만 숨기고 Generate 또는 Save·Copy 버튼을 유지한다. Generate 버튼 앞에는 AI 아이콘을 표시한다.
