"use client";

import { Loader2Icon } from "lucide-react";
import { CredentialType } from "@/generated/prisma/enums";
import { useRouter } from "next/navigation";
import {
  useCreateCredential,
  useUpdateCredential,
} from "../hooks/useCredentials";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import Link from "next/link";

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(25, { message: "Name must be less than 25 characters" }),
  type: z.enum(CredentialType),
  value: z.string(),
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
];

export const CredentialForm = ({ initialData }: CredentialFormProps) => {
  const router = useRouter();
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
        }
      : {
          name: "",
          type: CredentialType.OPENAI,
          value: "",
        },
  });

  const onSubmit = async (values: FormValues) => {
    if (!isEdit && !values.value.trim()) {
      form.setError("value", {
        type: "manual",
        message: "API Key is required",
      });
      return;
    }

    if (isEdit && initialData?.id) {
      await updateCredential.mutateAsync({
        id: initialData.id,
        ...values,
      });
    } else {
      await createCredential.mutateAsync(values, {
        onSuccess: (data) => {
          router.push(`/credentials/${data.id}`);
        },
        onError: (error) => {
          handleError(error);
        },
      });
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
                              <Image
                                src={option.logo}
                                alt={option.label}
                                width={24}
                                height={24}
                              />
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
                        The saved secret is never sent back to this page. Enter
                        a new value only when you want to replace it.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
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
