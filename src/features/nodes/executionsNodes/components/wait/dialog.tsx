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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock3Icon, CopyIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  mode: z.enum(["duration", "webhook"]),
  duration: z.number().min(1, "Duration must be at least 1."),
  unit: z.enum(["seconds", "minutes", "hours"]),
  variableName: z.string().trim().optional(),
});

export type WaitFormValues = {
  mode: "duration" | "webhook";
  durationMs?: number;
  variableName?: string;
};

type WaitFormInput = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: WaitFormValues) => void;
  defaultValues?: Partial<WaitFormValues>;
  nodeId: string;
}

const unitMultipliers = {
  seconds: 1000,
  minutes: 60 * 1000,
  hours: 60 * 60 * 1000,
} as const;

export const WaitDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
  nodeId,
}: Props) => {
  const [copied, setCopied] = useState(false);

  const webhookUrl = useMemo(() => {
    return `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/resume?nodeId=${nodeId}`;
  }, [nodeId]);

  const form = useForm<WaitFormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: defaultValues.mode ?? "duration",
      duration: Math.max(1, (defaultValues.durationMs ?? 10_000) / 1000),
      unit: "seconds",
      variableName: defaultValues.variableName ?? "",
    },
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      mode: defaultValues.mode ?? "duration",
      duration: Math.max(1, (defaultValues.durationMs ?? 10_000) / 1000),
      unit: "seconds",
      variableName: defaultValues.variableName ?? "",
    });
    setCopied(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const mode = form.watch("mode");

  const handleSubmit = (values: WaitFormInput) => {
    onSubmit({
      mode: values.mode,
      durationMs:
        values.mode === "duration"
          ? Math.round(values.duration * unitMultipliers[values.unit])
          : undefined,
      variableName: values.variableName?.trim() || undefined,
    });
    onOpenChange(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-[650px]">
        <DialogHeader className="border-b bg-muted/30 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Clock3Icon className="size-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle>Wait / Delay</DialogTitle>
              <DialogDescription>
                Pause this workflow for a fixed duration or resume it from a
                webhook.
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
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wait Mode</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="duration">Fixed duration</SelectItem>
                      <SelectItem value="webhook">Resume by webhook</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose whether the workflow resumes automatically or waits
                    for an external request.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === "duration" ? (
              <div className="grid grid-cols-[1fr_180px] gap-3">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          step="any"
                          value={field.value}
                          onChange={(event) =>
                            field.onChange(event.target.valueAsNumber)
                          }
                        />
                      </FormControl>
                      <FormDescription>Minimum 1 second.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="seconds">Seconds</SelectItem>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <div className="space-y-2 rounded-xl border bg-muted/20 p-4">
                <p className="text-sm font-medium">Resume URL</p>
                <p className="text-xs leading-5 text-muted-foreground">
                  POST any JSON payload to this URL to resume this workflow.
                </p>
                <div className="flex gap-2">
                  <Input
                    value={webhookUrl}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button type="button" variant="outline" onClick={handleCopy}>
                    <CopyIcon className="mr-2 size-4" />
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
            )}

            {mode === "webhook" && (
              <FormField
                control={form.control}
                name="variableName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Response Variable (optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="resumeData"
                        autoComplete="off"
                        className="font-mono"
                      />
                    </FormControl>
                    <FormDescription>
                      If set, the webhook JSON body is stored under this context
                      key when the workflow resumes.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Wait</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
