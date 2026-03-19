# Email Collection Design

## Goal
편지 작성 폼에 이메일 입력란을 추가하고, 해당 값을 `Letters` 시트에 저장한다. 동시에 더 이상 사용하지 않는 이미지 저장 관련 필드와 설정을 코드에서 제거한다.

## Scope
- 프론트 compose 폼에 이메일 입력 UI 추가
- 편지 제출 payload에 `email` 포함
- `Letters` 저장 객체/스키마에 `email` 반영
- `image_file_id` 및 드라이브 업로드 관련 저장 로직 제거

## Constraints
- 이메일 입력은 현재 compose 폼의 라인형 입력 스타일과 동일해야 한다.
- 현재 편지 작성/전송 플로우와 모바일 입력 안정화는 유지해야 한다.
- 시트는 이미 `content` 다음에 `email` 컬럼이 추가된 상태를 기준으로 한다.

## Validation
- 프론트 unit test: payload에 이메일 포함
- 백엔드 unit test: 이메일 저장 및 이미지 저장 제거 확인
- 스키마/unit test: `Letters` 컬럼 계약 갱신
