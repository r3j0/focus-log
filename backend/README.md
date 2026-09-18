# Backend

백엔드 팀은 **서버 하나**를 함께 개발합니다.
서버 실행, API 구성, 환경변수, 의존성, DB 연결과 배포 설정은 이 프로젝트에서 공통으로 관리합니다.

```text
backend/
├── README.md
└── src/
    └── modules/
        ├── account/   # 로그인, 사용자·프로필, 설정
        └── platform/  # 공부 세션, 접속 상태, 탐색 API
```

`account`와 `platform`은 동일 서버가 사용하는 기능 모듈입니다.
각 모듈을 별도 서버, 별도 배포 단위, 별도 workspace 패키지로 나누지 않습니다.
두 담당자는 같은 프로젝트에서 기능별 브랜치로 협업합니다.

## 서버 공통 사항

- 언어와 프레임워크를 정한 뒤 서버 진입점과 실행 명령을 공통으로 추가합니다.
- Node.js 기반이면 `backend/package.json` 하나에서 서버 전체의 의존성과 명령을 관리합니다.
- 다른 언어를 선택하면 해당 언어의 패키지·빌드 도구를 사용합니다.
- 환경변수와 DB 연결 설정은 서버 단위로 관리합니다.
- DB 스키마와 마이그레이션, 인증 정보 전달 방식, 오류 응답 형식은 두 역할이 함께 합의합니다.
- Platform 담당자가 배포·통합을 맡더라도 관련 설정은 서버 공통 위치에 둡니다.

현재는 역할을 설명하는 README만 있습니다.
`src/modules/`는 역할을 구분하기 위한 초기 경로이며,
선택한 언어나 프레임워크에 필수 소스 경로가 있으면 해당 규칙에 맞게 조정합니다.

## 역할 문서

- [Backend / Account](src/modules/account/README.md)
- [Backend / Platform](src/modules/platform/README.md)
