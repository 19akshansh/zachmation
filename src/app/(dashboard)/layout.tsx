import { AppSidebar } from "@/components/appSidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

const Layout = ({
  children,
} : {
  children: React.ReactNode;
}) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Layout