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

### Chuẩn bị

1. Tạo project trên [Supabase](https://supabase.com) (hoặc dùng project hiện có).
2. Lấy **project ref** từ URL dashboard (`https://supabase.com/dashboard/project/<project-ref>`) hoặc từ `VITE_SUPABASE_URL` (`https://<project-ref>.supabase.co`).
3. Điền `.env` (xem [.env.example](./.env.example)).
4. Cập nhật `supabase/config.toml` → `project_id` **cùng ref** với `.env`. Nếu lệch, `supabase link` / `db push` sẽ áp schema sai project → CRUD lỗi.

### Áp migration (runbook)

Migration trong repo:

`supabase/migrations/20260527042223_fbca9af3-e068-4e1d-88dc-1cea64a7923f.sql`

**Cách 1 — Supabase CLI (khuyến nghị)**

```bash
# Cài CLI: https://supabase.com/docs/guides/cli
supabase login
supabase link --project-ref YOUR_PROJECT_REF   # trùng supabase/config.toml và .env
supabase db push
```

**Cách 2 — SQL Editor (Dashboard)**

1. Mở project → **SQL** → New query.
2. Dán toàn bộ nội dung file migration ở trên → **Run**.

### Kiểm tra schema

Trong **Table Editor** hoặc SQL, xác nhận 4 bảng tồn tại và **RLS enabled**:

| Bảng | Mục đích |
|------|----------|
| `businesses` | Doanh nghiệp (theo `user_id`) |
| `reviews` | Review Google Maps |
| `analysis_reports` | Kết quả MiMo |
| `recommendations` | 20 đề xuất / báo cáo |

### Auth

Bật **Email** (hoặc provider bạn dùng) trong **Authentication → Providers**.

### Smoke test (sau migration)

1. `bun run dev` → đăng ký / đăng nhập.
2. Dashboard → **Thêm doanh nghiệp** → thành công (insert `businesses`).
3. Mở doanh nghiệp → nhập ≥1 review (CSV hoặc thủ công) → **Lưu** (insert `reviews`).

Nếu bước 2–3 báo lỗi RLS / relation does not exist → migration chưa áp đúng project hoặc `project_id` trong `config.toml` không khớp `.env`.

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
