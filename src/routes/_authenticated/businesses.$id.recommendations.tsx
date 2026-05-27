import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getLatestReport } from "@/lib/analysis.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListChecks, Target, Clock, Gauge } from "lucide-react";

export const Route = createFileRoute("/_authenticated/businesses/$id/recommendations")({
  head: () => ({ meta: [{ title: "20 đề xuất — MiMo Review Audit" }] }),
  component: RecsPage,
});

function priorityClass(p?: string) {
  if (p === "Cao") return "bg-destructive/10 text-destructive border-destructive/20";
  if (p === "Trung bình") return "bg-warning/10 text-warning border-warning/20";
  return "bg-success/10 text-success border-success/20";
}

function RecsPage() {
  const { id } = Route.useParams();
  const get = useServerFn(getLatestReport);
  const { data, isLoading } = useQuery({
    queryKey: ["report", id],
    queryFn: () => get({ data: { business_id: id } }),
  });

  const [priority, setPriority] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");

  if (isLoading) return <div className="p-8 text-muted-foreground">Đang tải...</div>;

  const recs = data?.recommendations ?? [];

  if (recs.length === 0) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Card className="p-10 text-center space-y-4">
          <ListChecks className="h-12 w-12 mx-auto text-primary" />
          <h2 className="text-xl font-semibold">Chưa có đề xuất</h2>
          <p className="text-muted-foreground text-sm">Hãy chạy phân tích để nhận 20 đề xuất cải thiện.</p>
          <Button asChild><Link to={`/businesses/${id}/report`}>Đến trang báo cáo</Link></Button>
        </Card>
      </div>
    );
  }

  const filtered = recs.filter((r: any) =>
    (priority === "all" || r.priority === priority) &&
    (difficulty === "all" || r.difficulty === difficulty)
  );

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">20 đề xuất cải thiện</h1>
        <p className="text-sm text-muted-foreground">Xếp hạng theo mức độ ưu tiên dựa trên dữ liệu review thực tế.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Ưu tiên" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả ưu tiên</SelectItem>
            <SelectItem value="Cao">Cao</SelectItem>
            <SelectItem value="Trung bình">Trung bình</SelectItem>
            <SelectItem value="Thấp">Thấp</SelectItem>
          </SelectContent>
        </Select>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Độ khó" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả độ khó</SelectItem>
            <SelectItem value="Dễ">Dễ</SelectItem>
            <SelectItem value="Trung bình">Trung bình</SelectItem>
            <SelectItem value="Khó">Khó</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground self-center ml-auto">{filtered.length}/{recs.length} đề xuất</div>
      </div>

      <div className="space-y-3">
        {filtered.map((r: any) => (
          <Card key={r.id} className="p-5">
            <div className="flex items-start gap-4">
              <div className="shrink-0 h-10 w-10 rounded-md bg-primary/10 text-primary font-bold flex items-center justify-center">
                #{r.rank}
              </div>
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <h3 className="font-semibold">{r.title}</h3>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={priorityClass(r.priority)}>Ưu tiên: {r.priority}</Badge>
                    <Badge variant="outline">Độ khó: {r.difficulty}</Badge>
                  </div>
                </div>
                {r.problem && <p className="text-sm text-muted-foreground"><strong className="text-foreground">Vấn đề:</strong> {r.problem}</p>}
                {r.evidence && <p className="text-sm italic border-l-2 border-muted pl-3 text-muted-foreground">"{r.evidence}"</p>}

                {Array.isArray(r.action_steps) && r.action_steps.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Hành động</div>
                    <ul className="text-sm space-y-1 list-disc pl-5">
                      {r.action_steps.map((s: string, i: number) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}

                <div className="grid sm:grid-cols-3 gap-3 pt-2 border-t text-sm">
                  <div className="flex gap-2"><Target className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /><div><div className="text-xs text-muted-foreground">Tác động</div>{r.expected_impact}</div></div>
                  <div className="flex gap-2"><Gauge className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /><div><div className="text-xs text-muted-foreground">KPI</div>{r.kpi}</div></div>
                  <div className="flex gap-2"><Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /><div><div className="text-xs text-muted-foreground">Thời gian</div>{r.timeline}</div></div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}