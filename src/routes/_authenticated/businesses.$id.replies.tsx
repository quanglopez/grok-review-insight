import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getLatestReport } from "@/lib/analysis.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Copy, MessageSquareText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/businesses/$id/replies")({
  head: () => ({ meta: [{ title: "Mẫu phản hồi — MiMo Review Audit" }] }),
  component: RepliesPage,
});

function RepliesPage() {
  const { id } = Route.useParams();
  const get = useServerFn(getLatestReport);
  const { data, isLoading } = useQuery({
    queryKey: ["report", id],
    queryFn: () => get({ data: { business_id: id } }),
  });

  if (isLoading) return <div className="p-8 text-muted-foreground">Đang tải...</div>;

  const tpl = (data?.report?.reply_templates as any) || {};
  const hasAny = tpl.five_star || tpl.four_star || tpl.negative;

  if (!hasAny) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Card className="p-10 text-center space-y-4">
          <MessageSquareText className="h-12 w-12 mx-auto text-primary" />
          <h2 className="text-xl font-semibold">Chưa có mẫu phản hồi</h2>
          <p className="text-muted-foreground text-sm">Chạy phân tích để MiMo tạo mẫu phản hồi review cho bạn.</p>
          <Button asChild><Link to={`/businesses/${id}/report`}>Đến trang báo cáo</Link></Button>
        </Card>
      </div>
    );
  }

  const copy = (s: string) => {
    navigator.clipboard.writeText(s);
    toast.success("Đã sao chép");
  };

  const Section = ({ items }: { items?: string[] }) => (
    <div className="space-y-3">
      {(items || []).map((s, i) => (
        <Card key={i} className="p-4">
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{s}</p>
          <div className="flex justify-end mt-3">
            <Button size="sm" variant="outline" onClick={() => copy(s)}>
              <Copy className="h-3.5 w-3.5 mr-1.5" /> Sao chép
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Mẫu phản hồi review</h1>
        <p className="text-sm text-muted-foreground">Phản hồi chuyên nghiệp, chân thành — không bịa thông tin.</p>
      </div>
      <Tabs defaultValue="five">
        <TabsList>
          <TabsTrigger value="five">⭐ 5 sao</TabsTrigger>
          <TabsTrigger value="four">⭐ 3-4 sao</TabsTrigger>
          <TabsTrigger value="neg">⭐ Tiêu cực</TabsTrigger>
        </TabsList>
        <TabsContent value="five" className="mt-4"><Section items={tpl.five_star} /></TabsContent>
        <TabsContent value="four" className="mt-4"><Section items={tpl.four_star} /></TabsContent>
        <TabsContent value="neg" className="mt-4"><Section items={tpl.negative} /></TabsContent>
      </Tabs>
    </div>
  );
}