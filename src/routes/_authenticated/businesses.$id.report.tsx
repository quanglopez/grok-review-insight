import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getLatestReport, runAnalysis } from "@/lib/analysis.functions";
import { getBusiness } from "@/lib/business.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, Star, TrendingUp, AlertTriangle, RefreshCcw, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/businesses/$id/report")({
  head: () => ({ meta: [{ title: "Báo cáo phân tích — MiMo Review Audit" }] }),
  component: ReportPage,
});

function ReportPage() {
  const { id } = Route.useParams();
  const get = useServerFn(getLatestReport);
  const getBiz = useServerFn(getBusiness);
  const run = useServerFn(runAnalysis);

  const { data: biz } = useQuery({ queryKey: ["biz", id], queryFn: () => getBiz({ data: { id } }) });
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["report", id],
    queryFn: () => get({ data: { business_id: id } }),
  });

  const m = useMutation({
    mutationFn: () => run({ data: { business_id: id } }),
    onSuccess: () => {
      toast.success("Phân tích hoàn tất!");
      refetch();
    },
    onError: (e: any) => toast.error(e.message || "Phân tích thất bại"),
  });

  if (isLoading) return <div className="p-8 text-muted-foreground">Đang tải...</div>;

  const report = data?.report;

  if (!report) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Card className="p-10 text-center space-y-4">
          <Sparkles className="h-12 w-12 mx-auto text-primary" />
          <h2 className="text-xl font-semibold">Chưa có báo cáo phân tích</h2>
          <p className="text-muted-foreground text-sm">
            Đảm bảo bạn đã nhập ít nhất 5 review, sau đó chạy phân tích bằng MiMo-V2.5.
          </p>
          <div className="flex justify-center gap-2">
            <Button asChild variant="outline">
              <Link to={`/businesses/${id}/reviews`}>Nhập review</Link>
            </Button>
            <Button onClick={() => m.mutate()} disabled={m.isPending}>
              {m.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Chạy phân tích
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{biz?.name}</h1>
          <p className="text-sm text-muted-foreground">
            Báo cáo lập lúc {new Date(report.created_at).toLocaleString("vi-VN")}
          </p>
        </div>
        <Button onClick={() => m.mutate()} disabled={m.isPending} variant="outline">
          {m.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
          Phân tích lại
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Star className="h-4 w-4" /> Điểm trung bình
          </div>
          <div className="text-3xl font-bold mt-2">{report.average_rating ?? "—"}<span className="text-base text-muted-foreground"> / 5</span></div>
        </Card>
        <Card className="p-5 md:col-span-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <TrendingUp className="h-4 w-4" /> Cảm xúc tổng thể
          </div>
          <p className="mt-2 text-sm leading-relaxed">{report.sentiment}</p>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-success" /> Khách khen gì</h3>
          <ul className="space-y-2">
            {(report.top_strengths as string[] || []).map((s, i) => (
              <li key={i} className="text-sm flex gap-2"><Badge variant="outline" className="bg-success/10 text-success border-success/20">+</Badge>{s}</li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Khách chê gì</h3>
          <ul className="space-y-2">
            {(report.top_complaints as string[] || []).map((s, i) => (
              <li key={i} className="text-sm flex gap-2"><Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">−</Badge>{s}</li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold mb-3">Chủ đề chính</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {(report.topics as any[] || []).map((t, i) => (
            <div key={i} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{t.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{t.mentions} lượt</Badge>
                  <Badge
                    variant="outline"
                    className={
                      t.sentiment === "tích cực" ? "bg-success/10 text-success border-success/20" :
                      t.sentiment === "tiêu cực" ? "bg-destructive/10 text-destructive border-destructive/20" :
                      "bg-muted"
                    }
                  >{t.sentiment}</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{t.summary}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold mb-3">Từ khóa nổi bật</h3>
        <div className="flex flex-wrap gap-2">
          {(report.keywords as string[] || []).map((k, i) => (
            <Badge key={i} variant="secondary">{k}</Badge>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button asChild>
          <Link to={`/businesses/${id}/recommendations`}>Xem 20 đề xuất cải thiện →</Link>
        </Button>
      </div>
    </div>
  );
}