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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Code2Icon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  language: z.enum(["javascript", "python"]),
  variableName: z
    .string()
    .trim()
    .min(1, "Please add a result variable")
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    }),
  code: z.string().trim().min(1, "Please add some code"),
});

export type SandboxedCodeFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SandboxedCodeFormValues) => void;
  defaultValues?: Partial<SandboxedCodeFormValues>;
}

const DEFAULT_CODE: Record<"javascript" | "python", string> = {
  javascript: "return context.items?.[0] ?? null;",
  python: 'return context.get("items", [None])[0];',
} as const;

export const SandboxedCodeDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<SandboxedCodeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: defaultValues.language ?? "javascript",
      variableName: defaultValues.variableName ?? "codeResult",
      code: defaultValues.code ?? DEFAULT_CODE.javascript,
    },
  });

  useEffect(() => {
    if (!open) return;

    const language = defaultValues.language ?? "javascript";

    form.reset({
      language,
      variableName: defaultValues.variableName ?? "codeResult",
      code: defaultValues.code ?? DEFAULT_CODE[language],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const language = form.watch("language");

  const handleLanguageChange = (value: "javascript" | "python") => {
    form.setValue("language", value);

    const currentCode = form.getValues("code").trim();
    if (
      !currentCode ||
      Object.values(DEFAULT_CODE).includes(currentCode as any)
    ) {
      form.setValue("code", DEFAULT_CODE[value]);
    }
  };

  const handleSubmit = (values: SandboxedCodeFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[760px]">
        <DialogHeader className="border-b bg-muted/30 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Code2Icon className="size-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle>Sandboxed Code</DialogTitle>
              <DialogDescription>
                Run JavaScript or Python against a JSON snapshot of the current
                workflow context.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5 px-6 py-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={handleLanguageChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Execution is isolated in the configured code server.
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
                        placeholder="codeResult"
                        className="font-mono"
                      />
                    </FormControl>
                    <FormDescription>
                      The returned value is stored as one item under this key.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      spellCheck={false}
                      className="min-h-[320px] resize-y font-mono text-sm leading-6"
                      placeholder={DEFAULT_CODE[language]}
                    />
                  </FormControl>
                  <FormDescription>
                    The current context is available as <code>context</code>.
                    Return the value you want to store. Network, credentials,
                    and the Zachmation server process are not exposed to the
                    sandbox.
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
              <Button type="submit">Save Code</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
