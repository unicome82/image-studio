# IMAGE STUDIO 작업 지침

- 사용자 최신 요청과 `IMAGE-STUDIO.md`, `PROMPT-BUILDER.md`를 따른다.
- React + TypeScript + SCSS를 유지하고, 변경 범위에 필요하지 않은 기능을 추가하지 않는다.
- 컴포넌트와 해당 SCSS를 함께 관리한다. 공통 색상은 `src/styles/_variable.scss`, 공통 입력·버튼·스크롤바·레이아웃은 `src/styles/`에서 관리한다. `src/styles.scss`는 공통 스타일 진입점으로만 사용한다.
- 태그 기본값 초기화는 `src/styles/_reset.scss`에서 관리한다. 반복되는 스타일 묶음은 `src/styles/_mixin.scss`에 정의하고 `@include`로 재사용한다.
- 기존의 담당 규칙을 수정한다. 파일 하단에 과거 레이아웃을 덮어쓰는 규칙을 누적하거나 미사용 선택자를 남기지 않는다. 반응형 규칙은 해당 컴포넌트 파일에 모으고 과도한 중첩과 `!important`를 피한다.
- 아이콘은 `Icon.tsx`와 jsDelivr CDN의 Material Symbols Outlined를 사용한다. 로컬 아이콘 파일이나 별도 아이콘 라이브러리를 추가하지 않는다.
- 폰트는 버전이 고정된 Pretendard CDN을 사용한다. 일반 텍스트는 최소 10px을 유지하고, 빌더 옵션 버튼은 11px·보통 굵기를 사용한다. 버튼 텍스트는 대문자로 표시한다.
- 일반 입력 textarea는 흰색, 생성 프롬프트 textarea는 `prompt-textarea` 클래스의 무채색 배경으로 구분한다. textarea의 resize는 비활성화한다.
- 텍스트가 있는 버튼의 아이콘은 Copy·Publish에만 사용하고, 아이콘 전용 버튼은 유지한다. Typography는 토글 ON일 때 제목 바로 아래에 옵션 버튼과 같은 높이의 입력창, 그 아래 전체 옵션을 표시한다. OFF에서는 입력창과 옵션을 숨기고 별도 펼치기·접기 버튼을 사용하지 않는다.
- 접힌 옵션은 Material Symbols 펼치기·접기 버튼을 포함해 한 줄 안에 배치하고, Builder 폭에 따라 개수를 측정한다.
- 프롬프트 상세 내용은 `reference/**/prompt.md`를 단일 원본으로 유지한다. UI 수정 중 기존 프롬프트·레퍼런스 이미지를 변경하거나 중복 보관하지 않는다. 이미지 생성은 별도 사용자 요청이 있을 때 진행한다.
- `npm run format`으로 포맷하고 `npm run format:check`, `npm test`, `npm run build`를 확인한다. UI 변경은 실제 프로덕션 빌드의 데스크톱·모바일에서 영향을 받는 동작을 확인한다.
- GitHub 토큰이나 비밀값을 브라우저 코드·저장소·빌드 결과에 넣지 않는다. Publish는 권한 있는 게시 절차가 구현되기 전까지 비활성화한다.
