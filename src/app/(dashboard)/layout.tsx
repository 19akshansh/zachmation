import { AppSidebar } from "@/components/appSiderbar"
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