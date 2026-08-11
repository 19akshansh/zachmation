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
import { Textarea } from "@/components/ui/textarea";
import {
  BLACK_FOREST_MODELS,
  type BlackForestModelId,
} from "@/config/ai/blackforestModels";
import { useCredentialsByType } from "@/features/credentials/hooks/useCredentials";
import { NodeType } from "@/generated/prisma/enums";
import { getNodeCredentialTypes } from "@/config/nodeTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const MODEL_IDS = BLACK_FOREST_MODELS.map((m) => m.id) as [
  BlackForestModelId,
  ...BlackForestModelId[],
];

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Please add a Variable Name" })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter/underscore and contain only letters, numbers, and underscores",
    }),
  credentialId: z
    .string()
    .min(1, { message: "Hugging Face credential is required." }),
  imgbbCredentialId: z
    .string()
    .min(1, { message: "ImgBB credential is required." }),
  model: z.enum(MODEL_IDS),
  prompt: z.string().min(1, "Prompt required."),
});

export type BlackForestFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BlackForestFormValues) => void;
  defaultValues?: Partial<BlackForestFormValues>;
}

export const BlackForestDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: hfCredentials, isLoading: hfLoading } = useCredentialsByType(getNodeCredentialTypes(NodeType.BLACK_LABS)[0]);
  const { data: imgbbCredentials, isLoading: imgbbLoading } =
    useCredentialsByType(getNodeCredentialTypes(NodeType.BLACK_LABS)[1]);

  const form = useForm<BlackForestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credentialId: defaultValues.credentialId || "",
      imgbbCredentialId: defaultValues.imgbbCredentialId || "",
      variableName: defaultValues.variableName || "",
      model: defaultValues.model || BLACK_FOREST_MODELS[0].id,
      prompt: defaultValues.prompt || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        credentialId: defaultValues.credentialId || "",
        imgbbCredentialId: defaultValues.imgbbCredentialId || "",
        variableName: defaultValues.variableName || "",
        model: defaultValues.model || BLACK_FOREST_MODELS[0].id,
        prompt: defaultValues.prompt || "",
      });
    }
  }, [open, form, defaultValues]);

  const demoVarName = "generatedImage";
  const watchVariableName = form.watch("variableName") || demoVarName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Black Forest Labs (FLUX) Config</DialogTitle>
          <DialogDescription>
            Configure settings for FLUX generation and ImgBB hosting.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => {
              onSubmit(v);
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
                    <Input
                      {...field}
                      className="w-full"
                      placeholder={demoVarName}
                    />
                  </FormControl>
                  <FormDescription>
                    Use this name to reference the result in other nodes:{" "}
                    {`{{${watchVariableName}.[0]}}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BLACK_FOREST_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the Image model used for AI generation
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
                  <FormLabel>Hugging Face API KEY</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={hfLoading || !hfCredentials?.length}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select HF Credential" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {hfCredentials?.map((credential) => (
                        <SelectItem key={credential.id} value={credential.id}>
                          <div className="flex items-center gap-2">
                            <Image
                              src="/huggingface.svg"
                              alt="HF"
                              width={18}
                              height={18}
                            />
                            {credential.name}
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
              name="imgbbCredentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ImgBB API KEY</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={imgbbLoading || !imgbbCredentials?.length}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select ImgBB Credential" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {imgbbCredentials?.map((credential) => (
                        <SelectItem key={credential.id} value={credential.id}>
                          <div className="flex items-center gap-2">
                            <Image
                              src="/imgbb.png"
                              alt="ImgBB"
                              width={18}
                              height={18}
                            />
                            {credential.name}
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
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="A cinematic shot..."
                      className="min-h-[100px] w-full font-mono text-sm"
                    />
                  </FormControl>
                  <FormDescription>
                    This prompt is sent to the AI.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" className="w-full">
                Save Configuration
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
