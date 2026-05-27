import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Brain } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Đăng ký — MiMo Review Audit" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + "/dashboard" },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Tài khoản đã được tạo");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8">
        <Link to="/" className="flex items-center gap-2 font-semibold mb-6">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Brain className="h-4 w-4" />
          </span>
          MiMo Review Audit
        </Link>
        <h1 className="text-2xl font-bold">Tạo tài khoản miễn phí</h1>
        <p className="mt-1 text-sm text-muted-foreground">Bắt đầu phân tích review trong vài phút</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Mật khẩu</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            <p className="mt-1 text-xs text-muted-foreground">Tối thiểu 6 ký tự</p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Đang tạo..." : "Đăng ký"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-center text-muted-foreground">
          Đã có tài khoản? <Link to="/login" className="text-primary font-medium">Đăng nhập</Link>
        </p>
      </Card>
    </div>
  );
}