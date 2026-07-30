"use client";

import { AlertTriangleIcon, CreditCardIcon } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { BillingTab } from "./billingTab";
import { DangerZoneTab } from "./dangerZoneTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Settings = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const requestedTab = searchParams.get("tab");
  const tab = requestedTab === "danger-zone" ? "danger-zone" : "billing";

  const setTab = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="p-4 md:px-10 md:py-6 h-full max-w-[100vw] overflow-x-hidden">
      <div className="mx-auto flex h-full w-full max-w-screen-xl flex-col gap-y-8">
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold md:text-xl">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your subscription and account.
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-max">
            <TabsTrigger value="billing">
              <CreditCardIcon /> Billing
            </TabsTrigger>
            <TabsTrigger value="danger-zone">
              <AlertTriangleIcon /> Danger Zone
            </TabsTrigger>
          </TabsList>
          <TabsContent value="billing" className="mt-4 max-w-2xl">
            <BillingTab />
          </TabsContent>
          <TabsContent value="danger-zone" className="mt-4 max-w-2xl">
            <DangerZoneTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
