"use client";
/*
Note: "use client" is a Next.js App Router directive that tells React to render the component as
a client component rather than a server component. This establishes the server-client boundary,
providing access to client-side functionality such as hooks and event handlers to this component and
any of its imported children. Although the SpeciesCard component itself does not use any client-side
functionality, it is beneficial to move it to the client because it is rendered in a list with a unique
key prop in species/page.tsx. When multiple component instances are rendered from a list, React uses the unique key prop
on the client-side to correctly match component state and props should the order of the list ever change.
React server components don't track state between rerenders, so leaving the uniquely identified components (e.g. SpeciesCard)
can cause errors with matching props and state in child components if the list order changes.
*/
import { Button } from "@/components/ui/button";
import type { Database } from "@/lib/schema";
import Image from "next/image";
import { Icons } from "@/components/icons";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
 
} from "@/components/ui/dialog";
import { useState } from "react";
import EditSpeciesDialog from "./edit-species-dialog";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Comment from "./comment";
import AddCommentDialog from "./add-comment";

type Species = Database["public"]["Tables"]["species"]["Row"];
type Comment = Database["public"]["Tables"]["comments"]["Row"];

interface speciesProps {
  species: Species;
  userId: string;
  comments: Comment[];
}

export default function SpeciesCard(props: speciesProps) {
  //prop handling
  const {species,userId, comments} = props;
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  

  //open state of more info
  const [open, setOpen] = useState<boolean>(false);
  const handleOpen = async (authId : string) => {setOpen(!open);setJoin(!join);
    await joinAuthor(authId); 
  }

  //join with author info
  interface AuthorInfo {
    display_name: string;
    email: string;
    biography: string | null; 
    species: object[]
  }
  const [authorInfo, setAuthorInfo] = useState<AuthorInfo[]>([]);
  const [join, setJoin] = useState<boolean>(false);

  const joinAuthor = async (authorId : string) => {
  const { data, error } = await supabase.from('profiles').select('display_name, email, biography, species!inner(scientific_name, id)').eq('id', authorId).limit(1)

   //catch error messages
   if (error) {
    return toast({
      title: "Something went wrong.",
      description: error.message,
      variant: "destructive",
    });
  }
 
  //data is set only if it is valid
  if (data && data.length > 0) {
    setAuthorInfo(data);
  } else {
    // If no data is found, you can either handle it gracefully or set an empty state
    setAuthorInfo([]);
  }


  
  };
  
  //open state of delete prompt
  const [deleteOpen, setDeleteOpen ] = useState<boolean>(false);
  const handleDeleteOpen = () => setDeleteOpen(!deleteOpen)

  //delete function
  const deleteSpecies = async (speciesDel : Species) => {
    const { error } = await supabase.from("species").delete().eq('id',speciesDel.id);

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
    console.log(joinAuthor(speciesDel.author))
    return toast({
      title: "Deleted!",
      description: "Permanently deleted " + speciesDel.scientific_name + ".",
    });
  };
  
  

  //open state of author bio
  const [bioOpen, setBioOpen ] = useState<boolean>(false);
  const handleBioOpen = () => setBioOpen(!bioOpen)
 

  return (
   
    <div className="m-4 w-72 min-w-72 flex-none rounded border-2 p-3 shadow">
       
      {species.image && (
        <div className="relative h-40 w-full">
          <Image src={species.image} alt={species.scientific_name} fill style={{ objectFit: "cover" }} />
        </div>
      )}
      <h3 className="mt-3 text-2xl font-semibold">{species.scientific_name}</h3>
      <h4 className="text-lg font-light italic">{species.common_name}</h4>
      <p>{species.description ? species.description.slice(0, 150).trim() + "..." : ""}</p>
      
      <Button className="mt-3 w-full" onClick={async ()=>await handleOpen(species.author)}>
          Learn More
        </Button>

{/* learn more about species info */}
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]  ">
        <DialogHeader>
          <DialogTitle>{species.scientific_name}</DialogTitle>
          <DialogDescription className="mt-10 mb-10">
          <span className="italic">{species.common_name}</span>  |  Kingdom: {species.kingdom}  |  Total Population: {species.total_population}
          </DialogDescription>
          {species.endangered && (
            <DialogDescription>*Endangered</DialogDescription>
          )}
         
        </DialogHeader>
          <p>{species.description}</p>
          {species.image && (
        <div className="relative h-60 w-full">
          <Image src={species.image} alt={species.scientific_name} fill style={{ objectFit: "cover" }} />
        </div>
        )}
      <div>
      {authorInfo ? (
          <div className="mb-7">
            <div className="flex">
            <p className="mb-7 ">Created by: {authorInfo[0]?.display_name} / {authorInfo[0]?.email} </p>
            <button onClick={handleBioOpen} className="mr-3 h-5 w-5">
            <Icons.chevronDown className="mr-3 ml-3 mt-0.7 h-5 w-5" />
            </button>
            </div>
         
            {bioOpen && authorInfo[0] && (
              <p className="text-sm">{authorInfo[0]?.biography} </p>
          )}
          {bioOpen && !authorInfo[0] &&(
              <p>This user does not have a biography yet! </p>
          )}
            
          </div>
        ):
        <p>No author information available</p>
        }
        
          
      
        {species.author == userId && (
          <div className="flex mb-5">
            <EditSpeciesDialog species={species} userId={userId} />
            <Button className="ml-1 mr-1 flex-auto" variant="secondary" type="button" onClick={handleDeleteOpen}>
          Delete Species
          </Button>

          </div>
        )} 
      
        <div>
          <p className="mb-5">Comments</p>
          <div className="flex flex-col justify-center">
            <div className="mb-5">
            {comments?.filter((element)=>element.species_id==species.id).map((comment: Comment) => <Comment key={comment.id} comment={comment} userId={userId} speciesId={species.id}/>)}
          {comments?.filter((element)=>element.species_id==species.id).length == 0 && (
            <p>No comments yet!</p>
          )}
            </div>
         
          <AddCommentDialog userId={userId} speciesId={species.id}></AddCommentDialog>
          
      </div>
        </div>
      </div>
      </DialogContent>
    </Dialog>

    {/* prompt delete dialog */}
    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]  ">
        <DialogHeader>
          <DialogTitle>Delete this species?</DialogTitle>
          <DialogDescription className="mt-10 mb-10">
          This action cannot be undone. Click &quot;Delete&quot; to permanently delete this species or click &quot;Cancel&quot; to return to the home screen.
          </DialogDescription>
        </DialogHeader>
         
          <div className="flex">
          <Button className="ml-1 mr-1 flex-auto" type="button" onClick={async ()=>{await deleteSpecies(species)}} variant="destructive">
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
