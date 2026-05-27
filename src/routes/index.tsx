import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sparkles,
  TrendingUp,
  MessageSquareText,
  ListChecks,
  FileDown,
  CheckCircle2,
  AlertTriangle,
  Brain,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MiMo Review Audit — Phân tích 100 review Google Maps bằng AI" },
      {
        name: "description",
        content:
          "Tìm ra khách hàng đang khen gì, chê gì và nhận 20 đề xuất cải thiện doanh nghiệp trong vài phút.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Brain className="h-4 w-4" />
            </span>
            MiMo Review Audit
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#problem" className="hover:text-foreground">Vấn đề</a>
            <a href="#how" className="hover:text-foreground">Cách hoạt động</a>
            <a href="#report" className="hover:text-foreground">Báo cáo</a>
            <a href="#pricing" className="hover:text-foreground">Bảng giá</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Đăng nhập</Button></Link>
            <Link to="/signup"><Button size="sm">Bắt đầu</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-accent/60 px-3 py-1 text-xs text-accent-foreground">
          <Sparkles className="h-3 w-3" />
          Phân tích review bằng AI MiMo của Xiaomi
        </div>
        <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto leading-tight">
          Phân tích 100 review Google Maps bằng MiMo
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Tìm ra khách hàng đang khen gì, chê gì và nhận 20 đề xuất cải thiện doanh nghiệp trong vài phút.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/signup">
            <Button size="lg" className="h-12 px-6 text-base">Bắt đầu phân tích</Button>
          </Link>
          <a href="#how">
            <Button size="lg" variant="outline" className="h-12 px-6 text-base">
              Xem cách hoạt động
            </Button>
          </a>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Không cần thẻ tín dụng • Báo cáo PDF tiếng Việt</p>
      </section>

      {/* Problem */}
      <section id="problem" className="border-y border-border/60 bg-card">
        <div className="container mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center">Vấn đề của doanh nghiệp</h2>
          <p className="mt-3 text-center text-muted-foreground max-w-2xl mx-auto">
            Bạn có hàng trăm review nhưng không biết khách hàng thực sự nghĩ gì.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { t: "Quá nhiều review để đọc", d: "Đọc thủ công 100 review tốn nhiều giờ và dễ bỏ sót xu hướng." },
              { t: "Không thấy bức tranh tổng thể", d: "Bạn biết có vấn đề nhưng không xác định được vấn đề nào quan trọng nhất." },
              { t: "Không biết cải thiện từ đâu", d: "Thiếu kế hoạch hành động cụ thể, đo lường được." },
            ].map((x) => (
              <Card key={x.t} className="p-6">
                <AlertTriangle className="h-6 w-6 text-warning" />
                <h3 className="mt-4 font-semibold">{x.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{x.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center">Hệ thống hoạt động như thế nào</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { i: 1, t: "Nhập review", d: "Tải lên CSV, dán thủ công hoặc nhập từng review từ Google Maps." },
            { i: 2, t: "AI phân tích", d: "MiMo đọc toàn bộ review, phân loại chủ đề, cảm xúc và khám phá pattern." },
            { i: 3, t: "Báo cáo & hành động", d: "Nhận báo cáo chi tiết, 20 đề xuất cải thiện và mẫu phản hồi review." },
          ].map((s) => (
            <Card key={s.i} className="p-6">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                {s.i}
              </div>
              <h3 className="mt-4 font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Report */}
      <section id="report" className="border-y border-border/60 bg-card">
        <div className="container mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center">Báo cáo gồm những gì</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { I: TrendingUp, t: "Điểm trung bình & cảm xúc", d: "Bức tranh tổng quan về sức khỏe thương hiệu." },
              { I: MessageSquareText, t: "Top điểm mạnh & điểm yếu", d: "Khách hàng khen gì, chê gì nhiều nhất." },
              { I: Brain, t: "Phân tích chủ đề & từ khóa", d: "Pattern lặp lại theo từng nhóm dịch vụ." },
              { I: ListChecks, t: "20 đề xuất cải thiện", d: "Mỗi đề xuất có vấn đề, bằng chứng, action, KPI." },
              { I: MessageSquareText, t: "Mẫu phản hồi review", d: "10 mẫu phản hồi cho review 5★, 4★ và tiêu cực." },
              { I: FileDown, t: "Xuất PDF tiếng Việt", d: "Báo cáo chuyên nghiệp gửi cho ban giám đốc." },
            ].map((x) => (
              <Card key={x.t} className="p-6">
                <x.I className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-semibold">{x.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{x.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center">Bảng giá</h2>
        <p className="mt-3 text-center text-muted-foreground">Trả tiền theo nhu cầu, hủy bất kỳ lúc nào.</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            { t: "Thử nghiệm", p: "Miễn phí", d: "1 doanh nghiệp, 1 lần phân tích / tháng", f: ["Tối đa 50 review", "Báo cáo cơ bản", "Không xuất PDF"] },
            { t: "Doanh nghiệp", p: "499.000đ", s: "/tháng", d: "Phù hợp nhà hàng, salon, cửa hàng", f: ["3 doanh nghiệp", "Tối đa 100 review/lần", "Xuất PDF không giới hạn", "Mẫu phản hồi đầy đủ"], highlight: true },
            { t: "Chuỗi", p: "1.499.000đ", s: "/tháng", d: "Cho chuỗi & agency", f: ["Không giới hạn doanh nghiệp", "Phân tích theo chi nhánh", "Hỗ trợ ưu tiên"] },
          ].map((x) => (
            <Card key={x.t} className={`p-6 ${x.highlight ? "border-primary ring-2 ring-primary/20" : ""}`}>
              <h3 className="font-semibold">{x.t}</h3>
              <p className="mt-4 text-3xl font-bold">{x.p}<span className="text-sm font-normal text-muted-foreground">{x.s}</span></p>
              <p className="mt-2 text-sm text-muted-foreground">{x.d}</p>
              <ul className="mt-6 space-y-2 text-sm">
                {x.f.map((it) => (
                  <li key={it} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" /> {it}
                  </li>
                ))}
              </ul>
              <Link to="/signup">
                <Button className="mt-6 w-full" variant={x.highlight ? "default" : "outline"}>
                  Bắt đầu
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border/60 bg-card">
        <div className="container mx-auto px-4 py-20 max-w-3xl">
          <h2 className="text-3xl font-bold text-center">Câu hỏi thường gặp</h2>
          <Accordion type="single" collapsible className="mt-8">
            {[
              { q: "Dữ liệu review có được bảo mật không?", a: "Có. Toàn bộ dữ liệu được lưu riêng cho từng tài khoản và chỉ bạn truy cập được." },
              { q: "AI có hiểu tiếng Việt không?", a: "MiMo của Xiaomi xử lý tiếng Việt tốt, kể cả từ địa phương và viết tắt thường gặp trong review." },
              { q: "Tôi lấy review từ Google Maps bằng cách nào?", a: "Bạn có thể dùng các công cụ export như Outscraper hoặc dán thủ công vào form trong app." },
              { q: "App có gợi ý review giả không?", a: "Không. Chúng tôi tuyệt đối không gợi ý tạo review giả hay thao túng đánh giá." },
              { q: "Tôi có thể hủy bất kỳ lúc nào không?", a: "Có. Bạn có thể hủy hoặc đổi gói trong phần Cài đặt." },
            ].map((it, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{it.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{it.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MiMo Review Audit</p>
          <p>Phân tích bằng MiMo-V2.5 của Xiaomi</p>
        </div>
      </footer>
    </div>
  );
}
