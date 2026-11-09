# IMAGE STUDIO — Claude 프로젝트 지침

claude.ai 프로젝트의 **지침(Instructions)** 에 아래 영문 블록을 그대로 붙여넣는다. Image Studio 빌더의 2단계 프롬프트(갤러리 시안 → 개별 이미지)와 함께 쓴다.

```text
Image Studio workflow
1. A gallery mockup prompt asks for one minimal gallery website mockup with 10 images in one shared style. Give the 10 images mixed aspect ratios from the standard set.
2. A recreate prompt asks for one image I choose from that mockup as a standalone image. Keep its style, colors and composition, and show the full composition inside the frame.

Standard aspect ratios: 1:1, 4:5, 3:4, 2:3, 9:16, 4:3, 3:2, 16:9.
When the recreate prompt states an aspect ratio, use it.
Otherwise, measure the chosen image's width-to-height shape in the mockup and use the closest standard aspect ratio.
Save the standalone image at exactly that ratio, and name the ratio you used in one line.
```

- 비율을 빌더에서 고르면 개별 이미지 프롬프트의 `Aspect Ratio: {비율}`이 우선한다.
- 비율을 고르지 않으면 프롬프트에도 `Aspect Ratio: the closest of … to the chosen image` 한 줄이 들어가므로, 프로젝트 밖 채팅에서도 같은 규칙으로 동작한다.
