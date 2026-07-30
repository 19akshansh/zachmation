"use client";

import {
  CreditCardIcon,
  ExternalLinkIcon,
  Loader2Icon,
  SparklesIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHasActivePROSubscription } from "@/features/subscriptions/hooks/useSubscription";
import { authClient } from "@/lib/authClient";

export const BillingTab = () => {
  const { hasActivePROSubscription, subscription, isLoading } =
    useHasActivePROSubscription();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  const handleUpgrade = async () => {
    if (isUpgrading || isOpeningPortal) return;
    setIsUpgrading(true);

    try {
      toast.info("Generating checkout link...");
      const { data, error } = await authClient.checkout({ slug: "pro" });

      if (error) {
        toast.error(error.message || "Failed to initiate checkout.");
        return;
      }

      if (data?.url) window.location.href = data.url;
    } catch {
      toast.error("Failed to initiate checkout. Please try again.");
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleManageBilling = async () => {
    if (isOpeningPortal || isUpgrading) return;
    setIsOpeningPortal(true);

    try {
      const { data, error } = await authClient.customer.portal();

      if (error) {
        toast.error(error.message || "Could not open billing portal.");
        return;
      }

      if (data?.url) window.location.href = data.url;
    } catch {
      toast.error("Could not open billing portal.");
    } finally {
      setIsOpeningPortal(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plans & billing</CardTitle>
        <CardDescription>
          Manage your Zachmation plan, payment method, invoices, and
          cancellation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              {hasActivePROSubscription ? (
                <SparklesIcon className="size-4" />
              ) : (
                <CreditCardIcon className="size-4" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {isLoading
                  ? "Checking plan..."
                  : hasActivePROSubscription
                    ? "PRO plan"
                    : "Free plan"}
              </span>
              <span className="text-xs text-muted-foreground">
                {hasActivePROSubscription
                  ? "Unlimited workflows and credentials, plus access to PRO nodes."
                  : "1 workflow and 2 credentials. Upgrade to unlock PRO limits and nodes."}
              </span>
              {subscription?.status && (
                <span className="mt-1 text-xs text-muted-foreground">
                  Subscription status: {subscription.status}
                </span>
              )}
            </div>
          </div>

          {!hasActivePROSubscription && !isLoading && (
            <Button
              type="button"
              size="sm"
              onClick={handleUpgrade}
              disabled={isUpgrading || isOpeningPortal}
            >
              {isUpgrading && <Loader2Icon className="size-4 animate-spin" />}
              {isUpgrading ? "Redirecting..." : "Upgrade to PRO"}
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          Payment methods, invoices, and cancellation are handled securely in
          the billing portal.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleManageBilling}
          disabled={isOpeningPortal || isUpgrading}
        >
          {isOpeningPortal ? (
            <Loader2Icon className="size-3.5 animate-spin" />
          ) : (
            <ExternalLinkIcon className="size-3.5" />
          )}
          {isOpeningPortal ? "Redirecting..." : "Manage billing"}
        </Button>
      </CardFooter>
    </Card>
  );
};
