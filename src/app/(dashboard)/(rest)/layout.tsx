import { AppHeader } from "@/components/appHeader";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AppHeader />
      <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
    </>
  );
};

export default Layout;
