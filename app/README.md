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
```

| 명령             | 확인하는 내용                                                      |
| ---------------- | ------------------------------------------------------------------ |
| `pnpm lint`      | React·Next.js 코드의 규칙 위반과 잘못된 작성 방식을 검사합니다.    |
| `pnpm typecheck` | 프론트엔드와 Electron 코드의 TypeScript 타입 오류를 검사합니다.    |
| `pnpm build`     | Next.js 화면과 Electron 코드를 실제로 빌드할 수 있는지 확인합니다. |

세 명령은 소스 코드를 자동으로 수정하지 않습니다. `pnpm build`가 만드는 `.next/`와
`dist-electron/`은 자동 생성 결과이므로 Git에 Commit하지 않습니다. 현재 빌드는 코드의 컴파일
가능 여부를 확인하며 Windows 설치 파일이나 macOS 앱 패키지를 만들지는 않습니다.

## 개발 실행

레포 루트에서 다음 명령을 실행합니다.

```sh
pnpm dev
```

이 명령은 Next.js 개발 서버, Electron TypeScript 컴파일러, Electron 앱을 함께 실행합니다.
실행을 종료하려면 터미널에서 `Ctrl+C`를 누릅니다.

## 디렉토리

- `electron/`: Electron main·preload 프로세스
- `src/app/`: Next.js 페이지와 레이아웃
- `src/features/focus/`: 집중 타이머, TODO, Floating Pet
- `src/features/voyage/`: 메인 항해 화면과 시각적 연출
- `src/types/`: 프론트엔드에서 사용하는 전역 타입

Electron 패키징과 배포 설정은 별도 작업에서 추가합니다.
