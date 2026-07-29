# TimeBridge 랜딩 페이지 배포 잔여 작업

- **최종 갱신:** 2026-07-29
- **정본:** 이 저장소의 배포 준비와 완료 판단은 이 문서만 본다.
- **범위:** 값 확정, 배포, 배포 후 URL 반영까지. 앱 출시 전체 순서는 앱 저장소 `docs/release_remaining_tasks.md`가 정본이다.
- **연결:** 이 문서의 A~C를 마치면 앱 저장소 `2. A — 정책·지원 랜딩 페이지`의 체크박스를 닫을 수 있다.
- **진행 규칙:** `[ ]`만 남은 작업이다. 완료할 때 `[x]`로 바꾸고 같은 절의 증거 칸에 URL·시각을 기록한다.

## 1. 지금 어디서 재개하는가

반드시 A부터 순서대로 진행한다. A에서 값을 확정하지 않고 B를 배포하면 canonical과 시행일을 다시 고쳐야 한다.

| 영역 | 현재 상태 | 다음 행동 |
| --- | --- | --- |
| 페이지 원고·디자인 | 완료 | A에서 값만 바꾸고 문구는 건드리지 않는다 |
| 빌드·로컬 검증 | 완료 | A~B 변경 후 `pnpm build`만 재실행 |
| 확정 값 | 대기 | A의 도메인·국외 이전 국가·시행일·약관 버전 |
| 호스팅·배포 | 대기 | B의 최초 커밋부터 |
| 앱·스토어 반영 | 대기 | B 완료 후 C 진행 |

현재 고정값:

```text
저장소: https://github.com/gonasooc/timebridge-web.git (아직 커밋 없음)
운영자: 최관수
지원 이메일: timebridge.contact@gmail.com
약관 버전: 1.0.0
문서 시행일: 2026년 7월 29일
임시 VITE_SITE_URL: https://timebridge.gonasoo.dev
빌드 산출물: dist/ (index, privacy, terms, support)
```

## 2. A — 배포 전에 확정할 값

### A-1. 사이트 주소

`VITE_SITE_URL`은 canonical과 og:url, og:image 절대 경로에만 쓰인다. 네 페이지의 `<link rel="canonical">`과
`partials/head.html`의 `og:image`가 이 값을 참조한다.

- [ ] 최종 도메인을 정한다.
- [ ] `.env`의 `VITE_SITE_URL`을 그 도메인으로 바꾼다. 끝에 `/`를 붙이지 않는다.
- [ ] 빌드 결과에 임시값이 남아 있지 않은지 확인한다.

```bash
pnpm build
grep -o '<link rel="canonical"[^>]*>' dist/*.html
grep -o '<meta property="og:image"[^>]*>' dist/index.html
grep -c "timebridge.gonasoo.dev" dist/*.html   # 도메인을 바꿨다면 0이어야 한다
```

증거:

```text
확정 도메인:
VITE_SITE_URL 교체 시각:
```

### A-2. 국외 이전 국가 확인

`privacy.html`의 `4. 개인정보의 국외 이전` 표는 현재 이전받는 자의 **회사 소재지 기준**으로
`Supabase, Inc. — 미국`, `650 Industries, Inc.(Expo) — 미국`이라 적혀 있다.
Supabase 프로젝트의 실제 데이터 리전은 도메인이 Cloudflare로 프록시되어 저장소에서 확인할 수 없었다.

- [ ] Supabase 대시보드 > Project Settings > General에서 Region을 확인한다.
- [ ] 리전 소재 국가가 미국이 아니면 `privacy.html` 4항 표의 `이전 국가` 칸을 실제 국가로 고친다.
- [ ] 같은 표의 Expo 행 국가 표기도 함께 확인한다.
- [ ] 표를 고쳤다면 `3. 개인정보 처리의 위탁` 절의 수탁자 표기와 어긋나지 않는지 다시 읽는다.

증거:

```text
Supabase project ref: lrnyrdfpcvqrmlwvrrth
확인한 Region:
표 수정 여부:
```

### A-3. 시행일 확정

문서 시행일은 실제 공개 배포일과 같아야 한다. 2026-07-29가 아닌 날에 배포하면 아래 7곳을 모두 바꾼다.

| 파일 | 위치 |
| --- | --- |
| `privacy.html` | 머리말 `시행일`, `13. 변경 고지`의 공고일·시행일 |
| `terms.html` | 머리말 `시행일`, `부칙`의 공고일·시행일 |
| `support.html` | `시행일` 절 |

- [ ] 공개 배포일을 확정한다.
- [ ] 위 7곳의 날짜를 배포일로 맞춘다.
- [ ] 옛 날짜가 남아 있지 않은지 확인한다.

