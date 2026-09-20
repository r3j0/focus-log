# Frontend Desktop App

`app/`은 Focus Log의 하나의 프론트엔드 프로젝트입니다. Next.js와 React가 화면을 담당하고,
Electron이 해당 화면을 Windows와 macOS 데스크톱 창으로 실행합니다. 모든 코드는 TypeScript로
작성합니다.

## 기술 스택

| 기술            | 버전   | 역할                                     | 관리 위치                      |
| --------------- | ------ | ---------------------------------------- | ------------------------------ |
| Electron        | 44.4.1 | Windows·macOS 데스크톱 창과 시스템 기능  | `package.json` devDependencies |
| Next.js         | 16.3.5 | React 화면의 페이지, 개발 서버, 빌드     | `package.json` dependencies    |
| React/React DOM | 19.3.0 | 화면 컴포넌트와 UI 렌더링                | `package.json` dependencies    |
| TypeScript      | 6.0.3  | 프론트엔드와 Electron 코드의 정적 타입화 | `package.json` devDependencies |

## 설치

레포 루트에서 잠금 파일에 기록된 버전 그대로 의존성을 설치합니다.

```sh
pnpm install --frozen-lockfile
```

## 검사

```sh
pnpm lint
pnpm typecheck
pnpm build
pnpm --dir app test:dev
```

| 명령             | 확인하는 내용                                                      |
| ---------------- | ------------------------------------------------------------------ |
| `pnpm lint`      | React·Next.js 코드의 규칙 위반과 잘못된 작성 방식을 검사합니다.    |
| `pnpm typecheck` | 프론트엔드와 Electron 코드의 TypeScript 타입 오류를 검사합니다.    |
| `pnpm build`     | Next.js 화면과 Electron 코드를 실제로 빌드할 수 있는지 확인합니다. |

`pnpm --dir app test:dev`는 잘못된 포트와 포트 충돌 시의 개발 실행 동작을 검증합니다.

검사 명령은 소스 코드를 자동으로 수정하지 않습니다. `pnpm build`가 만드는 `.next/`와
`dist-electron/`은 자동 생성 결과이므로 Git에 Commit하지 않습니다. 현재 빌드는 코드의 컴파일
가능 여부를 확인하며 Windows 설치 파일이나 macOS 앱 패키지를 만들지는 않습니다.

## 개발 실행

레포 루트에서 다음 명령을 실행합니다.

```sh
pnpm dev
```

이 명령은 Next.js 개발 서버, Electron TypeScript 컴파일러, Electron 앱을 함께 실행합니다.
실행을 종료하려면 터미널에서 `Ctrl+C`를 누릅니다.

기본 포트는 `3000`이며, `PORT`를 지정하면 Next.js 서버, 서버 준비 확인, Electron 창이
모두 같은 포트를 사용합니다. 선택한 포트가 이미 사용 중이면 다른 포트로 자동 이동하지 않고
오류로 종료합니다. `PORT`는 실행 전에 터미널 환경 변수로 지정합니다.

```sh
# macOS / Linux
PORT=3001 pnpm dev
```

```powershell
# Windows PowerShell
$env:PORT = '3001'
pnpm dev
```

`pnpm --dir app dev:next`와 `pnpm --dir app dev:electron`을 따로 실행할 때도 두 터미널에
같은 `PORT` 값을 설정합니다. 개발 명령은 `ELECTRON_RENDERER_URL`을 해당 로컬 서버 주소로
설정하므로 이 값을 별도로 지정할 필요가 없습니다.

## 디렉토리

- `electron/`: Electron main·preload 프로세스
- `src/app/`: Next.js 페이지와 레이아웃
- `src/features/focus/`: 집중 타이머, TODO, Floating Pet
- `src/features/voyage/`: 메인 항해 화면과 시각적 연출
- `src/types/`: 프론트엔드에서 사용하는 전역 타입

Electron 패키징과 배포 설정은 별도 작업에서 추가합니다.
