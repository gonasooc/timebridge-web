# 기술 명세

2026-10-02에 코칭 MVP 내부 시안의 코드와 설정을 확인했다. 시스템 경계는 [docs/architecture.md](architecture.md), 제품 정책은 [docs/plan.md](plan.md), 실제 검증 결과는 [docs/work/W-002-main-coaching-mvp.md](work/W-002-main-coaching-mvp.md)에서 관리한다.

## 기술 구성

| 항목 | 확인한 구성 | 근거 |
| --- | --- | --- |
| 언어 | HTML, CSS, JavaScript. 패키지 모듈 형식은 ESM | [package.json](../package.json), [src/main.js](../src/main.js) |
| 빌드·개발 서버 | Vite. 선언 범위 `^8.1.5`, 잠금 파일 해석 버전 `8.1.5` | [package.json](../package.json), [pnpm-lock.yaml](../pnpm-lock.yaml) |
| CSS | Tailwind CSS와 Vite 플러그인. 선언 범위 `^4.3.3`, 잠금 파일 버전 `4.3.3` | [package.json](../package.json), [src/styles.css](../src/styles.css), [src/coaching.css](../src/coaching.css) |
| 패키지 관리자 | `pnpm@10.33.1` 선언 | [package.json](../package.json) |
| Node.js | `engines`는 `>=20.19.0`, `.nvmrc`는 `22.13.1` | [package.json](../package.json), [.nvmrc](../.nvmrc) |
| 화면 구성 | 프레임워크 없이 `index.html` 하나를 빌드하고 해시로 네 화면 전환 | [vite.config.js](../vite.config.js), [src/main.js](../src/main.js) |
| HTML 전개 | 저장소 내부의 `htmlPartials` 플러그인 | [vite.config.js](../vite.config.js) |
| 폰트 | jsDelivr의 Pretendard `v1.3.9`. 제목·본문·인용·입력 모두 동일 서체 | [partials/head.html](../partials/head.html) |
| 가상 콘텐츠 | 정적 JavaScript 데이터의 인물·질문·대화·안내 | [src/sample-data.js](../src/sample-data.js) |
| 브라우저 테스트 | `@playwright/test` 선언 범위 `^1.58.2`, 잠금 파일 버전 `1.63.0` | [package.json](../package.json), [pnpm-lock.yaml](../pnpm-lock.yaml), [playwright.config.js](../playwright.config.js) |
| 서버·데이터 저장 | 서버 없음. 방향의 열거 값만 `sessionStorage`에 저장, 상담 입력은 현재 문서에서만 유지 | [src/main.js](../src/main.js) |
| 정적 검사 | lint·typecheck 명령 없음 | [package.json](../package.json) |

환경 변수 `VITE_SITE_URL`은 canonical·OG 페이지 주소에 사용한다. 실제 값은 환경 파일에서 관리하며 운영 도메인·호스팅은 미정이다. 이전 앱의 별도 정책 페이지와 PNG 자산은 현재 빌드에 포함하지 않는다.

## 지켜야 할 구현 규칙

- 설치·실행은 선언된 pnpm을 기준으로 한다. 의존성을 변경하면 선언 파일과 잠금 파일을 함께 확인한다.
- 공용 HTML은 [vite.config.js](../vite.config.js)의 include 방식에 맞춰 관리한다. 기본 스타일과 코칭 스타일의 책임은 [docs/architecture.md](architecture.md), 화면 기준은 [docs/design.md](design.md)를 따른다.
- 방향 선택값은 허용 목록으로 검증한다. 저장소에서 읽은 값에도 같은 검증을 적용하며, 저장소 사용 불가 상태를 처리한다.
- 상담 입력은 `textContent`로 표시한다. 연락처와 이름을 URL, 웹 저장소, 분석 이벤트, 콘솔 로그에 기록하거나 외부로 전송하지 않는다.
- 폼에는 `method="dialog"`를 두고 `submit` 이벤트의 기본 동작을 막는다. JavaScript 초기화 전에는 제출 버튼을 비활성화한다. 현재 버튼은 초안을 확인하는 용도이며 실제 접수 성공을 표시하지 않는다.
- 상담 초안은 초기화·지우기·문서 이탈·뒤로 가기 캐시 복원 시 비운다. 방향 선택만 같은 탭의 새로고침 후 복원한다.
- 라이브러리·CLI 사용법이나 설정을 조사할 때는 [AGENTS.md](../AGENTS.md)의 Context7 지침을 따른다. 이 문서의 구성 정보는 저장소 코드와 잠금 파일로 확인했다.

