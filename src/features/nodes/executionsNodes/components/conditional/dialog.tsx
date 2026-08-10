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
import { GitBranchIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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

const caseSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Output label is required.")
    .regex(/^[A-Za-z_][A-Za-z0-9_-]*$/, "Use letters, numbers, _ or - only."),
  value: z.string(),
});

const formSchema = z
  .object({
    mode: z.enum(["if", "switch"]),
    leftValue: z.string(),
    operator: operatorSchema,
    rightValue: z.string(),
    switchValue: z.string(),
    cases: z.array(caseSchema),
  })
  .superRefine((values, ctx) => {
    if (values.mode === "if") {
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
    } else {
      if (!values.switchValue.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["switchValue"],
          message: "Switch value is required.",
        });
      }
      if (values.cases.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["cases"],
          message: "Add at least one case.",
        });
      }
      const labels = values.cases.map((item) =>
        item.label.trim().toLowerCase(),
      );
      if (new Set(labels).size !== labels.length) {
        ctx.addIssue({
          code: "custom",
          path: ["cases"],
          message: "Case output labels must be unique.",
        });
      }
    }
  });

export type ConditionalFormValues = z.output<typeof formSchema>;
type ConditionalFormInput = z.input<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ConditionalFormValues) => void;
  defaultValues?: Partial<ConditionalFormValues>;
}

const defaultCase: ConditionalFormInput["cases"][number] = {
  label: "case1",
  value: "",
};

export const ConditionalDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<ConditionalFormInput, unknown, ConditionalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: defaultValues.mode ?? "if",
      leftValue: defaultValues.leftValue ?? "",
      operator: defaultValues.operator ?? "equals",
      rightValue: defaultValues.rightValue ?? "",
      switchValue: defaultValues.switchValue ?? "",
      cases: defaultValues.cases?.length ? defaultValues.cases : [defaultCase],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cases",
  });

  const mode = form.watch("mode");
  const operator = form.watch("operator");

  useEffect(() => {
    if (!open) return;
    form.reset({
      mode: defaultValues.mode ?? "if",
      leftValue: defaultValues.leftValue ?? "",
      operator: defaultValues.operator ?? "equals",
      rightValue: defaultValues.rightValue ?? "",
      switchValue: defaultValues.switchValue ?? "",
      cases: defaultValues.cases?.length ? defaultValues.cases : [defaultCase],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = (values: ConditionalFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <GitBranchIcon className="size-5" />
            </div>
            <div>
              <DialogTitle>If / Switch</DialogTitle>
              <DialogDescription>
                Route execution through exactly one labeled output branch.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="mt-4 space-y-6"
          >
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mode</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="if">If — true / false</SelectItem>
                      <SelectItem value="switch">
                        Switch — multiple cases
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    If creates <code>true</code> and <code>false</code> outputs.
                    Switch creates one output per case plus <code>default</code>
                    .
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === "if" ? (
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
                          placeholder="{{set.[0].status}}"
                          className="font-mono"
                        />
                      </FormControl>
                      <FormDescription>
                        Handlebars templates are supported.
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
                          <SelectItem value="isNotEmpty">
                            Is not empty
                          </SelectItem>
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
                            className="font-mono"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            ) : (
              <div className="space-y-5 rounded-xl border bg-muted/20 p-4">
                <FormField
                  control={form.control}
                  name="switchValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Switch Value</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="{{webhook.[0].status}}"
                          className="font-mono"
                        />
                      </FormControl>
                      <FormDescription>
                        Evaluated once, then compared against each case.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <FormLabel>Cases</FormLabel>
                      <FormDescription>
                        Each label becomes an output handle.
                      </FormDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        append({ label: `case${fields.length + 1}`, value: "" })
                      }
                    >
                      <PlusIcon className="mr-1.5 size-4" /> Add case
                    </Button>
                  </div>

                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-[1fr_1.4fr_auto] gap-2 items-start rounded-lg border bg-background p-3"
                    >
                      <FormField
                        control={form.control}
                        name={`cases.${index}.label`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Output Label
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="active"
                                className="font-mono"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`cases.${index}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Match Value
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="active"
                                className="font-mono"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-6 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        aria-label="Remove case"
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <FormMessage>
                    {form.formState.errors.cases?.message}
                  </FormMessage>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
