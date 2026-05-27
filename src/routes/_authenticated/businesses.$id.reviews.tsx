import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Papa from "papaparse";
import { getBusiness } from "@/lib/business.functions";
import { upsertReviews, listReviews, clearReviews } from "@/lib/business.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Trash2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/businesses/$id/reviews")({
  head: () => ({ meta: [{ title: "Nhập review — MiMo Review Audit" }] }),
  component: ReviewsPage,
});

type Row = { reviewer_name?: string; rating: number; review_text?: string; review_date?: string; owner_reply?: string };

function ReviewsPage() {
  const { id } = Route.useParams();
  const getBiz = useServerFn(getBusiness);
  const list = useServerFn(listReviews);
  const upsert = useServerFn(upsertReviews);
  const clear = useServerFn(clearReviews);
  const qc = useQueryClient();

  const { data: biz } = useQuery({ queryKey: ["biz", id], queryFn: () => getBiz({ data: { id } }) });
  const { data: reviews } = useQuery({ queryKey: ["reviews", id], queryFn: () => list({ data: { business_id: id } }) });

  const [draft, setDraft] = useState<Row[]>([]);
  const [manual, setManual] = useState({ reviewer_name: "", rating: 5, review_text: "", review_date: "", owner_reply: "" });

  const m = useMutation({
    mutationFn: async () => upsert({ data: { business_id: id, reviews: draft } }),
    onSuccess: () => {
      toast.success(`Đã lưu ${draft.length} review`);
      setDraft([]);
      qc.invalidateQueries({ queryKey: ["reviews", id] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleCsv = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows: Row[] = (res.data as any[])
          .map((r) => ({
            reviewer_name: r.reviewer_name || r.name || r.author || "",
            rating: parseInt(r.rating || r.stars || r.score || "0", 10),
            review_text: r.review_text || r.text || r.content || r.review || "",
            review_date: r.review_date || r.date || "",
            owner_reply: r.owner_reply || r.reply || "",
          }))
          .filter((r) => r.rating >= 1 && r.rating <= 5);
        setDraft(rows);
        toast.success(`Đã đọc ${rows.length} review từ CSV`);
      },
      error: () => toast.error("Không đọc được file CSV"),
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl font-bold">{biz?.name || "Doanh nghiệp"}</h1>
      <p className="text-sm text-muted-foreground">Nhập review để bắt đầu phân tích</p>

      <Card className="mt-6 p-6">
        <Tabs defaultValue="csv">
          <TabsList>
            <TabsTrigger value="csv">Tải CSV</TabsTrigger>
            <TabsTrigger value="paste">Nhập thủ công</TabsTrigger>
          </TabsList>
          <TabsContent value="csv" className="space-y-3 mt-4">
            <p className="text-sm text-muted-foreground">
              File CSV với các cột: reviewer_name, rating, review_text, review_date, owner_reply
            </p>
            <Input type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && handleCsv(e.target.files[0])} />
          </TabsContent>
          <TabsContent value="paste" className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Tên người đánh giá</Label><Input value={manual.reviewer_name} onChange={(e) => setManual({ ...manual, reviewer_name: e.target.value })} /></div>
              <div><Label>Số sao (1-5)</Label><Input type="number" min={1} max={5} value={manual.rating} onChange={(e) => setManual({ ...manual, rating: parseInt(e.target.value) || 5 })} /></div>
              <div><Label>Ngày</Label><Input type="date" value={manual.review_date} onChange={(e) => setManual({ ...manual, review_date: e.target.value })} /></div>
              <div><Label>Phản hồi chủ shop</Label><Input value={manual.owner_reply} onChange={(e) => setManual({ ...manual, owner_reply: e.target.value })} /></div>
            </div>
            <Label>Nội dung review</Label>
            <Textarea rows={4} value={manual.review_text} onChange={(e) => setManual({ ...manual, review_text: e.target.value })} />
            <Button variant="outline" onClick={() => {
              if (!manual.review_text) return toast.error("Nhập nội dung review");
              setDraft([...draft, { ...manual }]);
              setManual({ ...manual, reviewer_name: "", review_text: "", review_date: "" });
              toast.success("Đã thêm vào danh sách");
            }}>Thêm vào danh sách</Button>
          </TabsContent>
        </Tabs>
      </Card>

      {draft.length > 0 && (
        <Card className="mt-6 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Sẵn sàng lưu ({draft.length})</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDraft([])}>Xóa nháp</Button>
              <Button onClick={() => m.mutate()} disabled={m.isPending}>
                {m.isPending ? "Đang lưu..." : `Lưu ${draft.length} review`}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Review đã lưu ({reviews?.length ?? 0})</h2>
          {reviews && reviews.length >= 5 && (
            <Link to={`/businesses/${id}/report`}>
              <Button><Sparkles className="h-4 w-4 mr-2" />Phân tích bằng MiMo</Button>
            </Link>
          )}
          {reviews && reviews.length > 0 && (
            <Button variant="ghost" size="sm" onClick={async () => {
              await clear({ data: { business_id: id } });
              qc.invalidateQueries({ queryKey: ["reviews", id] });
              toast.success("Đã xóa tất cả review");
            }}>
              <Trash2 className="h-4 w-4 mr-1" />Xóa tất cả
            </Button>
          )}
        </div>
        {(!reviews || reviews.length === 0) ? (
          <p className="mt-6 text-sm text-muted-foreground text-center py-10">
            Chưa có review nào. Tải CSV hoặc nhập thủ công ở trên.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground border-b border-border">
                <tr><th className="py-2 px-2">Người</th><th className="px-2">Sao</th><th className="px-2">Nội dung</th><th className="px-2">Ngày</th></tr>
              </thead>
              <tbody>
                {reviews.slice(0, 100).map((r: any) => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="py-2 px-2">{r.reviewer_name || "Ẩn danh"}</td>
                    <td className="px-2">⭐{r.rating}</td>
                    <td className="px-2 max-w-md truncate">{r.review_text}</td>
                    <td className="px-2 text-muted-foreground">{r.review_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}