# IMAGE STUDIO — 이미지 갤러리 및 관리

## 1. 목표

GitHub 기반 개인 이미지 갤러리 및 관리 사이트를 구축한다. **생성 이미지 Gallery가 메인**이며 Reference, Prompt Builder, Publish는 보조 기능이다.

- React + TypeScript + SCSS
- 직관적인 UI, 최소한의 의존성, 유지보수 가능한 구조
- 사용자는 로컬 저장소를 직접 관리하지 않고 GitHub/Codex 클라우드 환경을 우선 사용
- Prompt Builder의 세부 기능은 `PROMPT-BUILDER.md`를 따른다.

## 2. 저장소

- **`image-studio` (Private):** 웹사이트 소스, 스타일 프롬프트·레퍼런스, 프로젝트별 생성 이미지
- **`image-assets` (Public):** 사용자가 공개 승인한 최적화 PNG, CDN 제공

```text
image-studio/
├── reference/
│   ├── naivefolk/
│   │   ├── prompt.md
│   │   ├── naivefolk01.png
│   │   └── naivefolk02.png
│   ├── bauhaus/
│   └── risograph/
├── output/
│   ├── morph/
│   └── floating/
├── src/
│   └── components/
│       └── promptbuilder/   # 부가 기능 UI
├── IMAGE-STUDIO.md
├── PROMPT-BUILDER.md
├── README.md
└── package.json

image-assets/
├── projects/
│   ├── morph/
│   └── floating/
└── README.md
```

- 폴더명은 간결한 영문 소문자, 하이픈 최소화
- 스타일 프롬프트는 `reference/{style}/prompt.md`에만 저장
- 레퍼런스 이미지는 `{style}01.png`, `{style}02.png` 형식
- `output/`은 화풍이 아닌 **프로젝트명**으로 분류
- 이미지 중복 저장 및 별도 스타일별 조합 프롬프트 파일 생성 금지

## 3. 메뉴 및 화면

### Gallery — 기본 화면

- 프로젝트별 생성 이미지 Masonry Grid, 검색·필터
- 이미지 확대, 다운로드, 삭제, 크기·용량 확인
- 공개 상태 표시 및 이미지별 Publish 실행
- 이미지 추가·삭제 시 갤러리 자동 갱신
- 이미지 감상을 방해하는 대시보드·통계 UI 제외

### Reference

- 화풍별 카드, 레퍼런스 미리보기, 검색
- `prompt.md` 확인·복사, 스타일 추가·관리
- `prompt.md`는 Style, Shape, Line, Color, Texture, Typography, Avoid를 포함한 **영문 상세 스타일 지침**으로 작성
- 특정 피사체·구도에 종속되지 않도록 구성하며 레퍼런스 이미지는 선택 사항

### Prompt Builder

- 별도 부가 메뉴로 제공
- 기능과 데이터 규칙은 `PROMPT-BUILDER.md`에서만 관리

### Publish

- 이미지별 공개 승인·취소
- 승인한 이미지만 Public 저장소에 업로드
- CDN URL 생성·복사
- 공개 취소 후에도 CDN 캐시 및 외부 복사본이 즉시 사라진다고 보장하지 않음

## 4. PNG 관리 및 최적화

- 모든 이미지는 PNG 유지
- GitHub 업로드 전에 자동 최적화하고 최적화본만 기본 저장
- 원본 비율·투명도 유지, 불필요한 메타데이터 제거
- 해상도 변경은 사용자 설정에 따름
- 원본보다 용량이 커지거나 품질 저하가 크면 원본 유지
- 최적화 전후 용량 비교 제공; 원본·최적화본 중복 보관 최소화
- 최적화 작업은 Codex 환경 또는 GitHub Actions에서 실행
- GitHub 파일 크기 제한 및 바이너리 변경 이력에 따른 저장소 증가 고려

## 5. 공개 및 재사용

1. Private 이미지 선택 → 최적화본 확인
2. 사용자가 **Publish** 클릭 → `image-assets/projects/{project}/`에 업로드
3. CDN URL 제공 및 복사

```text
https://cdn.jsdelivr.net/gh/USERNAME/image-assets@main/projects/morph/image.png
```

- 외부 프로젝트에서는 CDN URL을 사용하거나 Codex가 파일을 복사하도록 지시
- Private 이미지 복사는 인증된 GitHub 접근이 필요

## 6. 배포 및 보안

- 정적 React 프런트엔드 + Cloudflare Workers API
- Private 데이터 조회·변경·Publish는 **서버 측 관리자 인증 필수**
- GitHub 토큰은 Workers Secrets에만 저장; 브라우저 코드·공개 빌드에 포함 금지
- Private 레퍼런스·이미지는 인증된 API로 제공
- GitHub Pages 배포 가능 여부를 저장소 공개 범위와 계정 플랜 기준으로 확인; Private 저장소 Pages가 불가능하면 Cloudflare Pages 무료 호스팅 사용
- 이미지 lazy loading 및 반응형 구성
- 데이터베이스·유료 스토리지는 초기 구축에서 제외
- 무료 플랜·오픈소스 우선, 비용 발생 가능 시 사전 안내

## 7. 데이터 동기화

- GitHub API로 `reference/`, `output/` 파일 목록을 읽어 자동 갤러리 구성
- 폴더 추가 시 수동 목록 갱신 최소화
- README에는 구조와 사용법만 간결하게 기재

## 8. 구현 순서

- **Phase 1 — GitHub:** 인증 확인, Private/Public 저장소 생성, 기본 구조·README
- **Phase 2 — 이미지 관리:** Reference, Output, PNG 최적화
- **Phase 3 — Gallery:** Gallery 중심 UI, Reference, 검색·미리보기·다운로드
- **Phase 4 — Publish/Deploy:** 관리자 인증, GitHub API, Publish, CDN, 배포

각 Phase는 사용자가 요청할 때만 진행한다. 기존 파일을 불필요하게 변경하거나 중복 기능을 만들지 않는다. Prompt Builder 구현은 별도 `PROMPT-BUILDER.md`의 Step을 따른다.
