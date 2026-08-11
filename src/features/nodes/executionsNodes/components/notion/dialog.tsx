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
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { NodeType } from "@/generated/prisma/enums";
import { useCredentialsByNodeType } from "@/features/credentials/hooks/useCredentials";

const formSchema = z.object({
  credentialId: z.string().min(1, "Notion credential is required."),
  operation: z.enum(["queryDatabase", "createPage", "updatePage"]),
  databaseId: z.string().optional(),
  pageId: z.string().optional(),
  properties: z.string().optional(),
  variableName: z.string().trim().min(1, "Result variable is required."),
});
export type NotionFormValues = z.infer<typeof formSchema>;
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: NotionFormValues) => void;
  defaultValues?: Partial<NotionFormValues>;
}
export const NotionDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: credentials = [], isLoading } = useCredentialsByNodeType(NodeType.NOTION);
  const form = useForm<NotionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credentialId: defaultValues.credentialId ?? "",
      operation: defaultValues.operation ?? "queryDatabase",
      databaseId: defaultValues.databaseId ?? "",
      pageId: defaultValues.pageId ?? "",
      properties:
        defaultValues.properties ??
        '{"Name":{"title":[{"text":{"content":"{{$item.name}}"}}]}}',
      variableName: defaultValues.variableName ?? "notionResult",
    },
  });
  const operation = form.watch("operation");
  useEffect(() => {
    if (!open) return;
    form.reset({
      credentialId: defaultValues.credentialId ?? "",
      operation: defaultValues.operation ?? "queryDatabase",
      databaseId: defaultValues.databaseId ?? "",
      pageId: defaultValues.pageId ?? "",
      properties:
        defaultValues.properties ??
        '{"Name":{"title":[{"text":{"content":"{{$item.name}}"}}]}}',
      variableName: defaultValues.variableName ?? "notionResult",
    });
  }, [open]);
  const handleSubmit = (values: NotionFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>Notion</DialogTitle>
          <DialogDescription>
            Query a database or create and update Notion pages using an internal
            integration.
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
                  <FormLabel>Notion Credential</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Notion credential" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {credentials.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {isLoading
                      ? "Loading..."
                      : credentials.length
                        ? "The integration must be shared with the target database/page."
                        : "No Notion credentials found. Create one first."}
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
                      <SelectItem value="queryDatabase">
                        Query database
                      </SelectItem>
                      <SelectItem value="createPage">Create page</SelectItem>
                      <SelectItem value="updatePage">Update page</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {operation !== "updatePage" && (
              <FormField
                control={form.control}
                name="databaseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Database ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Notion database ID" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}{" "}
            {operation === "updatePage" && (
              <FormField
                control={form.control}
                name="pageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Notion page ID" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}{" "}
            {(operation === "createPage" || operation === "updatePage") && (
              <FormField
                control={form.control}
                name="properties"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Properties JSON</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </FormControl>
                    <FormDescription>
                      Notion property-value JSON is resolved with Handlebars
                      before being sent. Title properties use the nested Notion
                      shape shown in the example.
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
                    <Input {...field} placeholder="notionResult" />
                  </FormControl>
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
