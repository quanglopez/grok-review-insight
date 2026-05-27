
# Grok Review Audit – Build Plan

Vietnamese SaaS web app. Clean, premium business look. Warm white bg, dark text, blue accent, green/red badges. Fully responsive, all copy in Vietnamese.

## 1. Stack & Setup

- React + TanStack Start (existing template)
- Tailwind v4 (existing) – extend tokens in `src/styles.css` (warm white `#FBFAF7`, ink `#0F172A`, blue accent, success green, warning red)
- Lovable Cloud (Supabase) – enable on first build step
- xAI Grok API via server function (`createServerFn`) – key stored as secret `XAI_API_KEY` (ask user to add)
- PDF export via `pdf-lib` (Worker-compatible) generated server-side, streamed to browser
- Auth: Supabase email/password + protected `_authenticated` layout

## 2. Database (migration)

Tables in `public` with GRANTs + RLS scoped to `auth.uid()` via `businesses.user_id`:
- `businesses` (id, user_id, name, category, location, google_maps_url, created_at)
- `reviews` (id, business_id, reviewer_name, rating, review_text, review_date, owner_reply, created_at)
- `analysis_reports` (id, business_id, raw_result_json jsonb, average_rating numeric, sentiment text, created_at)
- `recommendations` (id, report_id, rank, title, problem, evidence, action_steps jsonb, priority, difficulty, expected_impact, kpi, timeline)

Policies: user can CRUD rows where the parent business belongs to them (helper SQL function `owns_business(business_id)`).

## 3. Routes (file-based)

Public:
- `/` – Landing page
- `/login`, `/signup`

Authenticated layout `_authenticated/`:
- `/dashboard` – Tổng quan (business list + stats)
- `/businesses/$id/reviews` – Nhập review (form + CSV upload + paste + review table)
- `/businesses/$id/analysis` – Run Grok analysis
- `/businesses/$id/report` – Báo cáo phân tích
- `/businesses/$id/recommendations` – 20 cải thiện (with filters)
- `/businesses/$id/replies` – Mẫu phản hồi review
- `/businesses/$id/export` – Xuất PDF
- `/settings/api` – Cài đặt API (status of `XAI_API_KEY`)

Sidebar (shadcn `Sidebar`) renders inside `_authenticated` layout with the 7 items from spec, collapsible.

## 4. Pages – content & behavior

**Landing**: Hero (headline/sub/CTA in Vietnamese as spec) + sections: Vấn đề, Cách hoạt động (3-step), Báo cáo gồm gì, Bảng giá (3 tiers placeholder), FAQ (accordion). Single H1, meta tags VI.

**Review input**: Business meta form (zod-validated), tabs for CSV upload (parse with `papaparse`) vs paste (simple TSV/CSV detection). Table shows parsed reviews; "Lưu" inserts into `reviews`. Empty state when no rows.

**Analysis**: Big "Phân tích bằng Grok" button → calls `runAnalysis` server fn → reads up to 100 reviews → calls Grok (`grok-2-latest`) with strict tool-calling schema returning `{average_rating, sentiment, top_strengths[], top_complaints[], topics[], keywords[], pain_points[], recommendations[20], reply_templates{five[3], four[3], negative[4]}}`. Insert into `analysis_reports` + `recommendations`. Loading skeleton, retry on error, 429/402 toast.

**Report**: Cards for avg rating, sentiment summary, strengths/complaints lists, topic cards, keyword chips, pain points.

**Recommendations**: 20 cards w/ rank, title, problem, evidence, action_steps (checklist), priority badge (Cao/Trung bình/Thấp – red/amber/green), difficulty, expected impact, KPI, timeline. Filter bar by priority/difficulty/timeline.

**Reply templates**: 3 + 3 + 4 cards with copy-to-clipboard button (toast "Đã sao chép").

**PDF export**: Server fn builds PDF with cover, business summary, topic analysis, 20 recs, 30-day action plan (derived from top 10 high-priority recs), reply templates. Vietnamese font (bundle Noto Sans). Returns binary stream.

## 5. Server functions

- `createBusiness`, `listBusinesses`, `upsertReviews`, `listReviews`
- `runAnalysis` (calls Grok, persists)
- `getReport`, `listRecommendations`
- `exportPdf` (returns `Response` with `application/pdf`)
All protected by `requireSupabaseAuth`.

## 6. Design tokens (src/styles.css)

```
--background: oklch(0.985 0.005 85)   /* warm white */
--foreground: oklch(0.18 0.03 260)    /* ink */
--primary:    oklch(0.55 0.18 250)    /* blue */
--success:    oklch(0.65 0.16 150)
--warning:    oklch(0.62 0.22 28)
```
Plus muted, border, radius 0.75rem. All components use semantic tokens.

## 7. Guardrails

- No fake-review / manipulation suggestions: Grok system prompt explicitly forbids it; reject any generated rec containing prohibited terms.
- Empty states on every list page; error boundaries on every route with loader.
- Responsive: sidebar collapses to icon mode <768px, tables become stacked cards.

## 8. Secrets needed

- `XAI_API_KEY` – will request via `add_secret` in build mode.

## Implementation order

1. Enable Lovable Cloud + add `XAI_API_KEY` secret
2. Migration: tables, RLS, grants
3. Design tokens + base layout (sidebar, auth pages)
4. Landing page
5. Businesses + reviews flow (input, CSV parse, table)
6. Grok server fn + analysis page
7. Report + recommendations + filters
8. Reply templates page
9. PDF export
10. Settings/API page, polish, responsive QA

Ready to switch to build mode.
