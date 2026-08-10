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
import { CalendarClockIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const operationSchema = z.enum([
  "format",
  "addDays",
  "addHours",
  "addMinutes",
  "subtractDays",
  "subtractHours",
  "subtractMinutes",
]);

const formSchema = z
  .object({
    sourceKey: z.string().trim().min(1, "Source array is required."),
    variableName: z.string().trim().min(1, "Result variable is required."),
    dateValueTemplate: z.string().min(1, "Date value is required."),
    operation: operationSchema,
    formatPattern: z.string().optional(),
    amount: z.number().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.operation === "format" && !values.formatPattern?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["formatPattern"],
        message: "Format pattern is required.",
      });
    }

    if (values.operation !== "format" && values.amount === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Amount is required.",
      });
    }
  });

export type DateTimeFormValues = z.output<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: DateTimeFormValues) => void;
  defaultValues?: Partial<DateTimeFormValues>;
}

export const DateTimeDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<DateTimeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sourceKey: defaultValues.sourceKey ?? "",
      variableName: defaultValues.variableName ?? "dateResult",
      dateValueTemplate: defaultValues.dateValueTemplate ?? "{{$item.date}}",
      operation: defaultValues.operation ?? "format",
      formatPattern: defaultValues.formatPattern ?? "MMM d, yyyy",
      amount: defaultValues.amount ?? 1,
    },
  });

  const operation = form.watch("operation");

  useEffect(() => {
    if (!open) return;

    form.reset({
      sourceKey: defaultValues.sourceKey ?? "",
      variableName: defaultValues.variableName ?? "dateResult",
      dateValueTemplate: defaultValues.dateValueTemplate ?? "{{$item.date}}",
      operation: defaultValues.operation ?? "format",
      formatPattern: defaultValues.formatPattern ?? "MMM d, yyyy",
      amount: defaultValues.amount ?? 1,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = (values: DateTimeFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <CalendarClockIcon className="size-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle>Date &amp; Time</DialogTitle>
              <DialogDescription>
                Format or shift ISO dates for every item in a context array.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="mt-4 space-y-5"
          >
            <FormField
              control={form.control}
              name="sourceKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source Array</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="items"
                      autoComplete="off"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    Context key containing the array to process.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateValueTemplate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Value</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="{{$item.date}}"
                      autoComplete="off"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    Handlebars template resolved once per item. The resolved
                    value must be an ISO 8601 date.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="operation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operation</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="format">Format</SelectItem>
                      <SelectItem value="addDays">Add days</SelectItem>
                      <SelectItem value="addHours">Add hours</SelectItem>
                      <SelectItem value="addMinutes">Add minutes</SelectItem>
                      <SelectItem value="subtractDays">
                        Subtract days
                      </SelectItem>
                      <SelectItem value="subtractHours">
                        Subtract hours
                      </SelectItem>
                      <SelectItem value="subtractMinutes">
                        Subtract minutes
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Format the date or shift it forward/backward.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {operation === "format" ? (
              <FormField
                control={form.control}
                name="formatPattern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Format Pattern</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="MMM d, yyyy"
                        autoComplete="off"
                        className="font-mono"
                      />
                    </FormControl>
                    <FormDescription>
                      date-fns pattern, e.g. <code>MMM d, yyyy</code>.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="1"
                        placeholder="1"
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === ""
                              ? undefined
                              : Number(event.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Number of days, hours, or minutes to shift.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Result Variable</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="dateResult"
                      autoComplete="off"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    The processed values will be stored under this context key.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
