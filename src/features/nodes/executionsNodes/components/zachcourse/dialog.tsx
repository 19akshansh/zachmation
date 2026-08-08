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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCredentialsByType } from "@/features/credentials/hooks/useCredentials";
import { CredentialType } from "@/generated/prisma/enums";

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, "Variable name is required.")
    .regex(
      /^[A-Za-z_$][A-Za-z0-9_$]*$/,
      "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores.",
    ),
  credentialId: z.string().min(1, "Credential is required."),
  baseUrl: z.url("Enter a valid ZachCourse base URL."),
  topic: z.string().min(1, "Topic is required."),
  sourceUrl: z.string().optional(),
  textContent: z.string().optional(),
  documentContext: z.string().optional(),
  language: z.string().min(1).default("en"),
  experienceLevel: z.string().min(1).default("beginner"),
  backgroundContext: z.string().optional(),
  weeklyHours: z.number().int().min(1).max(168).default(5),
  tone: z.string().min(1).default("friendly"),
});

export type ZachCourseFormValues = z.output<typeof formSchema>;
type ZachCourseFormInput = z.input<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ZachCourseFormValues) => void;
  defaultValues?: Partial<ZachCourseFormValues>;
}

export const ZachCourseDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: credentials = [], isLoading: credentialsLoading } =
    useCredentialsByType(CredentialType.ZACHCOURSE);

  const form = useForm<ZachCourseFormInput, unknown, ZachCourseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "zachCourse",
      credentialId: defaultValues.credentialId || "",
      baseUrl: defaultValues.baseUrl || "",
      topic: defaultValues.topic || "",
      sourceUrl: defaultValues.sourceUrl || "",
      textContent: defaultValues.textContent || "",
      documentContext: defaultValues.documentContext || "",
      language: defaultValues.language || "en",
      experienceLevel: defaultValues.experienceLevel || "beginner",
      backgroundContext: defaultValues.backgroundContext || "",
      weeklyHours: defaultValues.weeklyHours ?? 5,
      tone: defaultValues.tone || "friendly",
    },
  });

  useEffect(() => {
    if (open)
      form.reset({
        variableName: defaultValues.variableName || "zachCourse",
        credentialId: defaultValues.credentialId || "",
        baseUrl: defaultValues.baseUrl || "",
        topic: defaultValues.topic || "",
        sourceUrl: defaultValues.sourceUrl || "",
        textContent: defaultValues.textContent || "",
        documentContext: defaultValues.documentContext || "",
        language: defaultValues.language || "en",
        experienceLevel: defaultValues.experienceLevel || "beginner",
        backgroundContext: defaultValues.backgroundContext || "",
        weeklyHours: defaultValues.weeklyHours ?? 5,
        tone: defaultValues.tone || "friendly",
      });
  }, [open, defaultValues, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>ZachCourse</DialogTitle>
          <DialogDescription>
            Generate a personalized course using your ZachCourse API key.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => {
              onSubmit(values);
              onOpenChange(false);
            })}
            className="mt-4 space-y-6"
          >
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="zachCourse" />
                  </FormControl>
                  <FormDescription>
                    The generated course is stored at this variable.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZachCourse API Key</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={credentialsLoading || !credentials.length}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a credential" />
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="baseUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZachCourse Base URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://your-zachcourse.app"
                    />
                  </FormControl>
                  <FormDescription>
                    The deployed ZachCourse application URL.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="{{set.topic}}"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    Handlebars templates are supported.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sourceUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="{{webhook.url}}"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="textContent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Text Content (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="{{set.content}}"
                      className="min-h-[100px] font-mono text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="en" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="experienceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="beginner" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weeklyHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weekly Hours</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        max={168}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="backgroundContext"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Background Context (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="What should ZachCourse know about the learner?"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="documentContext"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Context (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="{{set.documentContext}}"
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="friendly" />
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
