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
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const fieldSchema = z.object({
  key: z.string().trim().min(1, "Please add a field name"),
  valueTemplate: z.string(),
});

const formSchema = z.object({
  fields: z.array(fieldSchema).min(1, "Add at least one field"),
});

export type SetFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SetFormValues) => void;
  defaultValues?: Partial<SetFormValues>;
}

const emptyField = { key: "", valueTemplate: "" };

export const SetDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<SetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fields: defaultValues.fields?.length ? defaultValues.fields : [emptyField],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fields",
  });

  useEffect(() => {
    if (open) {
      form.reset({
        fields: defaultValues.fields?.length
          ? defaultValues.fields
          : [emptyField],
      });
    }
  }, [open, defaultValues, form]);

  const handleSubmit = (values: SetFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Fields</DialogTitle>
          <DialogDescription>
            Add or overwrite workflow context fields using Handlebars templates.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="mt-4 space-y-6"
          >
            <div className="space-y-3">
              <FormLabel>Fields</FormLabel>
              <FormDescription>
                Values can reference existing context, for example{" "}
                {"{{webhook.[0].name}}"}.
              </FormDescription>

              {fields.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_1.5fr_auto] items-start gap-2"
                >
                  <FormField
                    control={form.control}
                    name={`fields.${index}.key`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`fields.${index}.valueTemplate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="{{webhook.[0].name}}" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove field"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ ...emptyField })}
              >
                <PlusIcon className="mr-2 size-4" />
                Add field
              </Button>
            </div>

            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
