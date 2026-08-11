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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NodeType } from "@/generated/prisma/enums";
import { useCredentialsByNodeType } from "@/features/credentials/hooks/useCredentials";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  credentialId: z.string().min(1, "Gemini credential is required."),
  systemPrompt: z.string().optional(),
  userMessage: z.string().min(1, "User message is required."),
  memoryNamespace: z.string().optional(),
  maxSteps: z.number().int().min(1).max(10),
  variableName: z
    .string()
    .trim()
    .min(1, "Result variable is required.")
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, "Use a valid variable name."),
});

export type AgentFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AgentFormValues) => void;
  defaultValues?: Partial<AgentFormValues>;
}

export const AgentDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: credentials = [], isLoading } = useCredentialsByNodeType(NodeType.AGENT);

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credentialId: defaultValues.credentialId ?? "",
      systemPrompt: defaultValues.systemPrompt ?? "",
      userMessage: defaultValues.userMessage ?? "",
      memoryNamespace: defaultValues.memoryNamespace ?? "",
      maxSteps: defaultValues.maxSteps ?? 5,
      variableName: defaultValues.variableName ?? "agentResult",
    },
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      credentialId: defaultValues.credentialId ?? "",
      systemPrompt: defaultValues.systemPrompt ?? "",
      userMessage: defaultValues.userMessage ?? "",
      memoryNamespace: defaultValues.memoryNamespace ?? "",
      maxSteps: defaultValues.maxSteps ?? 5,
      variableName: defaultValues.variableName ?? "agentResult",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = (values: AgentFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Agent</DialogTitle>
          <DialogDescription>
            Give Gemini a goal and let it decide when to use web fetch and
            optional vector memory before producing a final answer.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="mt-4 space-y-5"
          >
            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gemini Credential</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Gemini credential" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {credentials.map((credential) => (
                        <SelectItem key={credential.id} value={credential.id}>
                          {credential.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Used for the agent's Gemini model and, when memory is
                    enabled, embeddings.
                    {isLoading ? " Loading..." : ""}
                  </FormDescription>
                  <FormMessage />
                  {!isLoading && credentials.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No Gemini credentials found. Create one first.
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="You are a helpful research assistant."
                      className="min-h-24 resize-y"
                    />
                  </FormControl>
                  <FormDescription>
                    Optional instructions that define the agent's behavior.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Message</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Research {{topic}} and summarize the important findings."
                      className="min-h-28 resize-y"
                    />
                  </FormControl>
                  <FormDescription>
                    The agent's task. Workflow context can be referenced with
                    Handlebars such as <code>{"{{topic}}"}</code>.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="memoryNamespace"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Memory Namespace</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="knowledge-base" />
                  </FormControl>
                  <FormDescription>
                    Optional. When set, the agent can search your Vector Store
                    memory in this namespace. Leave blank to disable memory.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="maxSteps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Steps</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        {...field}
                        onChange={(event) =>
                          field.onChange(event.target.valueAsNumber)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum model/tool iterations, from 1 to 10.
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
                      <Input {...field} placeholder="agentResult" />
                    </FormControl>
                    <FormDescription>
                      The final agent response is stored under this key.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Available tools</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Web fetch — read public HTTP(S) pages.</li>
                <li>Memory search — available only when a namespace is set.</li>
                <li>No write or mutation tools are exposed in this phase.</li>
              </ul>
            </div>

            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
