import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MIMO_URL = "https://api.xiaomimimo.com/v1/chat/completions";
const MIMO_MODEL = "mimo-v2.5-pro";

const analysisTool = {
  type: "function" as const,
  function: {
    name: "submit_review_analysis",
    description:
      "Submit a structured analysis of customer reviews for a Vietnamese local business.",
    parameters: {
      type: "object",
      properties: {
        sentiment: {
          type: "string",
          description: "Tóm tắt cảm xúc tổng thể của khách hàng (2-3 câu, tiếng Việt).",
        },
        top_strengths: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 8,
          description: "Top điểm mạnh khách hàng khen nhất (tiếng Việt).",
        },
        top_complaints: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 8,
          description: "Top điểm yếu khách hàng phàn nàn nhất (tiếng Việt).",
        },
        topics: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              sentiment: { type: "string", enum: ["tích cực", "trung tính", "tiêu cực", "trộn lẫn"] },
              mentions: { type: "integer" },
              summary: { type: "string" },
            },
            required: ["name", "sentiment", "mentions", "summary"],
          },
          minItems: 4,
          maxItems: 10,
        },
        keywords: {
          type: "array",
          items: { type: "string" },
          minItems: 5,
          maxItems: 20,
        },
        pain_points: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 10,
        },
        recommendations: {
          type: "array",
          minItems: 20,
          maxItems: 20,
          items: {
            type: "object",
            properties: {
              rank: { type: "integer", minimum: 1, maximum: 20 },
              title: { type: "string" },
              problem: { type: "string" },
              evidence: { type: "string", description: "Bằng chứng cụ thể từ review (trích dẫn)." },
              action_steps: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 6 },
              priority: { type: "string", enum: ["Cao", "Trung bình", "Thấp"] },
              difficulty: { type: "string", enum: ["Dễ", "Trung bình", "Khó"] },
              expected_impact: { type: "string" },
              kpi: { type: "string" },
              timeline: { type: "string", enum: ["0-7 ngày", "1-4 tuần", "1-3 tháng", "3+ tháng"] },
            },
            required: [
              "rank",
              "title",
              "problem",
              "evidence",
              "action_steps",
              "priority",
              "difficulty",
              "expected_impact",
              "kpi",
              "timeline",
            ],
          },
        },
        reply_templates: {
          type: "object",
          properties: {
            five_star: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
            four_star: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
            negative: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
          },
          required: ["five_star", "four_star", "negative"],
        },
      },
      required: [
        "sentiment",
        "top_strengths",
        "top_complaints",
        "topics",
        "keywords",
        "pain_points",
        "recommendations",
        "reply_templates",
      ],
    },
  },
};

export const runAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { business_id: string }) =>
    z.object({ business_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const apiKey = process.env.MIMO_API_KEY;
    if (!apiKey) throw new Error("MIMO_API_KEY chưa được cấu hình.");

    const { data: biz, error: bizErr } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", data.business_id)
      .single();
    if (bizErr || !biz) throw new Error("Không tìm thấy doanh nghiệp.");

    const { data: reviews, error: revErr } = await supabase
      .from("reviews")
      .select("rating, review_text, review_date, reviewer_name, owner_reply")
      .eq("business_id", data.business_id)
      .limit(150);
    if (revErr) throw new Error(revErr.message);
    if (!reviews || reviews.length < 5) {
      throw new Error("Cần ít nhất 5 review để phân tích.");
    }

    const avg =
      reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;

    const reviewText = reviews
      .slice(0, 100)
      .map(
        (r, i) =>
          `[#${i + 1}] ⭐${r.rating} (${r.review_date || "N/A"}) ${r.reviewer_name || "Ẩn danh"}: ${
            r.review_text || ""
          }${r.owner_reply ? `\n  → Phản hồi: ${r.owner_reply}` : ""}`,
      )
      .join("\n\n");

    const systemPrompt = `Bạn là MiMo — chuyên gia phân tích trải nghiệm khách hàng cho doanh nghiệp Việt Nam.
Nhiệm vụ: đọc review Google Maps, phát hiện pattern và tạo 20 đề xuất cải thiện CỤ THỂ, ĐO LƯỜNG ĐƯỢC.

QUY TẮC ĐẠO ĐỨC TUYỆT ĐỐI:
- KHÔNG bao giờ gợi ý tạo review giả, mua review, hoặc thao túng đánh giá.
- KHÔNG gợi ý xóa/báo cáo review tiêu cực thật.
- Mọi đề xuất phải dựa trên cải thiện sản phẩm/dịch vụ thực tế.

Trả về kết quả qua tool submit_review_analysis. Toàn bộ nội dung bằng tiếng Việt.`;

    const userPrompt = `Doanh nghiệp: ${biz.name}
Ngành: ${biz.category || "N/A"}
Địa điểm: ${biz.location || "N/A"}
Số review phân tích: ${reviews.length}
Điểm trung bình tính được: ${avg.toFixed(2)}/5

DANH SÁCH REVIEW:
${reviewText}

Yêu cầu: Phân tích sâu, đưa ra đúng 20 đề xuất xếp hạng theo mức độ ưu tiên (rank 1 = quan trọng nhất). Bằng chứng phải trích dẫn từ review thật.`;

    const res = await fetch(MIMO_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MIMO_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [analysisTool],
        tool_choice: { type: "function", function: { name: "submit_review_analysis" } },
        temperature: 0.4,
        max_completion_tokens: 8000,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`MiMo API lỗi ${res.status}: ${txt.slice(0, 300)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{
        message?: {
          tool_calls?: Array<{ function?: { arguments?: string } }>;
          content?: string;
        };
      }>;
    };

    const argsStr =
      json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ?? "";
    if (!argsStr) throw new Error("MiMo không trả về kết quả phân tích.");

    let parsed: any;
    try {
      parsed = JSON.parse(argsStr);
    } catch {
      throw new Error("Không đọc được kết quả phân tích từ MiMo.");
    }

    // Persist
    const { data: report, error: repErr } = await supabase
      .from("analysis_reports")
      .insert({
        business_id: data.business_id,
        raw_result_json: parsed,
        average_rating: Number(avg.toFixed(2)),
        sentiment: parsed.sentiment,
        top_strengths: parsed.top_strengths,
        top_complaints: parsed.top_complaints,
        topics: parsed.topics,
        keywords: parsed.keywords,
        pain_points: parsed.pain_points,
        reply_templates: parsed.reply_templates,
      })
      .select()
      .single();
    if (repErr) throw new Error(repErr.message);

    const recRows = (parsed.recommendations as any[]).slice(0, 20).map((r) => ({
      report_id: report.id,
      rank: r.rank,
      title: r.title,
      problem: r.problem,
      evidence: r.evidence,
      action_steps: r.action_steps,
      priority: r.priority,
      difficulty: r.difficulty,
      expected_impact: r.expected_impact,
      kpi: r.kpi,
      timeline: r.timeline,
    }));
    const { error: recErr } = await supabase.from("recommendations").insert(recRows);
    if (recErr) throw new Error(recErr.message);

    return { report_id: report.id, count: recRows.length };
  });

export const getLatestReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { business_id: string }) =>
    z.object({ business_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: report } = await supabase
      .from("analysis_reports")
      .select("*")
      .eq("business_id", data.business_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!report) return { report: null, recommendations: [] };
    const { data: recs } = await supabase
      .from("recommendations")
      .select("*")
      .eq("report_id", report.id)
      .order("rank", { ascending: true });
    return { report, recommendations: recs ?? [] };
  });