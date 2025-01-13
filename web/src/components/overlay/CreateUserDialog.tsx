import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ActivityIndicator from "../indicators/activity-indicator";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type CreateUserOverlayProps = {
  show: boolean;
  onCreate: (user: string, password: string, role: string) => void;
  onCancel: () => void;
};
export default function CreateUserDialog({
  show,
  onCreate,
  onCancel,
}: CreateUserOverlayProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const formSchema = z.object({
    user: z
      .string()
      .min(1)
      .regex(/^[A-Za-z0-9._]+$/, {
        message: "Username may only include letters, numbers, . or _",
      }),
    password: z.string(),
    role: z.enum(["user", "admin"]),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      user: "",
      password: "",
      role: "user",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    console.log("Creating User: ", values)
    await onCreate(values.user, values.password, values.role);
    form.reset();
    setIsLoading(false);
  };

  return (
    <Dialog open={show} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="user"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <FormControl>
                    <Input
                      className="text-md w-full border border-input bg-background p-2 hover:bg-accent hover:text-accent-foreground dark:[color-scheme:dark]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="role"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Roles</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row gap-4">
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem value="user" />
                        </FormControl>
                        <FormLabel>User</FormLabel>
                      </FormItem>
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem value="admin" />
                        </FormControl>
                        <FormLabel>Admin</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      className="text-md w-full border border-input bg-background p-2 hover:bg-accent hover:text-accent-foreground dark:[color-scheme:dark]"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter className="mt-4">
              <Button
                variant="select"
                aria-label="Create user"
                disabled={isLoading}
              >
                {isLoading && <ActivityIndicator className="mr-2 h-4 w-4" />}
                Create User
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
