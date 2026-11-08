# 샘플 이미지 재생성 현황

갤러리 샘플 20장을 Cue가 들어간 새 프롬프트로 처음부터 다시 생성하기 위한 목록이다. 기존 이미지는 `public/samples/`에 그대로 두며, 새 이미지로 교체하면 상태를 `✅ 새 이미지`로 바꾼다.

- 프롬프트는 `src/utils/sampleImages.ts`의 설정으로 빌더가 만드는 결과와 같다. 설정이나 Cue가 바뀌면 상세 화면의 프롬프트를 기준으로 한다.
- 상태: `⬜ 기존 이미지` → 아직 예전 프롬프트로 만든 이미지, `✅ 새 이미지` → 새 프롬프트로 다시 생성해 교체함

| # | 파일 | 유형 | 비율 | 상태 |
|---|---|---|---|---|
| 1 | `popart-dog-astronaut.webp` | Illustration | 4:5 | ⬜ 기존 이미지 |
| 2 | `isometric-tiny-rooftop-garden-cafe.webp` | Illustration | 1:1 | ⬜ 기존 이미지 |
| 3 | `pixelart-cat-in-front-of-an-arcade.webp` | Illustration | 16:9 | ⬜ 기존 이미지 |
| 4 | `impressionism-rowing-boat-on-a-misty-lake.webp` | Illustration | 3:2 | ⬜ 기존 이미지 |
| 5 | `celshadedanime-bicycle-by-the-sea.webp` | Illustration | 16:9 | ⬜ 기존 이미지 |
| 6 | `geometricillustration-jeweled-peacock.webp` | Illustration | 1:1 | ⬜ 기존 이미지 |
| 7 | `continuousline-jazz-pianist.webp` | Illustration | 2:3 | ⬜ 기존 이미지 |
| 8 | `maximalism-cats-birthday-party.webp` | Illustration | 4:3 | ⬜ 기존 이미지 |
| 9 | `grunge-skateboarder-under-a-bridge.webp` | Illustration | 3:4 | ⬜ 기존 이미지 |
| 10 | `contemporaryflat-working-from-home.webp` | Illustration | 4:5 | ⬜ 기존 이미지 |
| 11 | `brutalism-tiny-concrete-house.webp` | Illustration | 1:1 | ⬜ 기존 이미지 |
| 12 | `minimalism-lighthouse-in-winter.webp` | Illustration | 9:16 | ⬜ 기존 이미지 |
| 13 | `fashion-model-in-a-red-trench-coat.webp` | Photo | 4:5 | ⬜ 기존 이미지 |
| 14 | `architectural-spiral-staircase.webp` | Photo | 3:4 | ⬜ 기존 이미지 |
| 15 | `documentary-street-market-vendor-at-dawn.webp` | Photo | 3:2 | ⬜ 기존 이미지 |
| 16 | `stilllife-lemon-slice-in-a-glass.webp` | Photo | 1:1 | ⬜ 기존 이미지 |
| 17 | `fineart-dancer-in-flowing-fabric.webp` | Photo | 2:3 | ⬜ 기존 이미지 |
| 18 | `packaging-lemon-soda.webp` | Design | 4:5 | ⬜ 기존 이미지 |
| 19 | `iconset-weather-icon-set.webp` | Design | 1:1 | ⬜ 기존 이미지 |
| 20 | `emblem-mountain-hiking-club.webp` | Design | 1:1 | ⬜ 기존 이미지 |

## 프롬프트

### 1. popart-dog-astronaut.webp

```text
Create an illustration for a contemporary art print or editorial spread, using the instructions below.
Key direction: Subject "A dog astronaut"; Illustration Style: Pop Art; Technique: Collage; Aspect Ratio: 4:5.

## Options
Illustration Style: Pop Art — Bold black outlines, Ben-Day halftone dots, flat saturated fills, iconic framing
Technique: Collage — Visible cut fragments of mixed materials with abrupt scale shifts
Rendering Mode: Color + Outline — Filled color shapes with deliberate visible contour lines
Color: Vivid — Highly saturated, assertive hues
Composition: Centered — Subject on the central axis, even breathing room around it
Mood: Bold — Confident and striking, large scale, decisive contrast
Depiction: Simple — Few elements, simplified shapes, generous empty space around one focus
```

