import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings/api")({
  head: () => ({ meta: [{ title: "Cài đặt API — MiMo Review Audit" }] }),
  component: ApiSettings,
});

function ApiSettings() {
  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Cài đặt API</h1>
        <p className="text-sm text-muted-foreground">Mô hình AI dùng để phân tích review.</p>
      </div>

      <Card className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <Brain className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Xiaomi MiMo-V2.5 Pro</h3>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Đã kết nối
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Endpoint: <code className="text-xs">https://api.xiaomimimo.com/v1</code>
            </p>
            <p className="text-sm text-muted-foreground">
              Model: <code className="text-xs">mimo-v2.5-pro</code>
            </p>
            <p className="text-sm mt-3">
              API key được lưu an toàn ở server (biến môi trường <code>MIMO_API_KEY</code>). Để xoay key, vào phần Backend → Secrets.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold mb-2">Nguyên tắc đạo đức</h3>
        <ul className="text-sm space-y-1.5 list-disc pl-5 text-muted-foreground">
          <li>Không tạo review giả, không mua bán review.</li>
          <li>Không xóa / báo cáo review tiêu cực thật.</li>
          <li>Mọi đề xuất tập trung vào cải thiện sản phẩm và dịch vụ thực tế.</li>
        </ul>
      </Card>
    </div>
  );
}