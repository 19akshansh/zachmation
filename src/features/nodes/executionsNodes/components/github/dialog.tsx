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
import { CredentialType } from "@/generated/prisma/enums";
import { useCredentialsByType } from "@/features/credentials/hooks/useCredentials";

const formSchema = z.object({
  credentialId: z.string().min(1, "GitHub credential is required."),
  operation: z.enum([
    "createIssue",
    "listIssues",
    "createComment",
    "closeIssue",
  ]),
  owner: z.string().trim().min(1, "Owner is required."),
  repo: z.string().trim().min(1, "Repository is required."),
  issueNumber: z.string().optional(),
  title: z.string().optional(),
  body: z.string().optional(),
  state: z.enum(["open", "closed", "all"]),
  variableName: z.string().trim().min(1, "Result variable is required."),
});

export type GitHubFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: GitHubFormValues) => void;
  defaultValues?: Partial<GitHubFormValues>;
}

export const GitHubDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: credentials = [], isLoading } = useCredentialsByType(
    CredentialType.GITHUB,
  );

  const form = useForm<GitHubFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credentialId: defaultValues.credentialId ?? "",
      operation: defaultValues.operation ?? "createIssue",
      owner: defaultValues.owner ?? "",
      repo: defaultValues.repo ?? "",
      issueNumber: defaultValues.issueNumber ?? "",
      title: defaultValues.title ?? "",
      body: defaultValues.body ?? "",
      state: defaultValues.state ?? "open",
      variableName: defaultValues.variableName ?? "githubResult",
    },
  });

  const operation = form.watch("operation");

  useEffect(() => {
    if (!open) return;
    form.reset({
      credentialId: defaultValues.credentialId ?? "",
      operation: defaultValues.operation ?? "createIssue",
      owner: defaultValues.owner ?? "",
      repo: defaultValues.repo ?? "",
      issueNumber: defaultValues.issueNumber ?? "",
      title: defaultValues.title ?? "",
      body: defaultValues.body ?? "",
      state: defaultValues.state ?? "open",
      variableName: defaultValues.variableName ?? "githubResult",
    });
  }, [open]);

  const handleSubmit = (values: GitHubFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>GitHub</DialogTitle>
          <DialogDescription>
            Create and manage issues in a repository using a fine-grained
            Personal Access Token.
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
                  <FormLabel>GitHub Credential</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a GitHub credential" />
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
                        ? "Use a fine-grained token with access to this repository."
                        : "No GitHub credentials found. Create one first."}
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
                      <SelectItem value="createIssue">Create issue</SelectItem>
                      <SelectItem value="listIssues">List issues</SelectItem>
                      <SelectItem value="createComment">
                        Create comment
                      </SelectItem>
                      <SelectItem value="closeIssue">Close issue</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="octocat" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="repo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repository</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="hello-world" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {(operation === "createComment" || operation === "closeIssue") && (
              <FormField
                control={form.control}
                name="issueNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="42" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}{" "}
            {operation === "createIssue" && (
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="New issue" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}{" "}
            {(operation === "createIssue" || operation === "createComment") && (
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={6}
                        placeholder="Describe the issue..."
                      />
                    </FormControl>
                    <FormDescription>
                      Handlebars expressions are supported.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}{" "}
            {operation === "listIssues" && (
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="all">All</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Input {...field} placeholder="githubResult" />
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