### 2. isometric-tiny-rooftop-garden-cafe.webp

```text
Create an illustration for a contemporary art print or editorial spread, using the instructions below.
Key direction: Subject "A tiny rooftop garden cafe"; Illustration Style: Isometric Illustration; Technique: Vector; Aspect Ratio: 1:1.

## Options
Illustration Style: Isometric Illustration — True 30-degree isometric grid, parallel receding lines, equal axis angles, clean block volumes
Technique: Vector — Crisp geometric paths, consistent curves, flat or simple gradient fills
Rendering Mode: Color Only — Filled color shapes with edges defined by color alone
Color: Pastel — Light, softened low-saturation hues
Lighting: Soft Daylight — Diffused window or overcast light, soft shadows, even tones
Texture: Clean — Smooth, clean, consistent surfaces
Mood: Cozy — Warm, intimate, lived-in calm
Depiction: Simple — Few elements, simplified shapes, generous empty space around one focus
```

### 3. pixelart-cat-in-front-of-an-arcade.webp

```text
Create an illustration for a contemporary art print or editorial spread, using the instructions below.
Key direction: Subject "A cat in front of an arcade"; Illustration Style: Pixel Art; Technique: Flat Color; Aspect Ratio: 16:9.

## Options
Illustration Style: Pixel Art — Strict low-resolution pixel grid, 16-color palette, hard stepped edges, uniformly sharp pixels
Technique: Flat Color — Uniform unshaded flat fills with crisp boundaries
Rendering Mode: Color Only — Filled color shapes with edges defined by color alone
Color: Neon — Electric fluorescent hues with high chroma contrast
Lighting: Neon Night — Night scene lit by neon signs, wet reflections, glowing highlights
Mood: Playful — Lighthearted energy, humor, a sense of play
Depiction: Simple — Few elements, simplified shapes, generous empty space around one focus
```

### 4. impressionism-rowing-boat-on-a-misty-lake.webp

```text
Create an illustration for a contemporary art print or editorial spread, using the instructions below.
Key direction: Subject "A rowing boat on a misty lake"; Illustration Style: Impressionism; Technique: Oil Painting; Aspect Ratio: 3:2.

## Options
Illustration Style: Impressionism — Broken dabs of color, soft dissolving edges, optical mixing of light
Technique: Oil Painting — Layered oil paint with visible pigment body and painterly blending
Rendering Mode: Color Only — Filled color shapes with edges defined by color alone
Color: Analogous — Two to four neighboring hues, one hue leading
Lighting: Golden Hour — Low warm sun, long soft shadows, glowing air, neutral whites
Texture: Canvas — Subtle woven canvas weave beneath the marks
Mood: Serene — Calm balance, gentle transitions, unhurried stillness
Depiction: Simple — Few elements, simplified shapes, generous empty space around one focus
```

### 5. celshadedanime-bicycle-by-the-sea.webp

```text
Create an illustration for a contemporary art print or editorial spread, using the instructions below.
Key direction: Subject "A girl riding a bicycle by the sea"; Illustration Style: Cel-shaded Anime; Technique: Digital Painting; Aspect Ratio: 16:9.

## Options
Illustration Style: Cel-shaded Anime — Clean ink lines, hard two-tone cel shadows, crisp highlights, flat color zones
Technique: Digital Painting — Smooth digital brushwork, controlled soft and hard edges, clear highlights
Rendering Mode: Color + Outline — Filled color shapes with deliberate visible contour lines
Color: Cool — Blues, teals and violets lead; warm tones stay minor
Lighting: Backlit — Light behind the subject, glowing rim light, luminous edges
Composition: Dynamic — Strong diagonals, directional movement, varied scale
Mood: Fresh — Bright, airy, clean and invigorating
Depiction: Simple — Few elements, simplified shapes, generous empty space around one focus
```

### 6. geometricillustration-jeweled-peacock.webp