실제 접수 API, 서버 입력 검증, 중복 제출 방지, 데이터 접근·운영자 인증은 후속 구현 사항이다. 접수 조건과 운영 정책은 [docs/plan.md](plan.md)를 따른다.

## 실행과 검증

명령은 [package.json](../package.json), 브라우저 환경은 [playwright.config.js](../playwright.config.js)에 정의한다. 빌드와 브라우저 테스트의 최종 결과·실행 환경·미검증 범위는 [docs/work/W-002-main-coaching-mvp.md](work/W-002-main-coaching-mvp.md)에 기록한다.

| 목적 | 명령 또는 확인 방법 | 필요한 조건 |
| --- | --- | --- |
| 준비 | `pnpm install` | 선언된 Node.js와 pnpm, 의존성 확보 |
| 개발 실행 | `pnpm dev` | 의존성 설치 |
| 빌드 | `pnpm build` | 의존성 설치, 사이트 주소 환경 설정 확인 |
| 빌드 미리보기 | `pnpm preview` | 빌드 산출물 존재 |
| 브라우저 준비 | `pnpm exec playwright install chromium` | 테스트 브라우저 다운로드 가능 환경 |
| 브라우저 테스트 | `pnpm test:e2e` | Playwright Chromium 설치, `127.0.0.1:4173` 개발 서버 실행 가능 환경 |
| JavaScript 문법 확인 | `node --check src/main.js`, `node --check src/sample-data.js` | Node.js |
| 문서 검증 | 상대경로 대상 확인, `git diff --check` | 저장소 파일 |
| 화면 확인 | 네 화면의 모바일·데스크톱 표시, 키보드·포커스·필수 입력·초안 처리 | 브라우저와 실제 확인 기록 |

Playwright는 데스크톱 Chrome과 Pixel 7을 에뮬레이션한 두 Chromium 프로젝트를 실행한다. 테스트용 서버는 `pnpm dev --host 127.0.0.1 --port 4173 --strictPort`로 시작하며, CI 외 환경에서는 해당 주소의 기존 서버를 재사용한다. 테스트 실패 시 스크린샷과 trace를 남긴다.

[tests/browser/coaching.spec.js](../tests/browser/coaching.spec.js)는 네 화면 이동, 필수 선택, 주제 변경·선택 복원, 직접 주소 접근, 이메일 검증, 연락처의 미전송·미저장, 입력 문자열의 텍스트 처리와 키보드 포커스를 확인한다. 자동 검사 통과는 모든 브라우저·실기기 접근성이나 운영 접수 검증을 뜻하지 않는다.

## 알려진 기술 제약

현재 서비스는 외부 폰트 리소스를 사용하며 폼 동작에는 JavaScript가 필요하다. 상담 저장·결제·분석·AI 전사를 처리할 서버 코드는 없다. 신청 저장소·회신 경로·AI 전사 도구·보관 및 삭제 구성·호스팅·CI는 미정이다.

시안의 `noindex, nofollow`와 `robots.txt`의 `Disallow: /`는 접근 통제가 아니다. 공개 모집 전 검색 안내, 실제 접수 경로와 배포 조건을 함께 검토한다. 빌드 성공이나 초안 표시를 공개 배포·상담 접수·결제 완료로 기록하지 않는다.
