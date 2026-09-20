# Backend

백엔드 팀은 NestJS로 만든 **서버 하나**를 함께 개발합니다.
서버 실행, API 구성, 환경변수, 의존성, DB 연결과 배포 설정은 이 프로젝트에서 공통으로 관리합니다.

```text
backend/
├── package.json
├── nest-cli.json
├── README.md
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   └── modules/
│       ├── account/   # 로그인, 사용자·프로필, 설정
│       ├── health/    # 서버 상태 확인 API
│       └── platform/  # 공부 세션, 접속 상태, 탐색 API
└── test/              # HTTP 통합 테스트
```

`account`와 `platform`은 동일 서버가 사용하는 기능 모듈입니다.
각 모듈을 별도 서버, 별도 배포 단위, 별도 workspace 패키지로 나누지 않습니다.
두 담당자는 같은 프로젝트에서 기능별 브랜치로 협업합니다.

## 개발 환경

- Node.js 26.7.0
- pnpm 11.18.0
- NestJS 12
- TypeScript 6
- Vitest 4

레포 루트에서 의존성을 설치합니다.

```sh
nvm use
pnpm install --frozen-lockfile
```

## 실행

개발 서버는 기본적으로 `http://localhost:3001`에서 실행됩니다.

```sh
pnpm dev:backend
```

포트를 바꾸려면 `backend/.env.example`을 복사해 `backend/.env`를 만들고 `PORT` 값을 변경합니다.
실제 `.env` 파일은 Git에 커밋하지 않습니다.

## 상태 확인 API

```http
GET /health
```

서버가 정상적으로 요청을 받을 수 있으면 HTTP 200과 다음 JSON을 반환합니다.

```json
{
  "status": "ok"
}
```

## 검사

레포 루트에서 다음 명령을 실행합니다.

```sh
pnpm build:backend
pnpm lint:backend
pnpm test:backend
pnpm format:check
```

- `build:backend`: 배포 가능한 JavaScript로 컴파일합니다.
- `lint:backend`: 잠재적인 코드 오류를 정적 검사합니다.
- `test:backend`: 단위 테스트와 실제 HTTP 요청 형태의 통합 테스트를 실행합니다.
- `format:check`: 저장소 전체가 공통 Prettier 규칙을 따르는지 확인합니다.

## 서버 공통 사항

- `backend/package.json` 하나에서 서버 전체의 의존성과 명령을 관리합니다.
- 환경변수와 DB 연결 설정은 서버 단위로 관리합니다.
- DB 스키마와 마이그레이션, 인증 정보 전달 방식, 오류 응답 형식은 두 역할이 함께 합의합니다.
- Platform 담당자가 배포·통합을 맡더라도 관련 설정은 서버 공통 위치에 둡니다.

`src/modules/`는 하나의 NestJS 서버 안에서 역할을 기능별로 구분하는 경로입니다.
각 역할 폴더에 별도 서버 설정이나 `package.json`을 만들지 않습니다.

## 역할 문서

- [Backend / Account](src/modules/account/README.md)
- [Backend / Platform](src/modules/platform/README.md)