```text
Create an illustration for a contemporary art print or editorial spread, using the instructions below.
Key direction: Subject "A jeweled peacock"; Illustration Style: Geometric Illustration; Technique: Gradient Mesh; Aspect Ratio: 1:1.

## Options
Illustration Style: Geometric Illustration — Subject built from circles, arcs and polygons with precise intersections
Technique: Gradient Mesh — Seamless smooth gradients shaping soft luminous volume
Rendering Mode: Color Only — Filled color shapes with edges defined by color alone
Color: Jewel Tones — Emerald, sapphire, ruby and amethyst with clear contrast
Composition: Symmetric — Mirrored masses around a clear axis or radial center
Mood: Luxe — Fine materials, restrained detail, understated elegance
Depiction: Simple — Few elements, simplified shapes, generous empty space around one focus
```

### 7. continuousline-jazz-pianist.webp

```text
Create an illustration for a contemporary art print or editorial spread, using the instructions below.
Key direction: Subject "A jazz pianist"; Illustration Style: Continuous Line; Technique: Ink Wash; Aspect Ratio: 2:3.

## Options
Illustration Style: Continuous Line — One unbroken line of steady weight drawing the whole subject; open loops
Technique: Ink Wash — Diluted ink values, fluid bleeding, concentrated and transparent marks
Rendering Mode: Outline Only — Line work only, forms left unfilled
Color: Monochrome — One hue family varied in value and saturation
Composition: Minimal — One focal subject, at least half the frame empty
Mood: Chic — Cool restraint, sleek forms, urban sophistication
Depiction: Simple — Few elements, simplified shapes, generous empty space around one focus
```

### 8. maximalism-cats-birthday-party.webp

```text
Create an illustration for a contemporary art print or editorial spread, using the instructions below.
Key direction: Subject "A cat's birthday party"; Illustration Style: Maximalism; Technique: Gouache; Aspect Ratio: 4:3.

## Options
Illustration Style: Maximalism — Dense layered motifs and patterns edge to edge around one clear hero
Technique: Gouache — Opaque matte paint, dense pigment, softly irregular edges
Rendering Mode: Color + Outline — Filled color shapes with deliberate visible contour lines
Color: Complementary — One complementary pair, one dominant and one accent
Composition: Full Bleed — Subject cropped boldly at the frame edges, immersive field
Mood: Whimsical — Playful twists of scale and logic, quiet charm
Depiction: Simple — Few elements, simplified shapes, generous empty space around one focus
```

### 9. grunge-skateboarder-under-a-bridge.webp

```text
Create an illustration for a contemporary art print or editorial spread, using the instructions below.
Key direction: Subject "A skateboarder under a bridge"; Illustration Style: Grunge; Technique: Charcoal; Aspect Ratio: 3:4.

## Options
Illustration Style: Grunge — Rough gestural marks, torn edges, layered scuffs, deliberate visual friction
Technique: Charcoal — Powdery charcoal masses, smudged transitions, gestural marks on white paper
Rendering Mode: Color Only — Filled color shapes with edges defined by color alone
Color: Low Key — Mostly dark values, restrained highlights, deep contrast
Lighting: Dramatic — Single hard directional light, deep shadows, sculpted contrast
Texture: Brushstroke — Visible directional brush marks and pigment variation
Mood: Raw — Candid, unpolished, authentic in-the-moment energy
Depiction: Simple — Few elements, simplified shapes, generous empty space around one focus
```

### 10. contemporaryflat-working-from-home.webp

```text
Create an illustration for a contemporary art print or editorial spread, using the instructions below.
Key direction: Subject "A woman working from home among plants"; Illustration Style: Contemporary Flat Illustration; Technique: Flat Color; Aspect Ratio: 4:5.

## Options
Illustration Style: Contemporary Flat Illustration — Rounded geometric figures, oversized limbs, flat overlapping planes, minimal interior detail
Technique: Flat Color — Uniform unshaded flat fills with crisp boundaries
Rendering Mode: Color Only — Filled color shapes with edges defined by color alone
Color: Neutral + Accent — Whites and soft neutrals with one saturated accent on the focal point
Lighting: Soft Daylight — Diffused window or overcast light, soft shadows, even tones
Composition: Asymmetric — Main subject on a third, balanced by open space
Mood: Serene — Calm balance, gentle transitions, unhurried stillness
Depiction: Simple — Few elements, simplified shapes, generous empty space around one focus
```

