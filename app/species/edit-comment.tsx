"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { Database } from "@/lib/schema";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
type Comment = Database["public"]["Tables"]["comments"]["Row"];

const commentSchema = z.object({
    created_at: z
    .date(),
  comment: z
    .string()
    .nullable()
    // Transform empty string or only whitespace input to null before form submission, and trim whitespace otherwise
    .transform((val) => (!val || val.trim() === "" ? null : val.trim())),
  
    
})

type FormData = z.infer<typeof commentSchema>;

interface commentProps {
    comment: Comment;
  }


export default function EditCommentDialog(props:commentProps) {
    const router = useRouter();
    const {comment} = props;
    // Control open/closed state of the dialog
    const [open, setOpen] = useState<boolean>(false);

    // pass default values of existing fields
    const defaultValues: Partial<FormData> = {
    created_at: comment.created_at,
    comment: comment.comment,
    };

    const form = useForm<FormData>({
    resolver: zodResolver(commentSchema),
    defaultValues,
    mode: "onChange",
    });

    const onSubmit = async (input: FormData) => {

    console.log(input);
    const supabase = createBrowserSupabaseClient();
    //update info on submit
    const currentTimestamp = new Date();

    const { error } = await supabase.from("comments").update(
        {
        comment: input.comment,
        created_at: currentTimestamp,
        },
    ).eq("id", comment.id);

    // Catch and report errors from Supabase and exit the onSubmit function with an early 'return' if an error occurred.
    if (error) {
        return toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
        });
    }

    form.reset(defaultValues);
    setOpen(false);
    router.refresh();
    
    return toast({
        title: "Updated!",
        description: "Successfully edited comment.",
    });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="ml-1 mr-1 flex-auto" variant="secondary" >
          Edit Comment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Comment</DialogTitle>
          <DialogDescription>
            Edit your comment here. Click &quot;Confirm Changes&quot; below when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={(e: BaseSyntheticEvent) => void form.handleSubmit(onSubmit)(e)}>
            <div className="grid w-full items-center gap-4">
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => {
                  // We must extract value from field and convert a potential defaultValue of `null` to "" because textareas can't handle null values: https://github.com/orgs/react-hook-form/discussions/4091
                  const { value, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Comment</FormLabel>
                      <FormControl>
                        <Textarea
                          value={value ?? ""}
                          
                          {...rest}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <div className="flex">
                <Button type="submit" className="ml-1 mr-1 flex-auto">
                  Confirm Changes
                </Button>
                <DialogClose asChild>
                  <Button type="button" className="ml-1 mr-1 flex-auto" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>


    )}