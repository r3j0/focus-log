# Backend / Account

하나의 NestJS 백엔드 서버 안에서 사용자 계정, GitHub 인증, 프로필과 사용자 설정을 담당하는
모듈입니다. 이 문서는 Account 구현 전에 다른 모듈이 의존할 데이터와 인증 계약을 정의합니다.

> 현재 단계는 설계 문서 작성이며 PostgreSQL 연결, TypeORM Entity, Migration, API 코드는 아직
> 구현하지 않습니다.

## 담당 범위

- GitHub OAuth 로그인과 서비스 인증 토큰 발급
- 사용자와 프로필 데이터 구조
- 사용자 설정과 공개 프로필
- Account 소유 테이블의 Migration
- 인증 Guard, 현재 사용자 데코레이터와 공용 인증 타입
- 회원 탈퇴와 Account 인증 정보 비활성화

다음 항목은 Platform 담당 범위이므로 Account에서 구현하지 않습니다.

- StudySession과 DailyStudyRecord
- 집중 세션 상태와 집중 시간 계산
- Presence와 `isStudying` 상태
- 날짜별 집중 기록 집계
- Random Discovery API

## 확정된 공통 기준

- 데이터베이스: PostgreSQL
- ORM: TypeORM
- 내부 사용자 식별자: UUID v4
- GitHub 계정 ID와 서비스 내부 사용자 ID를 분리
- DB 시각: UTC 기준 `timestamptz(3)`로 저장
- DB 컬럼명: `snake_case`
- TypeScript 속성명: `camelCase`
- Account와 Platform은 같은 NestJS 서버와 DB 연결을 사용
- 개발 및 운영 환경에서 TypeORM `synchronize`를 사용하지 않고 Migration으로 스키마를 변경

현재 저장소에는 PostgreSQL·TypeORM 의존성, DB 연결과 Migration 설정이 없습니다. 실제 구현 단계에서
백엔드 공통 영역에 추가하고 Platform 담당자에게 변경 범위와 Migration 순서를 공유합니다.

## User 스키마

Entity 이름은 `User`, PostgreSQL 테이블 이름은 `users`로 사용합니다.

| 컬럼         | PostgreSQL 자료형 | NULL | 제약/기본값           | 설명                     |
| ------------ | ----------------- | ---- | --------------------- | ------------------------ |
| `id`         | `uuid`            | 불가 | PK, UUID v4 자동 생성 | Focus Log 내부 사용자 ID |
| `github_id`  | `bigint`          | 불가 | UNIQUE                | GitHub가 부여한 계정 ID  |
| `created_at` | `timestamptz(3)`  | 불가 | 생성 시각             | 가입 시각                |
| `updated_at` | `timestamptz(3)`  | 불가 | 수정 시각             | 마지막 수정 시각         |
| `deleted_at` | `timestamptz(3)`  | 가능 | 기본값 `NULL`         | 소프트 탈퇴 시각         |

### 사용자 ID 계약

- Platform의 `StudySession.userId`와 `DailyStudyRecord.userId`는 `users.id`를 참조합니다.
- PostgreSQL 자료형은 `uuid`, TypeScript 타입은 `string`입니다.
- GitHub ID는 PostgreSQL `bigint`로 저장하며 JavaScript 정밀도 문제를 피하기 위해 TypeScript에서는
  `string`으로 취급합니다.
- JWT의 사용자 식별 값인 `sub`에는 `github_id`가 아니라 내부 `users.id`를 넣습니다.
- User에는 `isStudying`이나 집중 기록을 저장하지 않습니다.

## Profile 스키마

Entity 이름은 `Profile`, PostgreSQL 테이블 이름은 `profiles`로 사용합니다. User와 Profile은 1:1
관계이며 `user_id`를 Profile의 기본키이자 User 외래키로 사용합니다.

| 컬럼         | PostgreSQL 자료형 | NULL | 제약/기본값         | 설명                     |
| ------------ | ----------------- | ---- | ------------------- | ------------------------ |
| `user_id`    | `uuid`            | 불가 | PK, FK → `users.id` | 프로필 소유자            |
| `nickname`   | `varchar(50)`     | 불가 |                     | 서비스 표시 이름         |
| `avatar_url` | `text`            | 가능 |                     | GitHub 프로필 이미지 URL |
| `github_url` | `text`            | 가능 |                     | GitHub 프로필 URL        |
| `bio`        | `varchar(255)`    | 가능 |                     | 공개 자기소개            |
| `character`  | `varchar(50)`     | 불가 | 팀 기본 캐릭터 ID   | 선택한 캐릭터 ID         |
| `background` | `varchar(50)`     | 불가 | 팀 기본 배경 ID     | 선택한 배경 ID           |
| `is_public`  | `boolean`         | 불가 | 기본값 `true`       | 공개 프로필 노출 여부    |
| `created_at` | `timestamptz(3)`  | 불가 | 생성 시각           | 프로필 생성 시각         |
| `updated_at` | `timestamptz(3)`  | 불가 | 수정 시각           | 프로필 수정 시각         |

닉네임의 중복 허용 여부, 기본 캐릭터·배경 ID는 프론트엔드 담당자와 식별자 목록을 맞춘 뒤
Migration 구현 전에 확정합니다.

## Auth 흐름

Focus Log는 닉네임·비밀번호 로그인을 구현하지 않고 GitHub OAuth만 사용합니다.

