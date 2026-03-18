# UI Dev 2 Design Merge Design

## Goal
`ui_dev_2`의 시각 변경만 현재 앱에 병합하되, 현재 배포판의 런타임 동작은 유지한다.

## Scope
- 반영: `web/index.html`, `web/styles.css`, `web/views/*`, 신규 디자인 이미지 자산
- 유지: `web/audio.js`, `web/app.js`의 모바일 입장 코드 안정화, API/state/라우팅 로직, 기존 `audio_1.mp3`
- 제외: `ui_dev_2`의 이름이 어긋난 자산(`audio_1_.mp3`) 및 사용되지 않는 임시 파일

## Invariants
1. 배경음 경로는 계속 `./assets/audio_1.mp3` 이어야 한다.
2. `ENTRY` 화면에서 타이핑 중 `#entryCode` DOM 노드는 교체되면 안 된다.
3. 기존 편지/댓글/우체통 기능은 DOM 구조 변경에도 계속 동작해야 한다.

## Merge Strategy
- 현재 앱을 기준으로 유지해야 하는 로직 변경을 먼저 보호 테스트로 고정한다.
- `ui_dev_2`에서 필요한 마크업/스타일/이미지 자산만 선택적으로 병합한다.
- `app.js`와 `audio.js`는 현재 버전을 유지하면서, 새 디자인이 요구하는 클래스/이미지 참조만 맞춘다.
- 마지막에 로컬 렌더와 핵심 테스트로 회귀를 점검한 뒤 `gh-pages`에 동기화한다.
