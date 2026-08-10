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
import { DatabaseIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CredentialType } from "@/generated/prisma/enums";
import { useCredentialsByType } from "@/features/credentials/hooks/useCredentials";

const formSchema = z.object({
  credentialId: z.string().min(1, "Postgres credential is required."),
  query: z
    .string()
    .trim()
    .min(1, "SQL query is required.")
    .refine(
      (value) => /^(select|insert)\b/i.test(value),
      "Only SELECT and INSERT queries are supported.",
    ),
  parameters: z.string().optional(),
  variableName: z.string().trim().min(1, "Result variable is required."),
});

export type PostgresQueryFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PostgresQueryFormValues) => void;
  defaultValues?: Partial<PostgresQueryFormValues>;
}

export const PostgresQueryDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: credentials = [], isLoading } = useCredentialsByType(
    CredentialType.POSTGRES,
  );

  const form = useForm<PostgresQueryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credentialId: defaultValues.credentialId ?? "",
      query: defaultValues.query ?? "SELECT * FROM users WHERE email = $1",
      parameters: defaultValues.parameters ?? "",
      variableName: defaultValues.variableName ?? "queryResult",
    },
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      credentialId: defaultValues.credentialId ?? "",
      query: defaultValues.query ?? "SELECT * FROM users WHERE email = $1",
      parameters: defaultValues.parameters ?? "",
      variableName: defaultValues.variableName ?? "queryResult",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = (values: PostgresQueryFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-[760px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <DatabaseIcon className="size-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle>Postgres Query</DialogTitle>
              <DialogDescription>
                Run a parameterized SELECT or INSERT query against a saved
                Postgres connection.
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
                  <FormLabel>Postgres Credential</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Postgres credential" />
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
                    Create a Postgres credential from the Credentials page.
                    {isLoading ? " Loading..." : ""}
                  </FormDescription>
                  <FormMessage />
                  {!isLoading && credentials.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No Postgres credentials found. Create one first.
                    </p>
                  )}
                </FormItem>
              )}
            />

            <div className="rounded-lg bg-muted p-4 space-y-3">
              <div>
                <h4 className="text-sm font-medium">Safe parameterization</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Never interpolate a Handlebars value directly into SQL. Use
                  PostgreSQL placeholders such as <code>$1</code>,{" "}
                  <code>$2</code>, etc., and put the resolved values in the
                  separate Parameters field.
                </p>
              </div>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>
                  SQL: <code>SELECT * FROM users WHERE email = $1</code>
                </li>
                <li>
                  Parameters: <code>{"{{$item.email}}"}</code>
                </li>
                <li>
                  Multiple parameters are comma-separated and match $1, $2, $3
                  in order.
                </li>
              </ul>
            </div>

            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SQL Query</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={7}
                      className="font-mono text-sm"
                      placeholder={"SELECT * FROM users WHERE email = $1"}
                    />
                  </FormControl>
                  <FormDescription>
                    Only parameterized SELECT and INSERT statements are
                    supported. Do not put Handlebars expressions directly inside
                    the SQL string.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parameters"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parameters</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      className="font-mono text-sm"
                      placeholder="{{$item.email}}, {{$item.status}}"
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated Handlebars templates. Their resolved values
                    are passed to <code>pg</code> separately from the SQL text,
                    preserving parameterization.
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
                      placeholder="queryResult"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    Query rows are stored in this context key as an array.
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