### 11. brutalism-tiny-concrete-house.webp

```text
Create an illustration for a contemporary art print or editorial spread, using the instructions below.
Key direction: Subject "A tiny concrete house"; Illustration Style: Brutalism; Technique: Clay Render; Aspect Ratio: 1:1.

## Options
Illustration Style: Brutalism — Blunt heavy masses, hard edges, abrupt scale jumps, raw exposed construction
Technique: Clay Render — Soft rounded clay forms, gentle bevels, matte surfaces, handmade irregularity
Rendering Mode: Color Only — Filled color shapes with edges defined by color alone
Color: Earthy — Clay, sand, olive and terracotta with clean whites
Lighting: Studio Light — Soft key light, gentle fill, seamless clean falloff
Texture: Soft Matte — Velvety matte finish, diffused falloff, soft highlights
Mood: Cute — Rounded forms, soft proportions, gentle friendly expressions
Depiction: Simple — Few elements, simplified shapes, generous empty space around one focus
```

### 12. minimalism-lighthouse-in-winter.webp

```text
Create an illustration for a contemporary art print or editorial spread, using the instructions below.
Key direction: Subject "A lighthouse in winter"; Illustration Style: Minimalism; Technique: Watercolor; Aspect Ratio: 9:16.

## Options
Illustration Style: Minimalism — Two or three decisive forms, one bold focal shape, large intentional empty field
Technique: Watercolor — Transparent washes, soft blooms, wet-on-wet edges, white paper showing through
Rendering Mode: Color Only — Filled color shapes with edges defined by color alone
Color: Cool — Blues, teals and violets lead; warm tones stay minor
Texture: Paper Grain — Fine paper-fiber grain on bright neutral white stock
Composition: Minimal — One focal subject, at least half the frame empty
Mood: Dreamy — Soft haze, floating lightness, quiet wonder
Depiction: Simple — Few elements, simplified shapes, generous empty space around one focus
```

### 13. fashion-model-in-a-red-trench-coat.webp

```text
Create a photograph for a feature in an independent print magazine, using the instructions below.
Key direction: Subject "A model in a red trench coat"; Photo Style: Fashion; Camera: Portrait Lens; Aspect Ratio: 4:5.

## Options
Photo Style: Fashion — Garment and silhouette as hero, confident pose, styled set
Camera: Portrait Lens — 85mm lens at eye level, compressed background, natural proportions
Color: Jewel Tones — Emerald, sapphire, ruby and amethyst with clear contrast
Lighting: Colored Gel — Magenta and cyan gel lights, colored shadows, bold color washes
Mood: Bold — Confident and striking, large scale, decisive contrast
Depiction: Simple — Few elements, simplified shapes, generous empty space around one focus
```

### 14. architectural-spiral-staircase.webp

```text
Create a photograph for a feature in an independent print magazine, using the instructions below.
Key direction: Subject "A spiral staircase"; Photo Style: Architectural; Camera: Wide Angle; Aspect Ratio: 3:4.

## Options
Photo Style: Architectural — Straight verticals, strong geometry, structural rhythm, clean perspective
Camera: Wide Angle — 24mm lens close to the scene, exaggerated depth, rich surrounding context
Color: High Key — Mostly light values, soft shadows, low contrast
Lighting: Soft Daylight — Diffused window or overcast light, soft shadows, even tones
Composition: Symmetric — Mirrored masses around a clear axis or radial center
Mood: Serene — Calm balance, gentle transitions, unhurried stillness
Depiction: Simple — Few elements, simplified shapes, generous empty space around one focus
```

### 15. documentary-street-market-vendor-at-dawn.webp

```text
Create a photograph for a feature in an independent print magazine, using the instructions below.
Key direction: Subject "A street market vendor at dawn"; Photo Style: Documentary; Camera: Shallow Depth of Field; Aspect Ratio: 3:2.

## Options
Photo Style: Documentary — Unposed observed moment, available light, real environmental context
Camera: Shallow Depth of Field — Wide aperture f/1.8, sharp subject, creamy blurred background
Color: Earthy — Clay, sand, olive and terracotta with clean whites
Lighting: Golden Hour — Low warm sun, long soft shadows, glowing air, neutral whites
Texture: Film Grain — Fine organic 35mm film grain, gentle tonal roll-off
Mood: Raw — Candid, unpolished, authentic in-the-moment energy
Depiction: Simple — Few elements, simplified shapes, generous empty space around one focus
```

