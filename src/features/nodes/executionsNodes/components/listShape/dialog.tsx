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
import { ListTreeIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z
  .object({
    mode: z.enum(["sort", "removeDuplicates", "aggregate"]),
    sourceKey: z.string().trim().min(1, "Source array is required."),
    variableName: z.string().trim().min(1, "Result variable is required."),
    fieldPath: z.string().trim().optional(),
    sortDirection: z.enum(["asc", "desc"]),
    aggregateFieldName: z.string().trim().optional(),
  })
  .superRefine((values, ctx) => {
    if (!values.fieldPath) {
      ctx.addIssue({
        code: "custom",
        path: ["fieldPath"],
        message: "Field path is required.",
      });
    }

    if (values.mode === "aggregate" && !values.aggregateFieldName) {
      ctx.addIssue({
        code: "custom",
        path: ["aggregateFieldName"],
        message: "Aggregate field name is required.",
      });
    }
  });

export type ListShapeFormValues = z.output<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ListShapeFormValues) => void;
  defaultValues?: Partial<ListShapeFormValues>;
}

export const ListShapeDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<ListShapeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: defaultValues.mode ?? "sort",
      sourceKey: defaultValues.sourceKey ?? "",
      variableName: defaultValues.variableName ?? "shaped",
      fieldPath: defaultValues.fieldPath ?? "",
      sortDirection: defaultValues.sortDirection ?? "asc",
      aggregateFieldName: defaultValues.aggregateFieldName ?? "values",
    },
  });

  const mode = form.watch("mode");

  useEffect(() => {
    if (!open) return;

    form.reset({
      mode: defaultValues.mode ?? "sort",
      sourceKey: defaultValues.sourceKey ?? "",
      variableName: defaultValues.variableName ?? "shaped",
      fieldPath: defaultValues.fieldPath ?? "",
      sortDirection: defaultValues.sortDirection ?? "asc",
      aggregateFieldName: defaultValues.aggregateFieldName ?? "values",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = (values: ListShapeFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <ListTreeIcon className="size-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle>List Shape</DialogTitle>
              <DialogDescription>
                Sort, remove duplicates, or aggregate items from an array.
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
              name="mode"
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
                      <SelectItem value="sort">Sort</SelectItem>
                      <SelectItem value="removeDuplicates">
                        Remove Duplicates
                      </SelectItem>
                      <SelectItem value="aggregate">Aggregate</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose how the source array should be reshaped.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    Context key containing the array to transform.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fieldPath"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field Path</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="score"
                      autoComplete="off"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    Field used by the operation. Nested paths are supported, for
                    example <code>user.id</code>.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === "sort" && (
              <FormField
                control={form.control}
                name="sortDirection"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Direction</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {mode === "aggregate" && (
              <FormField
                control={form.control}
                name="aggregateFieldName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aggregate Field Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="scores"
                        autoComplete="off"
                        className="font-mono"
                      />
                    </FormControl>
                    <FormDescription>
                      Name of the array field on the single aggregated output
                      item.
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
                      placeholder="shaped"
                      autoComplete="off"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    Context key where the transformed array will be stored.
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
