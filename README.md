# 종합 게임 동아리

Google 로그인 기반의 비공개 게임 모임 플레이 세션·리뷰 플랫폼입니다. Next.js 15, Supabase, Vercel을 사용하며 기본 시간대는 한국 표준시입니다.

## 로컬 실행

1. Supabase 프로젝트를 만들고 SQL Editor 또는 CLI로 `supabase/migrations/20260817000000_initial_schema.sql`을 적용합니다.
2. `.env.example`을 `.env.local`로 복사하고 값을 채웁니다.
3. `pnpm install && pnpm dev`를 실행합니다.

## Supabase 설정

- Authentication > Providers에서 Google을 활성화합니다.
- Authentication > URL Configuration에 `http://localhost:3000/auth/callback` 및 배포 URL의 `/auth/callback`을 등록합니다.
- Storage 버킷과 RLS 정책은 마이그레이션에서 자동으로 생성됩니다.
- `ADMIN_EMAIL`과 일치하는 계정은 `/auth/callback`에서 자동으로 승인 및 관리자로 승격됩니다. 이 동작에는 서버 전용 `SUPABASE_SERVICE_ROLE_KEY`가 필요합니다.

## Google OAuth

Google Cloud Console에서 Web OAuth client를 만들고 Supabase callback URL (`https://<project>.supabase.co/auth/v1/callback`)을 Redirect URI로 등록합니다. 로컬과 Vercel URL도 Authorized JavaScript origins에 추가합니다. 테스트 모드일 때에는 모임원의 Google 계정을 test user로 추가해야 합니다.

## 게임 검색

`RAWG_API_KEY`가 있으면 RAWG를 우선 사용합니다. 키가 없거나 검색에 실패하면 Steam Store Search로 대체하며, 결과가 없으면 게임명을 직접 입력할 수 있습니다. RAWG를 사용하는 배포 화면에는 RAWG attribution 링크를 표시해야 합니다.

## 배포

GitHub `main` push는 검사 후 Supabase migration과 Vercel production deploy를 수행합니다. 필요한 Secrets는 `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`입니다. 앱 환경변수는 Vercel 환경변수로 별도 등록합니다.

로컬 CLI 배포는 `bash scripts/deploy.sh`로 실행합니다.
