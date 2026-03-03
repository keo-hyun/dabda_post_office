# Manual QA Cases

## Phase 1: Entry and Letter Submission
1. `/` 접속
2. 입장 코드에 `DABDA2026` 입력 후 `입장하기`
3. `편지 보내기` 화면 노출 확인
4. 1000자 이하 편지 작성 후 제출
5. 전환 안내 화면 노출 확인

## Transition: Locked State
1. `/?phase=TRANSITION` 접속 후 입장
2. 전환 안내 메시지 노출 확인
3. 편지 작성/우체통 접근 불가 확인

## Phase 2: Mailbox and Comments
1. `/?phase=PHASE_2` 접속
2. 입장 후 공개 편지 목록 노출 확인
3. 편지 상세 진입 후 댓글 작성
4. 작성 댓글이 즉시 목록에 반영되는지 확인

## Moderation API Sanity
1. 관리자 액션 요청 생성(`/api/admin/report-action`)
2. 코멘트 soft-delete 이후 `deleted_at` 필드 확인
