"use client";

import { Button } from "@/components/ui/button";
import type { Database } from "@/lib/schema";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Icons } from "@/components/icons";

type Comment = Database["public"]["Tables"]["comments"]["Row"];
interface commentProps {
    comment: Comment;
    userId: string;
    speciesId: number;
  }

export default function Comment(props: commentProps) {
    const {comment,userId, speciesId} = props;
    const router = useRouter();
  const supabase = createBrowserSupabaseClient();

    //date to strings
    const dateString = comment.created_at.toLocaleString().split('T')
    const timeString = dateString[1]?.split(':')

    //open state of delete prompt
  const [deleteOpen, setDeleteOpen ] = useState<boolean>(false);
  const handleDeleteOpen = () => setDeleteOpen(!deleteOpen)

  //delete function
  const deleteSpecies = async (comment : Comment) => {
    const { error } = await supabase.from("comments").delete().eq('id',comment.id);

    //catch error messages
    if (error) {
      return toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
    }
    //confirm delete
    router.refresh()

    return toast({
      title: "Deleted!",
      description: "Permanently deleted comment.",
    });
  };

  
  return (
    <div className="m-4 flex-auto w-full rounded border-2 p-3 ">
      
    
              <p className="mt-3 text-md">{comment.comment}</p>
              {dateString[0] && timeString && (
              <p className="mt-3 text-sm">On {dateString[0]} at {timeString[0]}:{timeString[1]}</p>
            )}


      {comment.user_id == userId && comment.species_id == speciesId && (
          <div className="flex mt-5" >
            <Button className="ml-1 mr-1 flex-auto" variant="secondary" type="button" onClick={handleDeleteOpen}>
          Delete Comment
          </Button>
          </div>
        )} 

        {/* prompt delete dialog */}
    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]  ">
        <DialogHeader>
          <DialogTitle>Delete this comment?</DialogTitle>
          <DialogDescription className="mt-10 mb-10">
          This action cannot be undone. Click &quot;Delete&quot; to permanently delete this species or click &quot;Cancel&quot; to return to the home screen.
          </DialogDescription>
        </DialogHeader>
         
          <div className="flex">
          <Button className="ml-1 mr-1 flex-auto" type="button" onClick={()=>{ deleteSpecies(comment)}} variant="destructive">
          <Icons.trash className="mr-3 h-5 w-5" />
          Delete
          </Button>
          <DialogClose asChild>
            <Button className="ml-1 mr-1 flex-auto" variant="secondary" type="button">
            Cancel
            </Button>
          </DialogClose>
          </div>

      </DialogContent>
    </Dialog>

    </div>
  );
}