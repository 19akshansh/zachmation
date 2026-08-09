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
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const valueTypeSchema = z.enum(["string", "number", "boolean", "array"]);

const fieldSchema = z.object({
  key: z.string().trim().min(1, "Please add a field name"),
  valueTemplate: z.string(),
  type: valueTypeSchema.default("string"),
});

const formSchema = z.object({
  fields: z.array(fieldSchema).min(1, "Add at least one field"),
});

export type SetFormValues = z.output<typeof formSchema>;
type SetFormInput = z.input<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SetFormValues) => void;
  defaultValues?: Partial<SetFormValues>;
}

const emptyField: SetFormInput["fields"][number] = {
  key: "",
  valueTemplate: "",
  type: "string",
};

export const SetDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<SetFormInput, unknown, SetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fields: defaultValues.fields?.length
        ? defaultValues.fields.map((field) => ({
            ...field,
            type: field.type ?? "string",
          }))
        : [emptyField],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fields",
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      fields: defaultValues.fields?.length
        ? defaultValues.fields.map((field) => ({
            ...field,
            type: field.type ?? "string",
          }))
        : [emptyField],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = (values: SetFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>Edit Fields</DialogTitle>
          <DialogDescription>
            Create or overwrite workflow context fields. Use Array for lists
            that downstream nodes, such as Loop, should consume.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="mt-4 space-y-6"
          >
            <div className="space-y-3">
              <div>
                <FormLabel>Fields</FormLabel>
                <FormDescription className="mt-1">
                  Templates can reference existing context, for example{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                    {`{{webhook.[0].name}}`}
                  </code>
                  .
                </FormDescription>
              </div>

              <div className="space-y-3">
                {fields.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-xl border bg-muted/15 p-3"
                  >
                    <div className="grid gap-3 md:grid-cols-[1fr_1.4fr_150px_auto] md:items-start">
                      <FormField
                        control={form.control}
                        name={`fields.${index}.key`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Key</FormLabel>
                            <FormControl>
                              <Input placeholder="urls" {...field} />
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
                            <FormLabel className="text-xs">Value</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='["https://one.com", "https://two.com"]'
                                className="font-mono text-xs"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`fields.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Type</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="string">Text</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="boolean">Boolean</SelectItem>
                                <SelectItem value="json">
                                  Array (JSON)
                                </SelectItem>
                              </SelectContent>
                            </Select>
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
                        className="mt-6 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(index)}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ ...emptyField })}
              >
                <PlusIcon className="mr-2 size-4" />
                Add field
              </Button>
            </div>

            <div className="rounded-xl border bg-muted/20 p-4 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Loop example</p>
              <p className="mt-1 leading-5">
                Set <code>urls</code> to Array (JSON) with multiple values, then
                configure Loop with <code>Source Array = urls</code>.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
