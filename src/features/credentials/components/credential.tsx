"use client";

import { Loader2Icon, ExternalLinkIcon } from "lucide-react";
import { CredentialType } from "@/generated/prisma/enums";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCreateCredential,
  useUpdateCredential,
} from "../hooks/useCredentials";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { toast } from "sonner";

const formSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: "Name is required" })
      .max(25, { message: "Name must be less than 25 characters" }),
    type: z.enum(CredentialType),
    value: z.string(),
    smtpHost: z.string().optional(),
    smtpPort: z.string().optional(),
    smtpUsername: z.string().optional(),
    smtpPassword: z.string().optional(),
    smtpSecure: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.type !== CredentialType.SMTP) return;

    if (!values.smtpHost?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["smtpHost"],
        message: "SMTP host is required",
      });
    }
    if (!values.smtpPort?.trim() || Number.isNaN(Number(values.smtpPort))) {
      ctx.addIssue({
        code: "custom",
        path: ["smtpPort"],
        message: "Valid SMTP port is required",
      });
    }
    if (!values.smtpUsername?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["smtpUsername"],
        message: "SMTP username is required",
      });
    }
    if (!values.smtpPassword?.trim() && !values.value.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["smtpPassword"],
        message: "SMTP password is required",
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

interface CredentialFormProps {
  initialData?: {
    id?: string;
    name: string;
    type: CredentialType;
    value?: string;
  };
}

const credentialTypeOptions = [
  {
    value: CredentialType.OPENAI,
    label: "OpenAI",
    logo: "/openai.svg",
  },
  {
    value: CredentialType.GEMINI,
    label: "GEMINI",
    logo: "/gemini.svg",
  },
  {
    value: CredentialType.ANTHROPIC,
    label: "Anthropic",
    logo: "/anthropic.svg",
  },
  {
    value: CredentialType.HUGGING_FACE,
    label: "Hugging Face",
    logo: "/huggingface.svg",
  },
  {
    value: CredentialType.IMG_BB,
    label: "Image BB",
    logo: "/imgbb.png",
  },
  {
    value: CredentialType.TELEGRAM_BOT,
    label: "Telegram Bot",
    logo: "/telegram.svg",
  },
  {
    value: CredentialType.ZACHURL,
    label: "Zachurl",
    logo: "/zachurl.svg",
  },
  {
    value: CredentialType.ZACHCOURSE,
    label: "Zachcourse",
    logo: "/zachcourse.svg",
  },
  {
    value: CredentialType.SMTP,
    label: "SMTP",
    logo: "/smtp.svg",
  },
  {
    value: CredentialType.GOOGLE_SHEETS,
    label: "Google Sheets",
    logo: "/googleSheets.svg",
  },
];

export const CredentialForm = ({ initialData }: CredentialFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createCredential = useCreateCredential();
  const updateCredential = useUpdateCredential();
  const { handleError, modal } = useUpgradeModal();

  const isEdit = !!initialData?.id;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          type: initialData.type,
          value: "",
          smtpHost: "",
          smtpPort: "587",
          smtpUsername: "",
          smtpPassword: "",
          smtpSecure: false,
        }
      : {
          name: "",
          type: CredentialType.OPENAI,
          value: "",
          smtpHost: "",
          smtpPort: "587",
          smtpUsername: "",
          smtpPassword: "",
          smtpSecure: false,
        },
  });

  const selectedType = form.watch("type");

  useEffect(() => {
    if (searchParams.get("type") === CredentialType.GOOGLE_SHEETS) {
      form.setValue("type", CredentialType.GOOGLE_SHEETS);
    }

    const error = searchParams.get("error");
    if (error) {
      toast.error(error.replaceAll("_", " "));
    }
  }, [form, searchParams]);

  const onSubmit = async (values: FormValues) => {
    const value =
      values.type === CredentialType.SMTP
        ? values.smtpPassword?.trim()
          ? JSON.stringify({
              host: values.smtpHost!.trim(),
              port: Number(values.smtpPort),
              username: values.smtpUsername!.trim(),
              password: values.smtpPassword,
              secure: values.smtpSecure,
            })
          : values.value
        : values.value;

    if (!isEdit && !value.trim()) {
      form.setError("value", {
        type: "manual",
        message: "API Key or credential is required",
      });
      return;
    }

    if (isEdit && initialData?.id) {
      await updateCredential.mutateAsync({
        id: initialData.id,
        name: values.name,
        type: values.type,
        value,
      });
    } else {
      await createCredential.mutateAsync(
        {
          name: values.name,
          type: values.type,
          value,
        },
        {
          onSuccess: (data) => {
            router.push(`/credentials/${data.id}`);
          },
          onError: (error) => {
            handleError(error);
          },
        },
      );
    }
  };

  return (
    <>
      {modal}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Credential" : "New Credential"}</CardTitle>
          <CardDescription>
            {isEdit
              ? "Update your API key or credential detials"
              : "Add a new API key or credential to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My API Key" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {credentialTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              {option.logo ? (
                                <Image
                                  src={option.logo}
                                  alt={option.label}
                                  width={24}
                                  height={24}
                                />
                              ) : (
                                <span className="flex size-6 items-center justify-center rounded bg-muted text-[10px] font-semibold">
                                  SMTP
                                </span>
                              )}
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {selectedType === CredentialType.GOOGLE_SHEETS ? (
                <div className="space-y-5 rounded-lg border p-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">
                      Connect Google Sheets
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Connect your Google account with OAuth. Zachmation stores
                      the encrypted OAuth tokens and uses them only when a
                      Google Sheets node runs. Your spreadsheets remain in your
                      Google Drive.
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted p-4 space-y-3">
                    <h4 className="text-sm font-medium">Setup Instructions</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      <li>
                        Enter a name for this Google Sheets connection above.
                      </li>
                      <li>
                        Click{" "}
                        <span className="font-medium text-foreground">
                          Connect Google Account
                        </span>
                        .
                      </li>
                      <li>
                        Sign in to Google and review the requested Sheets
                        permission.
                      </li>
                      <li>Allow access and return to Zachmation.</li>
                    </ol>
                  </div>

                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => {
                      const name = form.getValues("name").trim();
                      if (!name) {
                        form.setError("name", {
                          type: "manual",
                          message: "Name is required before connecting Google.",
                        });
                        return;
                      }

                      const params = new URLSearchParams({ name });
                      if (initialData?.id) {
                        params.set("credentialId", initialData.id);
                      }

                      window.location.href = `/api/googleSheets/oauth/start?${params.toString()}`;
                    }}
                  >
                    <ExternalLinkIcon className="mr-2 size-4" />
                    {isEdit
                      ? "Reconnect Google Account"
                      : "Connect Google Account"}
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    You can revoke Zachmation's access later from your Google
                    Account security settings.
                  </p>
                </div>
              ) : selectedType === CredentialType.SMTP ? (
                <div className="space-y-5 rounded-lg border p-4">
                  <div>
                    <h3 className="text-sm font-medium">SMTP Configuration</h3>
                    <p className="text-xs text-muted-foreground">
                      Store the complete SMTP configuration encrypted in the
                      credential vault.
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="smtpHost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Host</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="smtp.gmail.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="smtpPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Port</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              inputMode="numeric"
                              placeholder="587"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="smtpUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="you@example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="smtpPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password / App Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder={
                              isEdit
                                ? "Leave blank to keep the existing secret"
                                : "Enter SMTP password"
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          For Gmail, use an App Password rather than your normal
                          account password.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="smtpSecure"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center gap-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Use secure TLS connection</FormLabel>
                          <FormDescription>
                            Usually true for port 465 and false for port 587.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={
                            isEdit
                              ? "Leave blank to keep the existing secret"
                              : "Enter API key or credential value"
                          }
                          {...field}
                        />
                      </FormControl>
                      {isEdit && !field.value && (
                        <p className="text-xs text-muted-foreground">
                          The saved secret is never sent back to this page.
                          Enter a new value only when you want to replace it.
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex gap-3">
                {selectedType !== CredentialType.GOOGLE_SHEETS && (
                  <Button
                    type="submit"
                    disabled={
                      createCredential.isPending || updateCredential.isPending
                    }
                  >
                    {(createCredential.isPending ||
                      updateCredential.isPending) && (
                      <Loader2Icon className="size-4 animate-spin" />
                    )}
                    {createCredential.isPending
                      ? "Creating..."
                      : updateCredential.isPending
                        ? "Updating..."
                        : isEdit
                          ? "Update"
                          : "Create"}
                  </Button>
                )}
                <Button type="button" variant={"outline"} asChild>
                  <Link href="/credentials" prefetch>
                    Cancel
                  </Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};
