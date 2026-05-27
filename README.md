# MiMo Review Audit (grok-review-insight)

SaaS phân tích review Google Maps bằng MiMo AI. Stack: **React 19**, **TanStack Start / Router**, **Vite**, **Supabase** (Auth + Postgres + RLS), deploy **Cloudflare Workers**.

## Yêu cầu

- [Bun](https://bun.sh) (hoặc Node 20+ với package manager tương thích)
- Tài khoản [Supabase](https://supabase.com)
- API key [MiMo](https://api.xiaomimimo.com) (`MIMO_API_KEY`)

## Cài đặt nhanh

```bash
git clone <repo-url>
cd grok-review-insight
cp .env.example .env
# Chỉnh .env với URL và key thật từ Supabase + MiMo
bun install
```

## Biến môi trường

| Biến | Bắt buộc | Phạm vi | Mô tả |
|------|----------|---------|--------|
| `VITE_SUPABASE_URL` | Có | Client | URL project Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Có | Client | Publishable key (`sb_publishable_…`) |
| `SUPABASE_URL` | Có | Server | Cùng URL với `VITE_SUPABASE_URL` |
| `SUPABASE_PUBLISHABLE_KEY` | Có | Server | Cùng key với `VITE_*`; dùng cho Bearer + `getClaims` trên server functions |
| `MIMO_API_KEY` | Có (phân tích) | **Server only** | Gọi MiMo trong `runAnalysis`; không prefix `VITE_` |
| `SUPABASE_SERVICE_ROLE_KEY` | Không* | Server | Chỉ khi dùng `supabaseAdmin` (hiện không dùng trong flow chính) |

\* File `src/integrations/supabase/client.server.ts` hỗ trợ service role nhưng các route hiện tại dùng RLS + session JWT.

**Lưu ý:** `MIMO_API_KEY` chỉ đặt trên server (`.env` local, Wrangler secrets production). Không đưa vào biến `VITE_*`.

Mẫu đầy đủ: [.env.example](./.env.example).

## Supabase (database + Auth)

1. Tạo project Supabase hoặc dùng project có sẵn.
2. Áp migration trong repo:

   ```bash
   # Cách 1: Supabase CLI (khuyến nghị nếu đã link project)
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push

   # Cách 2: SQL Editor trên Dashboard — dán nội dung file:
   # supabase/migrations/20260527042223_*.sql
   ```

3. Bật Email auth (hoặc provider bạn dùng) trong Authentication → Providers.
4. Đảm bảo `supabase/config.toml` → `project_id` **khớp** project ref trong `.env` (nếu lệch, CLI có thể trỏ sai project).

## Chạy local

```bash
bun run dev
```

Mở URL do Vite in (thường `http://localhost:5173`). Flow: đăng ký/đăng nhập → dashboard → tạo doanh nghiệp → nhập review (CSV/thủ công) → báo cáo MiMo (cần ≥5 review + `MIMO_API_KEY`).

## Build

```bash
bun run build
```

Output: `dist/client`, `dist/server` (Cloudflare adapter).

## Deploy (Cloudflare Workers)

- Cấu hình: `wrangler.jsonc`, entry `src/server.ts`.
- Đặt secrets trên Worker: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `MIMO_API_KEY` (và `VITE_*` nếu build-time cần — thường embed lúc build từ `.env`).

Chi tiết deploy có thể bổ sung trong issue riêng (ALE-23).

## Scripts

| Lệnh | Mô tả |
|------|--------|
| `bun run dev` | Dev server |
| `bun run build` | Production build |
| `bun run preview` | Preview build |
| `bun run lint` | ESLint |
| `bun run format` | Prettier |

## Cấu trúc chính

- `src/routes/` — pages (login, dashboard, reviews, report, …)
- `src/lib/business.functions.ts` — CRUD business/reviews (server functions)
- `src/lib/analysis.functions.ts` — MiMo analysis + report
- `src/integrations/supabase/` — client, auth middleware, types
- `supabase/migrations/` — schema + RLS
