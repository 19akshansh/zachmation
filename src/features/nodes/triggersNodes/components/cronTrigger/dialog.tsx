"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { TimerIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  cronExpression: z.string().trim().min(1, "Cron expression is required."),
});

export type CronTriggerFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CronTriggerFormValues) => void;
  defaultValues?: Partial<CronTriggerFormValues>;
}

export const CronTriggerDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<CronTriggerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cronExpression: defaultValues.cronExpression || "0 * * * *",
    },
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      cronExpression: defaultValues.cronExpression || "0 * * * *",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = (values: CronTriggerFormValues) => {
    onSubmit({ cronExpression: values.cronExpression.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-[650px]">
        <DialogHeader className="border-b bg-muted/30 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <TimerIcon className="size-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle>Schedule / Cron Trigger</DialogTitle>
              <DialogDescription>
                Start this workflow automatically according to a recurring cron
                expression.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5 px-6 py-5"
          >
            <FormField
              control={form.control}
              name="cronExpression"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cron Expression</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="font-mono"
                      placeholder="0 * * * *"
                    />
                  </FormControl>
                  <FormDescription>
                    Five-field cron syntax: minute, hour, day of month, month,
                    day of week.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <div>
                <h4 className="text-sm font-medium">Examples</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  The scheduler checks for due workflows every 5 minutes, so a
                  schedule may start within a few minutes of its exact due time.
                </p>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <code className="rounded bg-background px-2 py-1">
                    0 * * * *
                  </code>
                  <span className="text-muted-foreground">Every hour</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <code className="rounded bg-background px-2 py-1">
                    0 9 * * *
                  </code>
                  <span className="text-muted-foreground">
                    Every day at 9:00
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <code className="rounded bg-background px-2 py-1">
                    0 9 * * 1
                  </code>
                  <span className="text-muted-foreground">
                    Every Monday at 9:00
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <code className="rounded bg-background px-2 py-1">
                    */15 * * * *
                  </code>
                  <span className="text-muted-foreground">
                    Every 15 minutes
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
              <h4 className="text-sm font-medium">Scheduling note</h4>
              <p className="text-xs leading-5 text-muted-foreground">
                Cron schedules are evaluated by Zachmation's server-side
                scheduler. The node does not need a webhook or external service
                to fire. Invalid expressions are skipped until corrected.
              </p>
            </div>

            <DialogFooter>
              <Button type="submit">Save Schedule</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
