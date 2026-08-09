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
import { Repeat2Icon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  sourceKey: z.string().trim().min(1, "Source array is required."),
  variableName: z.string().trim().min(1, "Result variable is required."),
});

export type LoopFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: LoopFormValues) => void;
  defaultValues?: Partial<LoopFormValues>;
}

export const LoopDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<LoopFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sourceKey: defaultValues.sourceKey ?? "",
      variableName: defaultValues.variableName ?? "loopResults",
    },
  });
  useEffect(() => {
    if (!open) return;

    form.reset({
      sourceKey: defaultValues.sourceKey ?? "",
      variableName: defaultValues.variableName ?? "loopResults",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = (values: LoopFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-border/60 p-0 shadow-2xl sm:max-w-[540px]">
        <DialogHeader className="border-b bg-muted/30 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Repeat2Icon className="size-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle>Loop</DialogTitle>
              <DialogDescription>
                Iterate over an array and run the connected loop branch once
                for each item.
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
                The source must already be an array in the workflow context.
                Each iteration exposes the current item as{" "}
                <code className="rounded bg-background px-1.5 py-0.5 font-mono text-[11px]">
                  {`{{$item.[0]}}`}
                </code>
                .
              </p>
            </div>

            <FormField
              control={form.control}
              name="sourceKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source Array</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="urls"
                      autoComplete="off"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    Context key containing the array to iterate, for example{" "}
                    <code>urls</code>.
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
                      placeholder="shortenedUrls"
                      autoComplete="off"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    Key where the collected iteration results are stored.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="border-t pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Loop</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
