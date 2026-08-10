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
import { ListFilterIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const operatorSchema = z.enum([
  "equals",
  "notEquals",
  "contains",
  "greaterThan",
  "lessThan",
  "isEmpty",
  "isNotEmpty",
]);

const formSchema = z
  .object({
    sourceKey: z.string().trim().min(1, "Source array is required."),
    variableName: z.string().trim().min(1, "Result variable is required."),
    leftValue: z.string(),
    operator: operatorSchema,
    rightValue: z.string(),
  })
  .superRefine((values, ctx) => {
    if (!values.leftValue.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["leftValue"],
        message: "Left value is required.",
      });
    }

    if (
      !["isEmpty", "isNotEmpty"].includes(values.operator) &&
      !values.rightValue.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["rightValue"],
        message: "Right value is required for this operator.",
      });
    }
  });

export type FilterFormValues = z.output<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FilterFormValues) => void;
  defaultValues?: Partial<FilterFormValues>;
}

export const FilterDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sourceKey: defaultValues.sourceKey ?? "",
      variableName: defaultValues.variableName ?? "filtered",
      leftValue: defaultValues.leftValue ?? "",
      operator: defaultValues.operator ?? "equals",
      rightValue: defaultValues.rightValue ?? "",
    },
  });

  const operator = form.watch("operator");

  useEffect(() => {
    if (!open) return;

    form.reset({
      sourceKey: defaultValues.sourceKey ?? "",
      variableName: defaultValues.variableName ?? "filtered",
      leftValue: defaultValues.leftValue ?? "",
      operator: defaultValues.operator ?? "equals",
      rightValue: defaultValues.rightValue ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = (values: FilterFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <ListFilterIcon className="size-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle>Filter</DialogTitle>
              <DialogDescription>
                Keep only the items in an array that match a condition.
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
                    Context key containing the array to filter.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
              <FormField
                control={form.control}
                name="leftValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Left Value</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="{{$item.status}}"
                        autoComplete="off"
                        className="font-mono"
                      />
                    </FormControl>
                    <FormDescription>
                      Handlebars templates are resolved once for each item. Use
                      <code className="ml-1">$item</code> for the current item.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="operator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operator</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="notEquals">
                          Does not equal
                        </SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="greaterThan">
                          Greater than
                        </SelectItem>
                        <SelectItem value="lessThan">Less than</SelectItem>
                        <SelectItem value="isEmpty">Is empty</SelectItem>
                        <SelectItem value="isNotEmpty">Is not empty</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!["isEmpty", "isNotEmpty"].includes(operator) && (
                <FormField
                  control={form.control}
                  name="rightValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Right Value</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="active"
                          autoComplete="off"
                          className="font-mono"
                        />
                      </FormControl>
                      <FormDescription>
                        Handlebars templates are resolved once for each item.
                        Use <code>$item</code> for the current item.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Result Variable</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="filtered"
                      autoComplete="off"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    The filtered array will be stored under this context key.
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
