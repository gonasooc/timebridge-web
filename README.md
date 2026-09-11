# timebridge-web

TimeBridge 앱의 공개 랜딩 페이지입니다. 소개 페이지와 함께 스토어 제출에 필요한 개인정보처리방침, 서비스 이용약관,
지원·계정 삭제 안내를 HTTPS로 배포하기 위한 정적 사이트입니다.

- 색과 라운드 토큰은 앱의 `src/theme.ts`를 그대로 옮겼습니다. 레이아웃·타이포·모션 토큰은 웹에서 따로 정의합니다.
- 굵기는 Regular(400)과 Medium(500)만 씁니다. 위계는 굵기가 아니라 크기와 색으로 만듭니다.
- 섹션은 구분선 대신 여백과 표면 차이로 나눕니다. 장식용 그라데이션과 그림자는 쓰지 않습니다.
- 브랜드 마크는 앱의 `scripts/generate-brand-assets.js` 좌표를 SVG로 다시 그린 것입니다.
- 정책 원고는 앱 저장소 `docs/release_remaining_tasks.md`의 `2. A — 정책·지원 랜딩 페이지` 절 문안을 반영했습니다.

## 스택

pnpm + Vite(MPA) + Tailwind CSS v4. 프레임워크 없이 정적 HTML 4장으로 빌드하므로 어떤 정적 호스팅에도 올릴 수 있습니다.

## 실행

```bash
pnpm install
pnpm dev        # 개발 서버
pnpm build      # dist/ 생성
pnpm preview    # 빌드 결과 확인
```

## 페이지

| 파일 | 경로 | 용도 |
| --- | --- | --- |
| `index.html` | `/` | 제품 소개 랜딩 |
| `privacy.html` | `/privacy.html` | 개인정보처리방침 (App Store Privacy Policy URL, Google Play 개인정보처리방침 URL) |
| `terms.html` | `/terms.html` | 서비스 이용약관 |
| `support.html` | `/support.html` | 지원·계정 삭제 안내 (App Store Support URL, Google Play Account deletion URL) |

## 구조

- `partials/` — `<!-- include: 이름.html -->` 한 줄로 삽입되는 공용 조각(head 메타, 헤더, 푸터, 아이콘 스프라이트, 브랜드 마크).
  치환은 `vite.config.js`의 `htmlPartials` 플러그인이 빌드/개발 시점에 처리합니다.
- `src/styles.css` — 앱 테마를 옮긴 `@theme` 색·라운드 토큰과 타이포 계단, 다크 모드 팔레트,
  레이아웃·모션 변수(`--layout-*` `--motion-*`), `.shell` `.section` `.card` `.btn` `.pill` `.nav-link` `.legal` 등 공용 컴포넌트.
  히어로 진입 모션은 로드할 때 한 번만 재생하는 CSS 애니메이션이며 `prefers-reduced-motion`에서는 선언하지 않습니다.
- `src/main.js` — 헤더 현재 페이지 표시와 푸터 연도 채우기.
- `public/` — favicon, apple-touch-icon, og 이미지, robots.txt.

## 배포

배포 전에 확정할 값, 호스팅 설정, 배포 후 앱·스토어에 URL을 반영하는 순서는
[`docs/deploy_remaining_tasks.md`](docs/deploy_remaining_tasks.md)가 정본입니다. 진행 상태도 그 문서에만 기록합니다.

바로 확인해야 하는 값은 다음 네 가지입니다.

1. `.env`의 `VITE_SITE_URL` — 지금은 임시값입니다.
2. 개인정보처리방침 4항 국외 이전 표의 국가 — Supabase 프로젝트 리전 확인 필요.
3. 정책 문서 시행일 — 실제 공개 배포일과 맞춰야 합니다.
4. `terms.html`의 약관 버전 — 앱 `src/config/legal.ts`의 `CURRENT_TERMS_VERSION`과 같아야 합니다.

## 문서를 고칠 때

정책 문서의 다음 문단은 앱 동작과 스토어 심사 근거에 직접 연결되므로 임의로 줄이거나 바꾸지 않습니다.

- 개인정보처리방침 5항(보관 기간과 삭제)과 6항(앱 내 계정 및 데이터 삭제)
- 서비스 이용약관 제7조(이용자 콘텐츠 및 금지 행위)와 제9조(데이터 내보내기와 계정 삭제)

앱의 삭제 범위나 신고·차단 동작이 바뀌면 이 문단과 `docs/release_remaining_tasks.md`를 함께 고칩니다.