```bash
grep -n "2026년 7월 29일" *.html   # 배포일을 바꿨다면 결과가 없어야 한다
```

### A-4. 약관 버전 동기화

`terms.html`의 약관 버전은 앱 `src/config/legal.ts`의 `CURRENT_TERMS_VERSION`과 반드시 같아야 한다.
앱은 이 버전으로 재동의 여부를 판단하고 `users.terms_version`에 저장한다.

- [ ] 현재 둘 다 `1.0.0`인지 확인한다.
- [ ] 약관 본문을 고쳤다면 앱 상수와 `terms.html`의 버전을 함께 올리고, 앱에서 재동의를 요구하는지 확인한다.

```bash
grep -n "CURRENT_TERMS_VERSION" ../timebridge/src/config/legal.ts
grep -n "약관 버전" terms.html
```

## 3. B — 호스팅과 배포

### B-1. 저장소 최초 커밋

현재 `main`에 커밋이 하나도 없다.

- [ ] `.env`를 커밋할지 정한다. 공개 도메인 값만 들어 있어 비밀이 아니고 빌드에 필요하므로 커밋을 전제로 두었다.
      커밋하지 않기로 하면 `.gitignore`에 `.env`를 추가하고 B-2에서 호스팅 환경변수로 넣는다.
- [ ] 최초 커밋과 push를 한다.

```bash
git add .
git status --short
git commit -m "TimeBridge 소개·정책·지원 랜딩 페이지 추가"
git push -u origin main
```

증거:

```text
최초 커밋 해시:
push 시각:
```

### B-2. 정적 호스팅 배포

산출물은 정적 파일이라 서버 런타임이 필요 없다.

- [ ] 호스팅을 정한다. (Vercel / Cloudflare Pages / Netlify / GitHub Pages)
- [ ] 빌드 설정을 넣는다.
  - 설치 명령: `pnpm install`
  - 빌드 명령: `pnpm build`
  - 산출 디렉터리: `dist`
  - Node: 20.19 이상 (저장소 `.nvmrc`는 22.13.1)
- [ ] `.env`를 커밋하지 않기로 했다면 호스팅 환경변수에 `VITE_SITE_URL`을 넣는다.
- [ ] 커스텀 도메인을 연결하고 HTTPS 인증서 발급을 확인한다.
- [ ] `http://` 접속이 `https://`로 리다이렉트되는지 확인한다.

증거:

```text
호스팅:
프로젝트/사이트 이름:
배포 URL:
커스텀 도메인 연결 시각:
```

### B-3. 클린 URL 결정

각 페이지는 `privacy.html` 같은 실제 파일이다. 스토어 콘솔에 넣을 주소는 여기서 한 벌로 확정한다.

- [ ] 호스팅이 `/privacy` → `/privacy.html`을 자동 처리하는지 확인한다.
- [ ] 확장자 없는 주소를 쓰기로 하면 네 페이지의 `<link rel="canonical">`과 `og:url`, 그리고 내부 링크
      (`partials/header.html`, `partials/footer.html`, `partials/legal-links.html`, 각 페이지 본문의
      `/privacy.html`·`/terms.html`·`/support.html`)를 함께 바꾼다.
- [ ] 자동 처리되지 않으면 `.html`이 붙은 주소를 canonical로 확정하고 그대로 쓴다.
- [ ] 확정한 주소 네 개를 아래에 적고, 이후 모든 문서와 콘솔 입력에 이 값만 쓴다.

```text
소개:
개인정보처리방침:
서비스 이용약관:
지원·계정 삭제:
```

### B-4. 배포 후 확인

- [ ] 로그아웃 상태의 브라우저(시크릿 창)에서 네 페이지를 모두 연다.
- [ ] 각 페이지의 제목, 시행일, 운영자, 지원 이메일, 약관 버전이 A에서 확정한 값과 같은지 본다.
- [ ] 헤더·푸터의 내부 링크와 정책 문서 차례 앵커가 모두 올바른 위치로 이동하는지 확인한다.
- [ ] 모바일 실기기에서 가로 스크롤이 생기지 않고 본문이 읽히는지 확인한다.
- [ ] 라이트 모드와 다크 모드를 모두 확인한다. (다크 모드는 시스템 설정을 따르며 토글은 없다)
- [ ] `mailto:` 버튼 세 개가 올바른 제목으로 메일 앱을 여는지 확인한다.
  - 소개 페이지 `문의하기` → `[TimeBridge 문의]`
  - 지원 페이지 `문의 메일 쓰기` → `[TimeBridge 문의]`
  - 지원 페이지 `삭제 요청 메일 쓰기` → `[TimeBridge 계정 삭제 요청]` + 본문 양식
- [ ] favicon과 og 이미지가 뜨는지 확인한다.

증거:

```text
로그아웃 브라우저 확인 시각:
실기기 확인 기기/시각:
```

## 4. C — 앱과 스토어에 URL 반영

앱 저장소 `docs/release_remaining_tasks.md`의 `A-2. URL 교체와 검증`과 같은 작업이다. 한쪽만 갱신하지 않는다.

- [ ] 앱 로컬 `.env`의 `EXPO_PUBLIC_PRIVACY_POLICY_URL`, `EXPO_PUBLIC_TERMS_OF_SERVICE_URL`을 B-3의 주소로 교체한다.
- [ ] EAS `development`·`preview`·`production` 세 환경을 모두 교체한다.
- [ ] App Store Connect의 Privacy Policy URL과 Support URL을 기록한다.
- [ ] Google Play의 개인정보처리방침 URL과 Account deletion URL을 기록한다. 계정 삭제 URL은 지원 페이지다.
- [ ] 앱 검사를 실행한다.

```bash
cd ../timebridge
nvm use 22.13.1
pnpm check:env
pnpm check:release-env
pnpm verify:release
```

- [ ] 앱에서 정책·약관 링크를 눌러 외부 브라우저로 열리는지 iOS와 Android에서 각각 확인한다.

증거:

```text
앱 .env 교체 시각:
EAS development / preview / production 갱신 시각:
App Store Privacy URL / Support URL:
Google Play 개인정보처리방침 URL / Account deletion URL:
```

## 5. D — 배포를 막지 않는 개선 항목

지금 하지 않아도 스토어 제출에 문제가 없다. 여유가 생기면 처리한다.

- [ ] **OG 이미지**: 현재 앱 아이콘을 줄인 640×640 정사각형이고 `twitter:card`는 `summary`다.
      1200×630 가로 이미지를 만들면 `partials/head.html`의 카드 타입을 `summary_large_image`로 바꾼다.
- [ ] **sitemap.xml**: 4페이지라 없어도 되지만, 넣으려면 `VITE_SITE_URL` 기준으로 빌드 시 생성하고
      `public/robots.txt`에 `Sitemap:` 줄을 더한다.
- [ ] **폰트 self-host**: Pretendard를 jsDelivr CDN에서 받는다. 외부 의존을 없애려면 `public/fonts`에 두고
      `partials/head.html`의 링크를 `@font-face`로 바꾼다. 앱 `assets/fonts`의 OTF는 개당 1.5MB이므로
      woff2 서브셋 변환이 필요하다.
- [ ] **출시 후 스토어 링크**: App Store / Google Play 배지와 링크를 히어로에 추가하고, 히어로 배지 문구
      `iOS · Android 출시 준비 중`과 FAQ `어떤 기기에서 쓸 수 있나요?` 답변을 출시 상태에 맞게 고친다.
- [ ] **검색엔진 등록**: Google Search Console과 네이버 서치어드바이저에 도메인을 등록한다.

## 6. 배포 중단 기준

다음 중 하나라도 해당하면 이 사이트를 스토어 제출 근거로 쓰지 않는다.

- `VITE_SITE_URL`이 임시값이거나 canonical이 실제 공개 주소와 다르다.
- 문서 시행일이 실제 공개일과 다르다.
- 국외 이전 표의 국가를 확인하지 않았다.
- `terms.html`의 약관 버전이 앱 `CURRENT_TERMS_VERSION`과 다르다.
- 네 페이지 중 하나라도 HTTPS로 열리지 않거나 로그인 없이 볼 수 없다.
- 운영자 표기나 지원 이메일이 스토어 콘솔 입력값과 다르다.
- 정책 필수 문안(개인정보처리방침 5·6항, 서비스 이용약관 제7·9조)이 임의로 축약되었다.

## 7. 이미 확인된 상태

아래는 확인을 마친 항목이다. A~C에서 값을 바꾸지 않았다면 다시 볼 필요가 없다.

- `pnpm build` 통과. 산출물은 HTML 4장 + CSS 약 25KB + JS 약 1.1KB.
- 390px와 1280px 모두 가로 스크롤 없음. 정책 문서의 표는 자체 영역 안에서만 가로 스크롤된다.
- 라이트/다크 렌더 확인, 콘솔 에러 없음, 헤더 현재 페이지 표시와 푸터 연도 동작 확인.
- 데스크톱에서 정책 문서 차례가 sticky로 따라오는 것 확인.
- 푸터 보조 텍스트 명암비를 4.41:1에서 5.4:1로 올려 WCAG AA를 충족시켰다.
- 색·라운드·간격·타이포는 앱 `src/theme.ts` 값을 그대로 옮겼고, 브랜드 마크는 앱
  `scripts/generate-brand-assets.js`의 좌표를 SVG로 다시 그린 것이다.
