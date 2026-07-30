"use client";

import {
  CreditCardIcon,
  FolderOpenIcon,
  HistoryIcon,
  KeyIcon,
  LogOutIcon,
  PlusCircleIcon,
  SettingsIcon,
  StarIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "./ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useCreateWorkflow } from "@/features/workflows/hooks/useWorkflows";
import { useHasActivePROSubscription } from "@/features/subscriptions/hooks/useSubscription";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { authClient } from "@/lib/authClient";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Main",
    items: [
      { title: "Workflows", icon: FolderOpenIcon, url: "/workflows" },
      { title: "Credentials", icon: KeyIcon, url: "/credentials" },
      { title: "Executions", icon: HistoryIcon, url: "/executions" },
      { title: "Settings", icon: SettingsIcon, url: "/settings" },
    ],
  },
];

export const AppSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const { hasActivePROSubscription, isLoading } = useHasActivePROSubscription();
  const createWorkflow = useCreateWorkflow();
  const { handleError, modal } = useUpgradeModal();

  const userName = session?.user?.name || "User";
  const userImage = session?.user?.image;
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleCreateWorkflow = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (data) => router.push(`/workflows/${data.id}`),
      onError: (error) => handleError(error),
    });
  };

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/signin"),
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    });
  };

  return (
    <>
      {modal}
      <Sidebar
        collapsible="icon"
        className="border-r border-sidebar-border bg-sidebar"
      >
        <SidebarHeader className="pt-4">
          <SidebarMenu>
            <SidebarMenuItem className="list-none outline-none">
              <SidebarMenuButton
                asChild
                size="lg"
                className="hover:bg-transparent group-data-[state=collapsed]:px-2"
              >
                <Link prefetch href="/workflows">
                  <Image
                    src="/logo.svg"
                    alt="Zachmation"
                    width={30}
                    height={30}
                    className="shrink-0"
                  />
                  <div className="ml-2 flex flex-col gap-0.5 leading-none group-data-[state=collapsed]:hidden">
                    <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
                      Zachmation
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-widest text-sidebar-primary/80">
                      Automate anything
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="mt-4 px-1 group-data-[state=collapsed]:px-0">
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="New Workflow"
                  disabled={createWorkflow.isPending}
                  onClick={handleCreateWorkflow}
                  className="h-11 w-full bg-primary font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:text-primary-foreground hover:shadow-[0_0_15px_var(--color-primary)]/40 active:scale-[0.98] group-data-[state=collapsed]:justify-start group-data-[state=collapsed]:px-2"
                >
                  <PlusCircleIcon className="size-5 shrink-0 fill-primary-foreground/20" />
                  <span className="whitespace-nowrap group-data-[state=collapsed]:hidden">
                    {createWorkflow.isPending ? "Creating..." : "New Workflow"}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {menuItems.map((group) => (
            <SidebarGroup key={group.title} className="py-3">
              <SidebarGroupLabel className="px-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50 group-data-[state=collapsed]:hidden">
                {group.title}
              </SidebarGroupLabel>
              <SidebarGroupContent className="mt-1 px-2 group-data-[state=collapsed]:px-0">
                <SidebarMenu>
                  {group.items.map((item) => {
                    const active =
                      item.url === "/"
                        ? pathname === "/"
                        : pathname === item.url ||
                          pathname.startsWith(`${item.url}/`);

                    return (
                      <SidebarMenuItem
                        className="list-none outline-none"
                        key={item.title}
                      >
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={active}
                          asChild
                          className={cn(
                            "relative h-10 px-3 transition-colors duration-200 group-data-[state=collapsed]:justify-start group-data-[state=collapsed]:px-2",
                            active
                              ? "bg-sidebar-primary/10 text-sidebar-primary hover:bg-sidebar-primary/15 hover:text-sidebar-primary"
                              : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          )}
                        >
                          <Link href={item.url} prefetch>
                            <item.icon
                              className={cn(
                                "size-4 shrink-0",
                                active ? "text-sidebar-primary" : "opacity-70",
                              )}
                            />
                            <span className="whitespace-nowrap font-medium group-data-[state=collapsed]:hidden">
                              {item.title}
                            </span>
                            {active && (
                              <span className="absolute left-0 h-5 w-1 rounded-full bg-sidebar-primary group-data-[state=collapsed]:hidden" />
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="p-2">
          <SidebarMenu>
            {!hasActivePROSubscription && !isLoading && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Upgrade to PRO"
                  className="h-10 px-3 text-amber-400 transition-colors hover:bg-amber-400/10 hover:text-amber-300 group-data-[state=collapsed]:px-2"
                  onClick={async () => {
                    try {
                      toast.info("Redirecting to BETA checkout...");
                      await authClient.checkout({ slug: "pro" });
                    } catch (error) {
                      console.error("Checkout error:", error);
                      toast.error(
                        "Failed to initiate checkout. Please try again.",
                      );
                    }
                  }}
                >
                  <StarIcon className="size-4 shrink-0" />
                  <span className="group-data-[state=collapsed]:hidden">
                    Upgrade to PRO
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Billing Portal"
                className="h-10 px-3 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[state=collapsed]:px-2"
                onClick={() => authClient.customer.portal()}
              >
                <CreditCardIcon className="size-4 shrink-0 opacity-70" />
                <span className="group-data-[state=collapsed]:hidden">
                  Billing Portal
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <SidebarSeparator className="my-2" />

          <div className="flex items-center gap-2 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-2 transition-colors hover:border-sidebar-ring/40 hover:bg-sidebar-accent/70 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:p-1.5">
            <Avatar className="size-8 shrink-0">
              {userImage ? (
                <AvatarImage src={userImage} alt={userName} />
              ) : null}
              <AvatarFallback className="text-xs font-semibold">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 group-data-[state=collapsed]:hidden">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">
                {userName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {hasActivePROSubscription ? "PRO plan" : "Free plan"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out"
              aria-label="Sign out"
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive group-data-[state=collapsed]:hidden"
            >
              <LogOutIcon className="size-4" />
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
};
