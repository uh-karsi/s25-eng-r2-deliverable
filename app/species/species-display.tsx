  "use client";

  import { Input } from "@/components/ui/input";
import SpeciesCard from "./species-card";
import type { Database } from "@/lib/schema";
import { useState } from "react";
type Species = Database["public"]["Tables"]["species"]["Row"];
type Comment = Database["public"]["Tables"]["comments"]["Row"];


interface displayProps {
    sessionId: string;
    species: Species[] | null;
    comments: Comment[] | null;  }


export default function SpeciesDisplay(props: displayProps) {
  const {sessionId, species, comments} = props;
  const [search, setSearch] = useState<boolean>(false)
  const [searchInput, setSearchInput] = useState<string>("")
  const handleSearch = (input: string)=>{
    setSearchInput(input)
    if (input.length > 0){
      setSearch(true)
    } else if (input.length == 0 || input == null || input == "") {
      setSearch(false)
    }    
  }
  
 
  return (
    <div>
      {species && (
        <Input type="text" name="search" onChange={(event=>{handleSearch(event.target.value)})} placeholder="Search species">
        </Input>
      )}
      
        {search && comments  && (
            <div className="flex flex-wrap justify-center">
            {species?.filter(function(i: Species) {
                if (i.scientific_name.toLowerCase().includes(searchInput.toLowerCase()) || i.common_name?.toLowerCase().includes(searchInput.toLowerCase()) || i.description?.toLowerCase().includes(searchInput.toLowerCase())){
                  return true;
                } else {
                  return false
                }
                }).map((species: Species) => <SpeciesCard key={species.id} species={species} userId={sessionId} comments={comments}/>)}

        {species?.filter(function(i: Species) {
                if (i.scientific_name.toLowerCase().includes(searchInput.toLowerCase()) || i.common_name?.toLowerCase().includes(searchInput.toLowerCase()) || i.description?.toLowerCase().includes(searchInput.toLowerCase())){
                  return true;
                } else {
                  return false
                }
                }).length == 0  && (
        <h3 className="mt-10">No species found!</h3>
        )}
        </div>
        
       )}

       {search==false && comments && (
          <div className="flex flex-wrap justify-center">
          {species?.map((species: Species) => <SpeciesCard key={species.id} species={species} userId={sessionId} comments={comments}/>)}
            </div>
        )}


      </div>
        
      
  
    
  
  );
}

