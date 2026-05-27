import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createBusiness, listBusinesses, deleteBusiness } from "@/lib/business.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Building2, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Tổng quan — MiMo Review Audit" }] }),
  component: Dashboard,
});

function Dashboard() {
  const list = useServerFn(listBusinesses);
  const create = useServerFn(createBusiness);
  const del = useServerFn(deleteBusiness);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["businesses"],
    queryFn: () => list(),
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", location: "", google_maps_url: "" });

  const m = useMutation({
    mutationFn: async () => create({ data: form }),
    onSuccess: (row: any) => {
      toast.success("Đã tạo doanh nghiệp");
      qc.invalidateQueries({ queryKey: ["businesses"] });
      setOpen(false);
      setForm({ name: "", category: "", location: "", google_maps_url: "" });
      navigate({ to: `/businesses/${row.id}/reviews` });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const dm = useMutation({
    mutationFn: async (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Đã xóa");
      qc.invalidateQueries({ queryKey: ["businesses"] });
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tổng quan</h1>
          <p className="text-sm text-muted-foreground">Quản lý doanh nghiệp và phân tích review</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Thêm doanh nghiệp</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Thêm doanh nghiệp</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Tên doanh nghiệp *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Ngành</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Nhà hàng, Salon, ..." /></div>
              <div><Label>Địa điểm</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Quận 1, TP.HCM" /></div>
              <div><Label>Google Maps URL</Label><Input value={form.google_maps_url} onChange={(e) => setForm({ ...form, google_maps_url: e.target.value })} placeholder="https://maps.google.com/..." /></div>
            </div>
            <DialogFooter>
              <Button onClick={() => m.mutate()} disabled={!form.name || m.isPending}>
                {m.isPending ? "Đang tạo..." : "Tạo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && <p className="text-muted-foreground">Đang tải...</p>}
        {!isLoading && (!data || data.length === 0) && (
          <Card className="p-10 col-span-full text-center">
            <Building2 className="h-10 w-10 mx-auto text-muted-foreground" />
            <h3 className="mt-4 font-semibold">Chưa có doanh nghiệp nào</h3>
            <p className="mt-1 text-sm text-muted-foreground">Bắt đầu bằng cách thêm doanh nghiệp đầu tiên.</p>
            <Button className="mt-4" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />Thêm doanh nghiệp</Button>
          </Card>
        )}
        {data?.map((b: any) => (
          <Card key={b.id} className="p-5 flex flex-col">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{b.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{b.category || "—"} · {b.location || "—"}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => dm.mutate(b.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Link to={`/businesses/${b.id}/reviews`} className="mt-4">
              <Button variant="outline" className="w-full justify-between">
                Mở <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}