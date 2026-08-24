import { AppSidebar } from "@/components/crm/app-sidebar"
import { DashboardHeader } from "@/components/crm/dashboard-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return <SidebarProvider><AppSidebar /><SidebarInset><DashboardHeader />{children}</SidebarInset></SidebarProvider>
}
