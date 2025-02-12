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
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
    userId: string;
    speciesId: number;
  }

export default function AddCommentDialog(props: commentProps) {
    const router = useRouter();
    const {userId, speciesId} = props;
    // Control open/closed state of the dialog
    const [open, setOpen] = useState<boolean>(false);

    // pass default values of existing fields
    const currentTimestamp = new Date();

    const defaultValues: Partial<FormData> = {
    created_at: currentTimestamp,
    comment: ""
    };

    const form = useForm<FormData>({
    resolver: zodResolver(commentSchema),
    defaultValues,
    mode: "onChange",
    });

    const onSubmit = async (input: FormData) => {
    console.log(input);
    const supabase = createBrowserSupabaseClient();
    //add comment on submit
 
    const { error } = await supabase.from("comments").insert([
        {
            comment: input.comment,
            created_at: currentTimestamp,
            species_id: speciesId,
            user_id: userId,
            },
        ])

    // Catch and report errors from Supabase and exit the onSubmit function with an early 'return' if an error occurred.
    if (error) {
        return toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
        });
    }
//clean up and reload
    form.reset(defaultValues);
    setOpen(false);
    router.refresh();

    return toast({
        title: "Posted!",
        description: "Successfully added comment.",
    });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="ml-1 mr-1 flex-auto" >
          Add Comment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Comment</DialogTitle>
          <DialogDescription>
            Add your comment here. Click &quot;Post Comment&quot; below when you&apos;re done.
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
                  Post Comment
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