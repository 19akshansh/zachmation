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
import { FileSpreadsheetIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { NodeType } from "@/generated/prisma/enums";
import { useCredentialsByNodeType } from "@/features/credentials/hooks/useCredentials";

const formSchema = z
  .object({
    credentialId: z.string().min(1, "Google Sheets credential is required."),
    operation: z.enum(["read", "append"]),
    spreadsheetId: z.string().trim().min(1, "Spreadsheet ID is required."),
    range: z.string().trim().min(1, "Range is required."),
    rowValues: z.string().optional(),
    variableName: z.string().trim().min(1, "Result variable is required."),
  })
  .superRefine((values, ctx) => {
    if (values.operation === "append" && !values.rowValues?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["rowValues"],
        message: "Row values are required for append.",
      });
    }
  });

export type GoogleSheetsFormValues = z.output<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: GoogleSheetsFormValues) => void;
  defaultValues?: Partial<GoogleSheetsFormValues>;
}

export const GoogleSheetsDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: credentials = [], isLoading } = useCredentialsByNodeType(NodeType.GOOGLE_SHEETS);

  const form = useForm<GoogleSheetsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credentialId: defaultValues.credentialId ?? "",
      operation: defaultValues.operation ?? "read",
      spreadsheetId: defaultValues.spreadsheetId ?? "",
      range: defaultValues.range ?? "Sheet1!A2:D",
      rowValues: defaultValues.rowValues ?? "",
      variableName: defaultValues.variableName ?? "sheetRows",
    },
  });

  const operation = form.watch("operation");

  useEffect(() => {
    if (!open) return;

    form.reset({
      credentialId: defaultValues.credentialId ?? "",
      operation: defaultValues.operation ?? "read",
      spreadsheetId: defaultValues.spreadsheetId ?? "",
      range: defaultValues.range ?? "Sheet1!A2:D",
      rowValues: defaultValues.rowValues ?? "",
      variableName: defaultValues.variableName ?? "sheetRows",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = (values: GoogleSheetsFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <FileSpreadsheetIcon className="size-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle>Google Sheets</DialogTitle>
              <DialogDescription>
                Read rows from a sheet or append a new row using your connected
                Google account.
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
                  <FormLabel>Google Sheets Credential</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select credential" />
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
                    Select a Google OAuth credential connected to the Google
                    account that can access the sheet.
                    {isLoading ? " Loading..." : ""}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg bg-muted p-4 space-y-3">
              <div>
                <h4 className="font-medium text-sm">Google Sheets Setup</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Google Sheets uses OAuth, so the spreadsheet stays in your
                  Google Drive.
                </p>
              </div>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>
                  Create a Google Sheets credential from the Credentials page.
                </li>
                <li>
                  Click{" "}
                  <span className="font-medium text-foreground">
                    Connect Google Account
                  </span>{" "}
                  and approve the Sheets permission.
                </li>
                <li>
                  Make sure the connected Google account can access the target
                  spreadsheet.
                </li>
                <li>Paste the spreadsheet ID and A1 range below.</li>
              </ol>
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
                      <SelectItem value="read">Read Rows</SelectItem>
                      <SelectItem value="append">Append Row</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="spreadsheetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spreadsheet ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="1AbCdEf..."
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    The long ID between <code>/d/</code> and <code>/edit</code>{" "}
                    in the sheet URL.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="range"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Range</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Sheet1!A2:D"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    Use standard Google Sheets A1 notation.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {operation === "append" && (
              <FormField
                control={form.control}
                name="rowValues"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Row Values</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="{{$item.name}}, {{$item.email}}, active"
                        className="font-mono"
                      />
                    </FormControl>
                    <FormDescription>
                      Comma-separated values, resolved with Handlebars before
                      the row is appended.
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
                    <Input
                      {...field}
                      placeholder="sheetRows"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    Read mode stores rows here. Append mode stores the appended
                    values here.
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
