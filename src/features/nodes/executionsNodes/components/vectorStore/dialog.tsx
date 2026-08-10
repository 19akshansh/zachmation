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
import { zodResolver } from "@hookform/resolvers/zod";
import { BrainCircuitIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CredentialType } from "@/generated/prisma/enums";
import { useCredentialsByType } from "@/features/credentials/hooks/useCredentials";

const formSchema = z
  .object({
    credentialId: z.string().min(1, "Gemini credential is required."),
    operation: z.enum(["store", "search"]),
    namespace: z.string().trim().min(1, "Namespace is required."),
    content: z.string().optional(),
    query: z.string().optional(),
    limit: z.number().int().min(1).max(20),
    variableName: z.string().trim().min(1, "Result variable is required."),
  })
  .superRefine((values, ctx) => {
    if (values.operation === "store" && !values.content?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["content"],
        message: "Content is required when storing memory.",
      });
    }

    if (values.operation === "search" && !values.query?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["query"],
        message: "Query is required when searching memory.",
      });
    }
  });

export type VectorStoreFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: VectorStoreFormValues) => void;
  defaultValues?: Partial<VectorStoreFormValues>;
}

export const VectorStoreDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: credentials = [], isLoading } = useCredentialsByType(
    CredentialType.GEMINI,
  );

  const form = useForm<VectorStoreFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credentialId: defaultValues.credentialId ?? "",
      operation: defaultValues.operation ?? "store",
      namespace: defaultValues.namespace ?? "default",
      content: defaultValues.content ?? "",
      query: defaultValues.query ?? "",
      limit: defaultValues.limit ?? 5,
      variableName: defaultValues.variableName ?? "memoryResult",
    },
  });

  const operation = form.watch("operation");

  useEffect(() => {
    if (!open) return;

    form.reset({
      credentialId: defaultValues.credentialId ?? "",
      operation: defaultValues.operation ?? "store",
      namespace: defaultValues.namespace ?? "default",
      content: defaultValues.content ?? "",
      query: defaultValues.query ?? "",
      limit: defaultValues.limit ?? 5,
      variableName: defaultValues.variableName ?? "memoryResult",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = (values: VectorStoreFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-[720px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <BrainCircuitIcon className="size-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle>Vector Store</DialogTitle>
              <DialogDescription>
                Store workflow knowledge as embeddings or search it by semantic
                similarity.
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
                    The Gemini credential is used to generate 768-dimensional
                    embeddings.
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

            <div className="rounded-lg bg-muted p-4 space-y-3">
              <div>
                <h4 className="text-sm font-medium">How memory works</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Store splits content into overlapping chunks and generates
                  embeddings. Search turns your query into an embedding and
                  returns the closest matching chunks.
                </p>
              </div>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Use the same namespace when storing and searching.</li>
                <li>Namespaces are isolated per user.</li>
                <li>Handlebars values can be used in namespace and content.</li>
                <li>Search returns up to 20 matches.</li>
              </ul>
            </div>

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
                      <SelectItem value="store">Store</SelectItem>
                      <SelectItem value="search">Search</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="namespace"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Namespace</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="knowledge-base" />
                  </FormControl>
                  <FormDescription>
                    A logical memory namespace. It supports Handlebars, for
                    example <code>{"{{workflowId}}"}</code>.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {operation === "store" ? (
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={8}
                        placeholder="Paste or resolve the text you want to remember..."
                      />
                    </FormControl>
                    <FormDescription>
                      Content is chunked into 500-character pieces with 100
                      characters of overlap before embedding.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Search Query</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={5}
                        placeholder="What information should be retrieved?"
                      />
                    </FormControl>
                    <FormDescription>
                      Search uses cosine similarity and returns matches above
                      the default 0.7 threshold.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {operation === "search" && (
              <FormField
                control={form.control}
                name="limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Result Limit</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        max={20}
                        onChange={(event) =>
                          field.onChange(Number(event.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum number of matching memory chunks to return.
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
                    <Input {...field} placeholder="memoryResult" />
                  </FormControl>
                  <FormDescription>
                    Store mode returns the number of chunks stored. Search mode
                    returns matching content, similarity, and metadata.
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
