# Focus Log

네 명이 역할을 나누어 하나의 서비스를 개발하는 모노레포입니다.
프론트엔드는 Next.js와 Electron을 사용하며, 백엔드는 NestJS **서버 하나**로 구성합니다.

현재는 프론트엔드와 백엔드의 기본 실행 환경을 구성한 단계입니다.
DB 연결과 배포 설정은 이후 단계에서 추가합니다.

## 개발 환경

| 도구     | 버전    | 관리 위치                          |
| -------- | ------- | ---------------------------------- |
| Node.js  | 26.7.0  | `.nvmrc`                           |
| pnpm     | 11.18.0 | `package.json`의 `packageManager`  |
| Prettier | 3.9.7   | `package.json`의 `devDependencies` |

Node.js와 pnpm은 초기 설정 시 로컬에 설치된 버전을 기준으로 맞췄습니다.
`.nvmrc`는 사용할 Node.js 버전을 기록하고, `engines.node`는 지원할 버전 범위를 명시합니다.
이 파일들이 시스템의 Node.js 버전을 자동으로 바꾸지는 않습니다.

### 설치

먼저 위 버전의 Node.js와 pnpm을 준비합니다. nvm이 설치되어 있다면 레포 루트에서 다음을 실행합니다.

```sh
nvm install
nvm use
```

pnpm이 없거나 버전이 다르면 현재 Node.js 환경에 지정된 버전을 설치합니다.

```sh
npm install --global pnpm@11.18.0
```

버전을 확인한 뒤 공통 개발 도구를 설치합니다.

```sh
node --version
pnpm --version
pnpm install
pnpm format:check
```

`pnpm-lock.yaml`은 설치된 의존성 버전을 기록하는 파일로 Git에 함께 커밋합니다.
잠금 파일을 그대로 사용하는 설치 검증에는 `pnpm install --frozen-lockfile`을 사용합니다.

## 디렉토리 구조

```text
focus-log/
├── app/                         # Electron + Next.js 프론트엔드 프로젝트
│   ├── electron/                # 데스크톱 앱 실행 영역
│   │   ├── main.ts
│   │   ├── preload.ts
│   │   └── tsconfig.json
│   ├── src/
│   │   ├── app/                 # Next.js 페이지와 레이아웃
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── features/            # 역할별 기능 코드
│   │   │   ├── voyage/          # Visual / Voyage
│   │   │   │   └── README.md
│   │   │   └── focus/           # Desktop / Focus
│   │   │       └── README.md
│   │   └── types/
│   │       └── electron.d.ts
│   ├── AGENTS.md
│   ├── README.md
│   ├── package.json
│   ├── next.config.ts
│   ├── next-env.d.ts
│   ├── tsconfig.json
│   └── eslint.config.mjs
├── backend/                     # 서버 하나의 프로젝트 루트
│   ├── README.md
│   ├── package.json
│   ├── nest-cli.json
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   └── modules/
│   │       ├── account/         # 계정 관련 기능
│   │       ├── health/          # 서버 상태 확인 API
│   │       └── platform/        # 세션·접속 상태·탐색 기능
│   └── test/
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── .nvmrc
├── .gitignore
├── .prettierrc.json
├── .prettierignore
└── README.md
```

각 역할 폴더에는 범위와 협의할 사항을 적은 README를 둡니다.
Git은 이 파일을 통해 폴더를 기록하므로 `.gitkeep`은 필요하지 않습니다.

`app/`은 Electron과 Next.js를 함께 사용하는 프론트엔드 프로젝트 전체를 담는 폴더입니다.
`app/electron/`은 데스크톱 창과 운영체제 연결을 담당하고,
페이지와 URL은 `app/src/app/`, 기능 코드는 `app/src/features/`에서 관리합니다.
`features`는 팀에서 정한 이름으로 Next.js의 특별한 예약 폴더가 아닙니다.
설치와 실행 방법은 [`app/README.md`](app/README.md)를 참고합니다.

백엔드는 `backend/`에서 NestJS 실행과 공통 설정을 관리하며,
`account`와 `platform`은 **동일 서버 안의 기능 모듈**입니다.
서버 실행 방법과 상태 확인 API는 [`backend/README.md`](backend/README.md)를 참고합니다.

## 역할 분담

| 역할               | 기능 범위                                         | 설명                                               |
| ------------------ | ------------------------------------------------- | -------------------------------------------------- |
| Visual / Voyage    | 메인 화면, 캐릭터, 배경, 애니메이션, Pass-by 연출 | [Voyage](app/src/features/voyage/README.md)        |
| Desktop / Focus    | Floating Pet, 타이머, TODO, 클라이언트 상태       | [Focus](app/src/features/focus/README.md)          |
| Backend / Account  | GitHub OAuth, 사용자·프로필, 설정, DB             | [Account](backend/src/modules/account/README.md)   |
| Backend / Platform | 공부 세션, 접속 상태, 탐색 API, 배포·통합         | [Platform](backend/src/modules/platform/README.md) |

역할별 담당자 이름은 팀에서 배정을 확정한 뒤 각 README에 기록합니다.
공통 코드, API 규격, DB 스키마에 영향을 주는 변경은 관련 담당자와 함께 검토합니다.
Desktop / Focus의 별도 데스크톱 실행 환경이 필요한지는 앱 초기화 전에 결정합니다.

## pnpm workspace

`pnpm-workspace.yaml`은 `app/`, `backend/`를 프로젝트 루트로 지정합니다.
`app/package.json`과 `backend/package.json`이 각각 하나의 workspace 프로젝트입니다.
`backend/src/modules/` 아래의 역할별 폴더에는 별도의 `package.json`을 만들지 않습니다.

## 코드 포맷

```sh
pnpm format        # 파일의 코드 형식을 수정
pnpm format:check  # 수정 없이 형식 검사
```

`.prettierrc.json`에서 들여쓰기 2칸, 작은따옴표, 세미콜론, LF 줄바꿈 등의 규칙을 공유합니다.
Prettier는 코드 형식을 정리하며, 프로그램의 동작이나 버그를 검사하지는 않습니다.
백엔드 언어가 정해지면 그 언어에 맞는 포맷터와 검사 도구를 별도로 결정합니다.

## 환경변수

- 실제 설정값은 각 프로젝트의 `.env` 또는 프레임워크가 지원하는 환경변수 파일에서 관리합니다.
- `.env`, `.env.*`는 Git에서 제외합니다.
- 필요한 변수 이름이 정해지면 실제 비밀값 없이 `.env.example`을 만들어 커밋합니다.
- `.env`를 읽는 방식은 앱 초기화 시 설정합니다. 파일을 만드는 것만으로 모든 실행 도구에 적용되지는 않습니다.

## 브랜치와 협업

- `main`: 검토와 확인을 마친 코드를 모으는 기본 브랜치
- `feature/*`: 기능이나 설정 작업을 진행하는 브랜치

예를 들어 `feature/setup-monorepo`, `feature/focus-timer`, `feature/github-login`처럼 작업 이름을 붙입니다.
작업 브랜치에서 수정한 뒤 포맷 검사와 해당 기능의 검증을 마치고 Pull Request로 `main`에 병합합니다.
브랜치 보호와 자동 검사는 이후에 별도로 설정합니다.

## 참고 문서

- [pnpm workspace 설정](https://pnpm.io/settings#packages)
- [Prettier 설치와 포맷 검사](https://prettier.io/docs/install)
- [Next.js 프로젝트 구조](https://nextjs.org/docs/app/getting-started/project-structure)
