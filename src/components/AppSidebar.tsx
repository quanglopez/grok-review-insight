import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useRouterState, useParams } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Upload,
  FileBarChart,
  ListChecks,
  MessageSquareText,
  FileDown,
  Settings,
  Brain,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const params = useParams({ strict: false }) as { id?: string };
  const businessId = params.id;
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const businessLinks = businessId
    ? [
        { t: "Nhập review", to: `/businesses/${businessId}/reviews`, i: Upload },
        { t: "Báo cáo phân tích", to: `/businesses/${businessId}/report`, i: FileBarChart },
        { t: "20 cải thiện", to: `/businesses/${businessId}/recommendations`, i: ListChecks },
        { t: "Mẫu phản hồi", to: `/businesses/${businessId}/replies`, i: MessageSquareText },
        { t: "Xuất PDF", to: `/businesses/${businessId}/export`, i: FileDown },
      ]
    : [];

  const isActive = (p: string) => path === p;

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-2 font-semibold">
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Brain className="h-4 w-4" />
          </span>
          {!collapsed && <span className="text-sm">MiMo Audit</span>}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Tổng quan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
                  <Link to="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Tổng quan</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {businessId && (
          <SidebarGroup>
            <SidebarGroupLabel>Doanh nghiệp</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {businessLinks.map((l) => (
                  <SidebarMenuItem key={l.to}>
                    <SidebarMenuButton asChild isActive={isActive(l.to)}>
                      <Link to={l.to}>
                        <l.i className="h-4 w-4" />
                        <span>{l.t}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Cài đặt</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/settings/api")}>
                  <Link to="/settings/api">
                    <Settings className="h-4 w-4" />
                    <span>Cài đặt API</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <Button variant="ghost" size="sm" onClick={signOut} className="justify-start">
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Đăng xuất</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}