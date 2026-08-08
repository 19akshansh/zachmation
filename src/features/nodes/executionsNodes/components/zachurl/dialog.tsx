"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCredentialsByType } from "@/features/credentials/hooks/useCredentials";
import { CredentialType } from "@/generated/prisma/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  variableName: z.string().min(1).regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, "Invalid variable name"),
  credentialId: z.string().min(1, "Select a Zachurl credential"),
  baseUrl: z.url("Enter a valid Zachurl base URL"),
  originalUrl: z.string().min(1, "Enter a URL or template"),
  customSlug: z.string(),
});
export type ZachurlFormValues = z.infer<typeof schema>;

export const ZachurlDialog = ({
  open, onOpenChange, onSubmit, defaultValues = {},
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ZachurlFormValues) => void;
  defaultValues?: Partial<ZachurlFormValues>;
}) => {
  const { data: credentials = [], isLoading } =
    useCredentialsByType(CredentialType.ZACHURL);
  const form = useForm<ZachurlFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      variableName: defaultValues.variableName || "zachurl",
      credentialId: defaultValues.credentialId || "",
      baseUrl: defaultValues.baseUrl || "",
      originalUrl: defaultValues.originalUrl || "",
      customSlug: defaultValues.customSlug || "",
    },
  });

  useEffect(() => {
    if (open) form.reset({
      variableName: defaultValues.variableName || "zachurl",
      credentialId: defaultValues.credentialId || "",
      baseUrl: defaultValues.baseUrl || "",
      originalUrl: defaultValues.originalUrl || "",
      customSlug: defaultValues.customSlug || "",
    });
  }, [open, defaultValues, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Zachurl</DialogTitle>
          <DialogDescription>Create a short URL using your Zachurl API key.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => { onSubmit(v); onOpenChange(false); })} className="space-y-5">
            <FormField control={form.control} name="variableName" render={({ field }) => (
              <FormItem><FormLabel>Variable Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="credentialId" render={({ field }) => (
              <FormItem><FormLabel>Zachurl Credential</FormLabel>
                <Select value={field.value} onValueChange={field.onChange} disabled={isLoading || !credentials.length}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select credential" /></SelectTrigger></FormControl>
                  <SelectContent>{credentials.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="baseUrl" render={({ field }) => (
              <FormItem><FormLabel>Zachurl Base URL</FormLabel><FormControl><Input {...field} placeholder="https://your-zachurl.app" /></FormControl>
                <FormDescription>The deployed Zachurl app URL.</FormDescription><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="originalUrl" render={({ field }) => (
              <FormItem><FormLabel>Original URL</FormLabel><FormControl><Input {...field} className="font-mono" placeholder="{{webhook.url}}" /></FormControl>
                <FormDescription>Handlebars templates are supported.</FormDescription><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="customSlug" render={({ field }) => (
              <FormItem><FormLabel>Custom Slug</FormLabel><FormControl><Input {...field} className="font-mono" placeholder="{{webhook.slug}}" /></FormControl>
                <FormDescription>Optional. Handlebars templates are supported.</FormDescription><FormMessage /></FormItem>
            )} />
            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
