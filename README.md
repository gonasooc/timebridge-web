# timebridge-web

부모님의 이야기를 남기도록 돕는 8주 인터뷰 코칭 MVP입니다. 현재는 **소개 → 방향 선택 → 가상 샘플 → 상담 내용 미리보기**를 체험하는 내부 시안입니다. 실제 상담 접수·결제·AI 전사 기능은 연결하지 않았습니다.

프로젝트 현황은 [docs/README.md](docs/README.md), 상품 범위는 [docs/plan.md](docs/plan.md), 구현·검증 기록은 [docs/work/W-002-main-coaching-mvp.md](docs/work/W-002-main-coaching-mvp.md)에서 확인합니다.

## 실행

Node.js와 pnpm의 선언 버전은 [package.json](package.json), 자세한 조건은 [docs/specs.md](docs/specs.md)에 있습니다.

```bash
pnpm install
pnpm dev          # 개발 서버
pnpm build        # dist/ 생성
pnpm preview      # 빌드 결과 확인
pnpm test:e2e     # 데스크톱·모바일 Chromium에서 사용자 흐름 검사
```

브라우저가 없는 환경에서는 먼저 `pnpm exec playwright install chromium`을 실행합니다.

## 현재 화면

| 주소 | 내용 |
| --- | --- |
| `/#home` | 상품 소개, 진행 과정, 가격·포함 범위, FAQ |
| `/#direction` | 부모님·출생 연대·관심 주제·걱정 선택 |
| `/#sample` | 선택에 맞는 질문·목표, 고정 가상 인물의 전사·피드백 예시 |
| `/#consult` | 가상 연락처로 작성하는 상담 내용 미리보기 |

방향 선택값만 같은 탭의 `sessionStorage`에 보관합니다. 상담 폼은 입력 내용을 서버·브라우저 저장소·URL로 보내지 않으며 새로고침하면 비워집니다. 모든 인물·대화·피드백 예시는 창작입니다.

## 구조

Vite와 Tailwind CSS, 프레임워크 없는 JavaScript를 사용합니다. HTML 하나 안의 네 화면을 해시 주소로 전환합니다.

- [index.html](index.html): 화면과 폼.
- [src/main.js](src/main.js): 화면 전환, 선택값 검증, 샘플 조합, 상담 초안 표시.
- [src/sample-data.js](src/sample-data.js): 가상 인물과 세 주제의 질문·대화·피드백.
- [src/coaching.css](src/coaching.css): 코칭 화면의 색·타이포·레이아웃·입력 상태.
- [src/styles.css](src/styles.css): 공통 초기화·기본 글꼴·모션 감소 설정.
- `partials/`: 공통 메타·헤더·푸터. [vite.config.js](vite.config.js)의 include 플러그인으로 전개.
- [tests/browser/coaching.spec.js](tests/browser/coaching.spec.js): 사용자 흐름과 연락처 비전송 검사.

## 다음 단계

상담 저장소·운영자 조회·회신 수단을 결정하고 실제 접수를 연결합니다. 호스팅·공개 주소·결제 수단·AI 전사 도구는 미정입니다.

이전 무료 앱의 정책·지원 페이지와 전용 자산은 제거했습니다. 새 정책은 실제 수집·처리·보관 방식을 정한 뒤 작성합니다. 시안에는 `noindex`와 검색 로봇 차단 안내를 넣었지만 접근 통제 기능은 아닙니다. 현재 상태를 공개 모집 완료로 간주하지 않습니다.

문서와 작업 기록은 [AGENTS.md](AGENTS.md)의 한국어 문서 규칙을 따릅니다.
