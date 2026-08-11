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
  credentialId: z.string().min(1, "Airtable credential is required."),
  operation: z.enum([
    "listRecords",
    "createRecord",
    "updateRecord",
    "deleteRecord",
  ]),
  baseId: z.string().trim().min(1, "Base ID is required."),
  tableName: z.string().trim().min(1, "Table name is required."),
  recordId: z.string().optional(),
  fields: z.string().optional(),
  variableName: z.string().trim().min(1, "Result variable is required."),
});

export type AirtableFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AirtableFormValues) => void;
  defaultValues?: Partial<AirtableFormValues>;
}

export const AirtableDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: credentials = [], isLoading } = useCredentialsByNodeType(NodeType.AIRTABLE);

  const form = useForm<AirtableFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credentialId: defaultValues.credentialId ?? "",
      operation: defaultValues.operation ?? "listRecords",
      baseId: defaultValues.baseId ?? "",
      tableName: defaultValues.tableName ?? "",
      recordId: defaultValues.recordId ?? "",
      fields: defaultValues.fields ?? '{"Name":"{{$item.name}}"}',
      variableName: defaultValues.variableName ?? "airtableResult",
    },
  });

  const operation = form.watch("operation");

  useEffect(() => {
    if (!open) return;

    form.reset({
      credentialId: defaultValues.credentialId ?? "",
      operation: defaultValues.operation ?? "listRecords",
      baseId: defaultValues.baseId ?? "",
      tableName: defaultValues.tableName ?? "",
      recordId: defaultValues.recordId ?? "",
      fields: defaultValues.fields ?? '{"Name":"{{$item.name}}"}',
      variableName: defaultValues.variableName ?? "airtableResult",
    });
  }, [open]);

  const handleSubmit = (values: AirtableFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>Airtable</DialogTitle>
          <DialogDescription>
            Read and modify records in an Airtable base using a Personal Access
            Token.
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
                  <FormLabel>Airtable Credential</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an Airtable credential" />
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
                        ? "Use a credential created from the Credentials page."
                        : "No Airtable credentials found. Create one first."}
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
                      <SelectItem value="listRecords">List records</SelectItem>
                      <SelectItem value="createRecord">
                        Create record
                      </SelectItem>
                      <SelectItem value="updateRecord">
                        Update record
                      </SelectItem>
                      <SelectItem value="deleteRecord">
                        Delete record
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="baseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base ID</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="appXXXXXXXXXXXXXX" />
                  </FormControl>
                  <FormDescription>
                    Handlebars expressions are supported.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Table</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Users" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {(operation === "updateRecord" || operation === "deleteRecord") && (
              <FormField
                control={form.control}
                name="recordId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Record ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="recXXXXXXXXXXXXXX" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {(operation === "createRecord" || operation === "updateRecord") && (
              <FormField
                control={form.control}
                name="fields"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fields JSON</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={6}
                        className="font-mono text-sm"
                      />
                    </FormControl>
                    <FormDescription>
                      JSON is resolved with Handlebars first, then parsed.
                      Example: {`{"Name":"{{$item.name}}"}`}
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
                    <Input {...field} placeholder="airtableResult" />
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
