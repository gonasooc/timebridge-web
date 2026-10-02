# 아키텍처

2026-10-02에 코칭 MVP 내부 시안의 코드와 설정을 확인했다. 단일 HTML에서 네 화면을 전환하며 상담 입력은 브라우저에서만 확인한다. 제품 범위는 [docs/plan.md](plan.md), 기술 구성과 실행 명령은 [docs/specs.md](specs.md), 검증 결과는 [docs/work/W-002-main-coaching-mvp.md](work/W-002-main-coaching-mvp.md)에서 관리한다.

## 구성 요소와 책임

| 구성 요소 | 확인한 책임 | 근거 |
| --- | --- | --- |
| 단일 HTML | 소개·방향 선택·맞춤 샘플·상담 초안의 마크업, 폼, 메타 정보 | [index.html](../index.html) |
| HTML 공용 조각 | 공통 메타와 폰트, 헤더, 푸터 | [partials/head.html](../partials/head.html), [partials/header.html](../partials/header.html), [partials/footer.html](../partials/footer.html) |
| 클라이언트 코드 | 해시 기반 화면 이동, 선택값 복원·검증, 샘플 조합, 상담 초안 표시·초기화 | [src/main.js](../src/main.js) |
| 가상 샘플 데이터 | 인물 한 명, 주제별 질문·대화·피드백, 출생 연대·걱정별 안내 | [src/sample-data.js](../src/sample-data.js) |
| 기본 스타일 | Tailwind 불러오기, 기본 글꼴·줄바꿈·모션 감소 설정 | [src/styles.css](../src/styles.css) |
| 코칭 화면 스타일 | 코칭 화면의 색상·타이포·레이아웃·컨트롤 | [src/coaching.css](../src/coaching.css) |
| 개발·빌드 구성 | `index.html`을 진입점으로 지정하고 HTML 조각을 전개 | [vite.config.js](../vite.config.js) |
| 공개 자산 | 새 SVG 아이콘과 검색 로봇 안내 | [public/favicon.svg](../public/favicon.svg), [public/robots.txt](../public/robots.txt) |
| 브라우저 검증 | 데스크톱·모바일 Chromium에서 사용자 흐름과 입력 처리 확인 | [playwright.config.js](../playwright.config.js), [tests/browser/coaching.spec.js](../tests/browser/coaching.spec.js) |

이전 앱의 `privacy.html`, `terms.html`, `support.html`과 전용 정책·아이콘 조각, PNG 아이콘·OG 이미지는 제거했다. 새 상담용 정책과 자료 처리 경로는 실제 운영 구성에 맞춰 후속 구현한다.

## 화면과 데이터 흐름

```text
index.html + partials/ → Vite 빌드 → HTML·CSS·JS → 브라우저
                                                   ↓
                         #home → #direction → #sample → #consult
                                      ↓                   ↓
                              선택지 값만 보관       입력한 초안 확인
                              sessionStorage         현재 문서 안에서만
```

`#home`, `#direction`, `#sample`, `#consult`는 같은 HTML 안의 화면이다. `src/main.js`가 해시에 맞춰 패널을 숨기거나 표시하고 제목·포커스를 갱신한다. 필수 방향 선택이 없으면 샘플·상담 주소 접근 시 방향 선택으로 돌려보낸다. 브라우저의 이전·다음 이동도 같은 처리 경로를 사용한다.

선택한 대상·출생 연대·주제·걱정은 허용된 열거 값만 `timebridge:direction:v1` 키의 `sessionStorage`에 보관한다. 읽을 때도 허용 목록을 확인하며 저장소 접근이 실패해도 화면 사용을 이어간다. 질문과 안내는 정적 데이터를 조합하고, 전사 예시는 고정된 가상 인물의 창작 대화로 표시한다.

이름·이메일·상담 입력값은 현재 문서의 폼과 요약 DOM에만 존재한다. 연락처를 웹 저장소·URL·분석 이벤트에 넣는 코드나 서버 전송 코드는 없다. 초안 지우기, 문서 초기화, `pagehide` 및 뒤로 가기 캐시 복원 시 입력과 요약을 비운다. 서버 저장·운영자 확인·접수 성공 처리는 구현하지 않았다.

## 폴더와 구조 규칙

- `partials/`는 공용 HTML의 원본이다. `vite.config.js`의 플러그인이 include 주석을 파일 내용으로 바꾸고, 조각 변경 시 개발 서버에서 전체 새로고침을 수행한다.
- `src/main.js`는 화면 상태·검증을, `src/sample-data.js`는 가상 콘텐츠를 맡는다. 사용자 입력 문자열은 `textContent`로 표시한다.
- 두 폼은 `method="dialog"`를 사용하고 기본 제출을 차단한다. 초기 제출 버튼은 비활성화되어 있으며 스크립트 초기화 뒤 활성화한다. 실제 접수 연결 전에는 폼의 전송 기능을 추가하지 않는다.
- 스타일 책임은 기본 설정인 `src/styles.css`와 코칭 화면인 `src/coaching.css`로 나눈다. 시각·상호작용 기준은 [docs/design.md](design.md)를 따른다.
- `docs/`는 작업 맥락이며 빌드 진입점이 아니다. `dist/`, `test-results/`, `playwright-report/`는 생성 산출물로 Git에서 제외한다.

## 외부 연결과 제약

현재 외부 연결은 Pretendard 폰트 리소스다. 사용자 요청에 따라 전체 서체를 통일하고 Google Fonts 연결을 제거했다. 상담 API, 데이터베이스, 인증, 결제, 분석 도구, AI 전사 호출은 없다. 신청 저장·운영자 조회·회신에 필요한 서버 경계와 제공자는 미정이다.

`VITE_SITE_URL`은 canonical·OG 페이지 주소에 사용한다. 호스팅과 실제 공개 주소는 미정이다. 내부 시안에는 `noindex, nofollow` 메타와 `robots.txt`의 `Disallow: /`를 넣었지만, 이는 검색 로봇에 대한 안내이며 사용자 접근을 차단하지 않는다. 실제 접근 제한이 필요하면 호스팅 계층의 별도 구성이 필요하다.
