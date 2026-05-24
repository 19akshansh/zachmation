"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  ANTHROPIC_MODELS,
  type AnthropicModelId,
} from "@/config/ai/anthropicModels";

const ANTHROPIC_MODEL_IDS = ANTHROPIC_MODELS.map((model) => model.id) as [
  AnthropicModelId,
  ...AnthropicModelId[],
];

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, {
      message: "Please add a Variable Name",
    })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    }),
  model: z.enum(ANTHROPIC_MODEL_IDS),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, "Prompt required."),
});

export type AnthropicFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AnthropicFormValues) => void;
  defaultValues?: Partial<AnthropicFormValues>;
}

export const AnthropicDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<AnthropicFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      model: defaultValues.model || ANTHROPIC_MODELS[0].id,
      systemPrompt: defaultValues.systemPrompt || "",
      userPrompt: defaultValues.userPrompt || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        model: defaultValues.model || ANTHROPIC_MODELS[0].id,
        systemPrompt: defaultValues.systemPrompt || "",
        userPrompt: defaultValues.userPrompt || "",
      });
    }
  }, [open, defaultValues, form]);

  const demoVarName = "myClaudeResponse";

  const watchVariableName = form.watch("variableName") || demoVarName;

  const handleSubmit = (values: AnthropicFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Anthropic (Chat) Config</DialogTitle>

          <DialogDescription>
            Configure settings for Claude chat generation.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="mt-4 space-y-8"
          >
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>

                  <FormControl>
                    <Input {...field} placeholder={demoVarName} />
                  </FormControl>

                  <FormDescription>
                    Use this name to reference the result in other nodes:{" "}
                    {`{{${watchVariableName}.text}}`}
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>

                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {ANTHROPIC_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormDescription>
                    Select the Claude model used for AI generation
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt (Optional)</FormLabel>

                  <FormControl>
                    <Textarea
                      placeholder="You are a helpful assistant"
                      className="min-h-[120px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    Sets the behavior of the assistant. Use {"{{variableName}}"}{" "}
                    for simple values or {"{{json.variableName}}"} to stringify
                    objects.
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Prompt</FormLabel>

                  <FormControl>
                    <Textarea
                      placeholder="Summarize this text..."
                      className="min-h-[120px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    This prompt is sent to the AI. Use {"{{aiResponse}}"} for
                    simple values or {"{{json.aiResponse}}"} to stringify
                    objects.
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