### 16. stilllife-lemon-slice-in-a-glass.webp

```text
Create a photograph for a feature in an independent print magazine, using the instructions below.
Key direction: Subject "A lemon slice in a glass"; Photo Style: Still Life; Camera: Macro Close-up; Aspect Ratio: 1:1.

## Options
Photo Style: Still Life — A few styled objects, one hero object, intentional arrangement
Camera: Macro Close-up — Macro lens inches from the subject, razor-thin focus plane, visible micro texture
Color: Pastel — Light, softened low-saturation hues
Lighting: Studio Light — Soft key light, gentle fill, seamless clean falloff
Texture: Frosted Glass — Translucent frosted surfaces, soft blur, bright clean edges
Mood: Fresh — Bright, airy, clean and invigorating
Depiction: Simple — Few elements, simplified shapes, generous empty space around one focus
```

### 17. fineart-dancer-in-flowing-fabric.webp

```text
Create a photograph for a feature in an independent print magazine, using the instructions below.
Key direction: Subject "A dancer in flowing fabric"; Photo Style: Fine Art; Camera: Portrait Lens; Aspect Ratio: 2:3.

## Options
Photo Style: Fine Art — Conceptual intent, expressive framing, sculpted light, restrained palette
Camera: Portrait Lens — 85mm lens at eye level, compressed background, natural proportions
Color: Black & White — Pure grayscale, separation through tone only
Lighting: Dramatic — Single hard directional light, deep shadows, sculpted contrast
Composition: Minimal — One focal subject, at least half the frame empty
Mood: Moody — Deep shadows, restrained light, quiet cinematic tension
Depiction: Simple — Few elements, simplified shapes, generous empty space around one focus
```

### 18. packaging-lemon-soda.webp

```text
Create a finished graphic design ready for a real brand, using the instructions below.
Key direction: Subject "Packaging for a lemon soda"; Design Format: Packaging; Design Style: Retro Graphic Design; Aspect Ratio: 4:5.

## Options
Design Format: Packaging — Flat front panel, one hero element, clear brand block, tidy margins
Design Style: Retro Graphic Design — Period-inspired shapes, badge framing, bold hierarchy, balanced ornament
Typography: Bubble Lettering — Inflated rounded letters with soft volume
Color: Vivid — Highly saturated, assertive hues
Mood: Playful — Lighthearted energy, humor, a sense of play
Depiction: Simple — Few elements, simplified shapes, generous empty space around one focus

## Settings
Typography: On
Text: LEMON POP
```

### 19. iconset-weather-icon-set.webp

```text
Create a finished graphic design ready for a real brand, using the instructions below.
Key direction: Subject "A weather icon set"; Design Format: Icon Set; Design Style: Bold Geometric; Aspect Ratio: 1:1.

## Options
Design Format: Icon Set — Icons on an even grid, one shared stroke weight, corner radius and visual family
Design Style: Bold Geometric — Large flat circles, arcs and blocks, tight alignment, strong contrast
Color: Primary Colors — Red, yellow and blue as the dominant colors
Composition: Grid — Elements aligned on a consistent modular grid
Depiction: Simple — Few elements, simplified shapes, generous empty space around one focus
```

### 20. emblem-mountain-hiking-club.webp

```text
Create a finished graphic design ready for a real brand, using the instructions below.
Key direction: Subject "An emblem for a mountain hiking club"; Design Format: Emblem; Design Style: Bauhaus; Aspect Ratio: 1:1.

## Options
Design Format: Emblem — Enclosed badge shape, central symbol, strong symmetry, reads at small size
Design Style: Bauhaus — Circles, rectangles and lines in rhythmic functional alignment
Color: Duotone — Exactly two hues with tints between them
Texture: Clean — Smooth, clean, consistent surfaces
Mood: Bold — Confident and striking, large scale, decisive contrast
Depiction: Simple — Few elements, simplified shapes, generous empty space around one focus
```

