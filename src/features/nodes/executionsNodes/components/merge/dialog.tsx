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
import { GitMergeIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  variableName: z.string().trim().min(1, "Result variable is required."),
  input1Key: z.string().trim().min(1, "First input key is required."),
  input2Key: z.string().trim().min(1, "Second input key is required."),
  mode: z.enum(["append"]),
});

export type MergeFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: MergeFormValues) => void;
  defaultValues?: Partial<MergeFormValues>;
}

export const MergeDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<MergeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName ?? "merged",
      input1Key: defaultValues.input1Key ?? "",
      input2Key: defaultValues.input2Key ?? "",
      mode: defaultValues.mode ?? "append",
    },
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      variableName: defaultValues.variableName ?? "merged",
      input1Key: defaultValues.input1Key ?? "",
      input2Key: defaultValues.input2Key ?? "",
      mode: defaultValues.mode ?? "append",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = (values: MergeFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader className="border-b bg-muted/30 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <GitMergeIcon className="size-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle>Merge</DialogTitle>
              <DialogDescription>
                Combine outputs from two branches into one workflow context
                array.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5 px-6 py-5"
          >
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-sm font-medium">How it works</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Each input is a context key containing an array. If a branch was
                skipped by an If / Switch node, its missing key is treated as an
                empty array.
              </p>
            </div>

            <FormField
              control={form.control}
              name="input1Key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Input 1</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="trueResults"
                      autoComplete="off"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    Context key produced by the first branch.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="input2Key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Input 2</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="falseResults"
                      autoComplete="off"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    Context key produced by the second branch.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Merge Mode</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="append">Append arrays</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Concatenates the available input arrays in order.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Result Variable</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="merged"
                      autoComplete="off"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    Key where the combined array will be stored.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Merge</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