```text
Electron 앱
  → 시스템 브라우저로 GET /auth/github 열기
  → Backend가 state를 생성하고 GitHub 인증 화면으로 이동
  → 사용자가 GitHub 로그인과 접근을 승인
  → GitHub가 GET /auth/github/callback?code=...&state=... 호출
  → Backend가 state를 검증하고 code를 GitHub access token으로 교환
  → GitHub 사용자 정보를 조회
  → github_id로 User 조회
      ├─ 최초 로그인: User와 Profile 생성
      └─ 기존 로그인: 기존 User 사용, 필요한 GitHub 프로필 정보 동기화
  → Backend가 Focus Log 내부 User UUID를 기준으로 서비스 인증 발급
  → Electron 앱이 인증 완료 후 /users/me로 현재 사용자 확인
```

### OAuth 보안 기준

- GitHub Client Secret은 백엔드 환경변수로만 관리하고 클라이언트에 전달하지 않습니다.
- OAuth 요청마다 `state`를 생성하고 callback에서 검증합니다.
- GitHub access token은 클라이언트에 전달하지 않습니다.
- Focus Log 기능에 GitHub API의 지속 사용이 필요하지 않으면 GitHub access token을 장기 보관하지
  않습니다.
- Electron 복귀 URL에 Access Token이나 Refresh Token 원문을 직접 넣지 않습니다.
- Electron 복귀 방식과 일회용 인증 코드 교환 규격은 Desktop 담당자와 확정합니다.

## 서비스 인증 계약

서비스 API 인증은 Access Token을 사용하는 Bearer 인증을 기준으로 설계합니다. Refresh Token 도입과
Electron 저장 방식은 Desktop 담당자와 최종 확정합니다.

```http
Authorization: Bearer <access-token>
```

Access Token의 최소 payload는 다음과 같습니다.

```json
{
  "sub": "Focus Log 내부 User UUID"
}
```

Platform이 재사용할 Account 인증 요소는 다음과 같습니다.

| 구분      | 이름                | 계약                                  |
| --------- | ------------------- | ------------------------------------- |
| Guard     | `JwtAuthGuard`      | Access Token 검증 후 인증 사용자 생성 |
| Decorator | `@CurrentUser()`    | 인증된 사용자 객체 반환               |
| Type      | `AuthenticatedUser` | `{ userId: string }`                  |

```ts
interface AuthenticatedUser {
  userId: string;
}
```

Platform은 클라이언트가 body, query 또는 path로 전달하는 `userId`를 소유권 판단에 사용하지 않습니다.
항상 Guard가 검증한 `@CurrentUser().userId`를 StudySession과 DailyStudyRecord의 소유자로 사용합니다.

## Account API 초안

구현 단계에서 아래 API를 기준으로 Controller와 DTO를 구체화합니다.

| Method   | Path                    | 인증          | 역할                    |
| -------- | ----------------------- | ------------- | ----------------------- |
| `GET`    | `/auth/github`          | 불필요        | GitHub OAuth 시작       |
| `GET`    | `/auth/github/callback` | 불필요        | GitHub callback 처리    |
| `POST`   | `/auth/refresh`         | Refresh Token | Access Token 갱신       |
| `POST`   | `/auth/logout`          | 필요          | 현재 인증 세션 종료     |
| `GET`    | `/users/me`             | 필요          | 현재 사용자 계정 조회   |
| `GET`    | `/profiles/me`          | 필요          | 현재 사용자 프로필 조회 |
| `PATCH`  | `/profiles/me`          | 필요          | 현재 사용자 프로필 수정 |
| `DELETE` | `/users/me`             | 필요          | 회원 탈퇴 요청          |

공개 프로필 조회 API와 DTO는 Platform의 Discovery API에서 필요한 필드를 확인한 뒤 확정합니다.

## 회원 탈퇴

- Account는 `users.deleted_at`을 기록하는 소프트 탈퇴를 기본 방식으로 사용합니다.
- 탈퇴 즉시 서비스 인증을 차단하고 발급된 인증 세션을 무효화합니다.
- 탈퇴 사용자의 Profile은 외부에 노출하지 않습니다.
- StudySession과 DailyStudyRecord의 삭제·보존·익명화 정책은 Platform 담당자와 함께 결정합니다.
- 해당 정책을 합의하기 전에는 Platform 기록에 대한 연쇄 삭제를 설정하지 않습니다.

## 모듈 간 협의가 필요한 사항

### Platform

- Account Migration을 Platform Migration보다 먼저 적용하는 순서
- `users.id uuid` 외래키와 회원 탈퇴 시 `ON DELETE` 정책
- 탈퇴 사용자의 공부 기록 보존·익명화·삭제 정책
- Discovery가 공개 Profile을 조회하는 모듈 간 인터페이스

### Desktop / Focus

- OAuth 완료 후 Electron 앱으로 복귀하는 딥링크 규격
- 일회용 인증 코드 교환 여부와 API 규격
- Access/Refresh Token 수명과 안전한 로컬 저장 위치
- 로그인 갱신, 로그아웃과 만료 처리 방식

### Visual / Voyage

- `character`, `background` 식별자 목록과 기본값
- 공개 프로필에 표시할 필드
- 비공개 프로필의 화면 처리 방식

### 서버 공통

- TypeORM DataSource 위치와 Migration 명령
- DB 환경변수 이름, 개발·테스트 DB와 운영 SSL 설정
- 인증 실패와 접근 권한 오류의 공통 응답 형식

서버 진입점, 환경변수와 DB 연결은 `backend/` 공통 구성을 사용합니다. 이 폴더에 별도의 서버 실행
설정이나 `package.json`을 만들지 않습니다.
