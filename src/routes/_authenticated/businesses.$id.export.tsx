import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getLatestReport } from "@/lib/analysis.functions";
import { getBusiness } from "@/lib/business.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileDown, Printer } from "lucide-react";

export const Route = createFileRoute("/_authenticated/businesses/$id/export")({
  head: () => ({ meta: [{ title: "Xuất PDF — MiMo Review Audit" }] }),
  component: ExportPage,
});

function ExportPage() {
  const { id } = Route.useParams();
  const get = useServerFn(getLatestReport);
  const getBiz = useServerFn(getBusiness);

  const { data: biz } = useQuery({ queryKey: ["biz", id], queryFn: () => getBiz({ data: { id } }) });
  const { data, isLoading } = useQuery({
    queryKey: ["report", id],
    queryFn: () => get({ data: { business_id: id } }),
  });

  if (isLoading) return <div className="p-8 text-muted-foreground">Đang tải...</div>;

  const report = data?.report;
  const recs = data?.recommendations ?? [];

  if (!report) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Card className="p-10 text-center space-y-4">
          <FileDown className="h-12 w-12 mx-auto text-primary" />
          <h2 className="text-xl font-semibold">Chưa có báo cáo để xuất</h2>
          <Button asChild><Link to={`/businesses/${id}/report`}>Đến trang báo cáo</Link></Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">Xuất báo cáo PDF</h1>
          <p className="text-sm text-muted-foreground">Bấm "In / Lưu PDF" rồi chọn "Save as PDF" trong hộp thoại in.</p>
        </div>
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" /> In / Lưu PDF
        </Button>
      </div>

      <div id="print-area" className="bg-white text-foreground p-8 rounded-lg border space-y-6 print:border-0 print:p-0">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold">Báo cáo phân tích review</h1>
          <p className="text-muted-foreground">{biz?.name} {biz?.location && `— ${biz.location}`}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Lập bởi MiMo Review Audit • {new Date(report.created_at).toLocaleString("vi-VN")}
          </p>
        </div>

        <section>
          <h2 className="text-lg font-semibold mb-2">Tổng quan</h2>
          <p>Điểm trung bình: <strong>{report.average_rating}/5</strong></p>
          <p className="mt-2 leading-relaxed">{report.sentiment}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Điểm mạnh</h2>
          <ul className="list-disc pl-5 space-y-1">
            {(report.top_strengths as string[] || []).map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Điểm yếu</h2>
          <ul className="list-disc pl-5 space-y-1">
            {(report.top_complaints as string[] || []).map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </section>

        <section className="break-before-page">
          <h2 className="text-lg font-semibold mb-3">20 đề xuất cải thiện</h2>
          <div className="space-y-4">
            {recs.map((r: any) => (
              <div key={r.id} className="border rounded p-3 break-inside-avoid">
                <h3 className="font-semibold">#{r.rank}. {r.title}</h3>
                <p className="text-sm mt-1"><strong>Ưu tiên:</strong> {r.priority} • <strong>Độ khó:</strong> {r.difficulty} • <strong>Thời gian:</strong> {r.timeline}</p>
                {r.problem && <p className="text-sm mt-1"><strong>Vấn đề:</strong> {r.problem}</p>}
                {r.evidence && <p className="text-sm mt-1 italic">"{r.evidence}"</p>}
                {Array.isArray(r.action_steps) && (
                  <ul className="list-disc pl-5 text-sm mt-1">
                    {r.action_steps.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                )}
                <p className="text-sm mt-1"><strong>Tác động:</strong> {r.expected_impact} • <strong>KPI:</strong> {r.kpi}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; inset: 0; padding: 24px; }
        }
      `}</style>
    </div>
  );
}