# Unused Code/Asset Cleanup Design (uiux-polish + gh-pages)

## Goal
정식 배포 기준(`gh-pages`)과 최신 개발 기준(`codex/uiux-polish`)에서 실제로 사용하지 않는 코드/에셋을 정리해 유지보수 비용을 낮추고, 이후 `main`을 최신 상태로 동기화한다.

## Scope
- 포함: 프론트엔드 정적 코드(`web/*`)와 배포본(`gh-pages` 루트)에서 미사용 함수/파일/에셋 정리
- 포함: 삭제 안전성 검증 테스트 추가 및 유지
- 포함: 동일 정리를 `codex/uiux-polish` → `gh-pages` → `main` 순으로 반영
- 제외: GAS 백엔드 로직 변경, 데이터 스키마 변경

## Constraints
- `mock API`는 유지한다. (로컬 UI/에셋 검증 경로 보존)
- "사용하지 않음"의 기준은 런타임 참조 + 테스트 참조 + 배포 참조를 모두 만족해야 한다.
- 삭제는 증거 기반(`rg` 참조 결과 + 테스트)으로만 진행한다.

## Candidate Cleanup Targets
현재 참조 스캔 기준 1차 후보:
- `web/assets/letter-paper.png`
- `web/assets/post.png`
- `web/assets/post_2.png`
- 배포본 대응 파일:
  - `assets/letter-paper.png`
  - `assets/post.png`
  - `assets/post_2.png`

## Architecture / Approach
1. `codex/uiux-polish`에서 참조 그래프(코드/테스트/배포)로 미사용 후보를 확정한다.
2. 실패 테스트(레거시 에셋 참조 금지, 필수 에셋 존재)를 먼저 작성한다.
3. 최소 삭제를 적용해 테스트를 통과시킨다.
4. 동일 변경을 `gh-pages`에 동기화하고 배포 브랜치를 푸시한다.
5. 정리 완료된 `codex/uiux-polish`를 `main`으로 동기화한다.

## Data/Runtime Flow Impact
- 앱 런타임 참조 에셋은 `Dear_Hope.png`, `From.png`, `post_3.png`, `audio_1.mp3`로 유지
- 미사용 에셋 제거로 네트워크 전송량과 저장소 잡음을 줄이며 동작 로직은 변경하지 않는다.

## Error Handling
- 정리 중 테스트 실패 시 즉시 삭제 중단 후 참조 누락을 역추적한다.
- 브랜치별 파일 구조 차이로 충돌 시, 소스(`codex/uiux-polish`)를 정본으로 삼아 재동기화한다.

## Verification Strategy
- 단위 테스트: 프론트 API/상태/뷰 렌더 관련 기존 테스트 + 신규 정리 검증 테스트
- E2E 테스트: 우체통 로딩, 편지 상세 진입, 댓글 생성 핵심 경로 확인
- 배포 검증: `gh-pages` HEAD 파일 목록/참조 문자열 재확인

## Rollout Plan
1. `codex/uiux-polish` 정리 및 테스트 통과
2. `gh-pages` 반영 및 푸시
3. `main` 동기화 및 테스트 통과
4. 변경 파일/검증 로그 요약 보고
