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
import { NodeType } from "@/generated/prisma/enums";
import { getNodeCredentialTypes } from "@/config/nodeTypes";

const ZACHCOURSE_BASE_URL = "https://zachcourse.ai.studio";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
] as const;

const EXPERIENCE_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

const TONE_OPTIONS = [
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
  { value: "encouraging", label: "Encouraging" },
  { value: "concise", label: "Concise" },
] as const;

const LANGUAGE_VALUES = ["en", "hi", "es", "fr", "de", "ja"] as const;
const EXPERIENCE_VALUES = ["beginner", "intermediate", "advanced"] as const;
const TONE_VALUES = [
  "friendly",
  "professional",
  "encouraging",
  "concise",
] as const;

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, "Variable name is required.")
    .regex(
      /^[A-Za-z_$][A-Za-z0-9_$]*$/,
      "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores.",
    ),
  credentialId: z.string().min(1, "ZachCourse credential is required."),
  geminiCredentialId: z.string().min(1, "Gemini API key is required."),
  topic: z.string().min(1, "Topic is required."),
  sourceUrl: z.string().optional(),
  textContent: z.string().optional(),
  documentContext: z.string().optional(),
  language: z.enum(LANGUAGE_VALUES).default("en"),
  experienceLevel: z.enum(EXPERIENCE_VALUES).default("beginner"),
  backgroundContext: z.string().optional(),
  weeklyHours: z.number().int().min(1).max(168).default(5),
  tone: z.enum(TONE_VALUES).default("friendly"),
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
    useCredentialsByType(getNodeCredentialTypes(NodeType.ZACHCOURSE)[0]);
  const { data: geminiCredentials = [], isLoading: geminiCredentialsLoading } =
    useCredentialsByType(getNodeCredentialTypes(NodeType.ZACHCOURSE)[1]);

  const form = useForm<ZachCourseFormInput, unknown, ZachCourseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "zachCourse",
      credentialId: defaultValues.credentialId || "",
      geminiCredentialId: defaultValues.geminiCredentialId || "",
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
        geminiCredentialId: defaultValues.geminiCredentialId || "",
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
            Generate a personalized course using ZachCourse and your Gemini API
            key.
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
              name="geminiCredentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gemini API Key</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={
                      geminiCredentialsLoading || !geminiCredentials.length
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a Gemini credential" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {geminiCredentials.map((credential) => (
                        <SelectItem key={credential.id} value={credential.id}>
                          {credential.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Used by ZachCourse to generate the course with Gemini.
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
                      placeholder="{{set.[0].topic}}"
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
                      placeholder="{{webhook.[0].url}}"
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
                      placeholder="{{set.[0].content}}"
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
                name="experienceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select experience" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EXPERIENCE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
                      placeholder="{{set.[0].documentContext}}"
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TONE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-xs text-muted-foreground">
              ZachCourse is deployed at{" "}
              <span className="font-mono">{ZACHCOURSE_BASE_URL}</span>.
            </p>
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
