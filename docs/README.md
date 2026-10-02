# 타임브릿지 프로젝트 문서

## 현재 상황

현재 코드는 인터뷰 코칭의 소개·방향 선택·가상 샘플·상담 입력을 체험하는 네 화면의 내부 시안이다. 9.9만원의 8주 코칭과 유료 5가구 모집 계획을 화면에 반영했다. 실제 상담 신청은 전송·저장하지 않으며, 다음 단계에서 접수 경로를 연결한다. 이전 무료 앱의 정책·지원 페이지와 전용 자산은 제거했다.

2026-10-02에 코드와 설정을 확인해 문서를 초기화했다. 배포 주소, 호스팅, 상담 저장소, 결제 수단, AI 전사 도구는 미정이다. 과거 문서의 검증 결과를 현재 실행 결과로 간주하지 않는다.

## 기본 문서

- [docs/plan.md](plan.md): 현재 제품과 합의한 코칭 MVP의 목적·범위·정책.
- [docs/architecture.md](architecture.md): 확인한 구성 요소, 폴더 책임과 데이터 흐름.
- [docs/specs.md](specs.md): 설정에서 확인한 기술 구성과 실행·검증 방법.
- [docs/design.md](design.md): 현재 코칭 UI의 시각 기준·상호작용과 검증 범위.

현재 작업에 필요한 문서만 선택해 읽는다. 문서 역할과 작업 기록 방식은 [AGENTS.md](../AGENTS.md)를 따른다. Claude Code에는 [CLAUDE.md](../CLAUDE.md)가 공통 규칙을 연결한다.

## 진행 중과 예정 작업

- [docs/work/W-002-main-coaching-mvp.md](work/W-002-main-coaching-mvp.md): 진행 중. 네 화면 구현과 색감 유지·Pretendard 통일 리디자인 완료. 다음 단계는 실제 상담 접수·운영자 확인·회신 연결.

## 최근 완료

- [docs/work/W-003-main-obsolete-docs.md](work/W-003-main-obsolete-docs.md): 기존 앱 배포 문서와 관련 지침 정리, 완료. 문서 링크와 제품 코드 보존을 확인했다.
- [docs/work/W-001-main-docs-starter.md](work/W-001-main-docs-starter.md): 한국어 문서 구조 적용, 완료. 기존 내용 보존·문서 링크·빌드 검증을 마쳤다.

## 보존한 기존 문서

- [README.md](../README.md): 프로젝트 소개와 현재 실행 안내. 옛 앱의 스토어 제출·약관 동기화 절차는 제거했다.
- [docs/mvp-plan.md](mvp-plan.md): 이번 대화에서 정리한 초기 코칭 MVP 계획. 이후 제품 정책은 `docs/plan.md`, 실행 현황은 해당 작업 문서에서 관리한다.

기존 앱의 배포 문서는 사용자 요청에 따라 삭제했다. 삭제 범위와 MVP 구현 후 다시 정리할 자료는 [docs/work/W-003-main-obsolete-docs.md](work/W-003-main-obsolete-docs.md)에 기록한다.

## 작업과 세션 기록

[docs/work/_template.md](work/_template.md)를 복사해 새 작업을 시작한다. 같은 목표는 작업 문서 하나를 갱신하고, 완료해도 문서와 링크를 유지한다. 다음 행동은 작업 문서의 남은 일에서 확인한다.

긴 근거를 분리할 때만 [docs/sessions/_template.md](sessions/_template.md)를 사용한다. 공유하지 않을 원문·개인 메모는 Git에서 제외되는 `docs/.local/`에 둔다.
