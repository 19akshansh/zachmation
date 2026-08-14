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
import { useCredentialsByNodeType } from "@/features/credentials/hooks/useCredentials";
import { NodeType } from "@/generated/prisma/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, "Please add a Variable Name")
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, "Invalid variable name"),
  credentialId: z.string().min(1, "Please select a Telegram bot credential"),
  chatId: z.string().min(1, "Please add a Chat ID"),
  message: z
    .string()
    .min(1, "Please add a message")
    .max(4096, "Telegram messages must be at most 4096 characters"),
});
export type TelegramSendFormValues = z.infer<typeof formSchema>;
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TelegramSendFormValues) => void;
  defaultValues?: Partial<TelegramSendFormValues>;
}

export const TelegramSendDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: credentials = [], isLoading: credentialsLoading } =
    useCredentialsByNodeType(NodeType.TELEGRAM_SEND);

  const form = useForm<TelegramSendFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      credentialId: defaultValues.credentialId || "",
      chatId: defaultValues.chatId || "{{telegram.[0].message.chat.id}}",
      message: defaultValues.message || "Got it!",
    },
  });
  useEffect(() => {
    if (open)
      form.reset({
        variableName: defaultValues.variableName || "",
        credentialId: defaultValues.credentialId || "",
        chatId: defaultValues.chatId || "{{telegram.[0].message.chat.id}}",
        message: defaultValues.message || "Got it!",
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const variableName = form.watch("variableName") || "telegramSend";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Telegram Send Config</DialogTitle>
          <DialogDescription>
            Send a templated message through a stored Telegram bot.
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
                    <Input {...field} placeholder="telegramSend" />
                  </FormControl>
                  <FormDescription>{`Reference the sent text later with {{${variableName}.text}}`}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telegram Bot Credential</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={credentialsLoading || !credentials.length}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Telegram bot" />
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="chatId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chat ID</FormLabel>
                  <FormControl>
                    <Input {...field} className="font-mono" />
                  </FormControl>
                  <FormDescription>
                    Handlebars supported, e.g.{" "}
                    {"{{telegram.[0].message.chat.id}}"}.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="min-h-[120px] font-mono text-sm"
                    />
                  </FormControl>
                  <FormDescription>
                    Handlebars supported. Telegram limits text messages to 4096
                    characters.
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
