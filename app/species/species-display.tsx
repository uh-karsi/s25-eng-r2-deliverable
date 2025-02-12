  "use client";

  import { Input } from "@/components/ui/input";
import SpeciesCard from "./species-card";
import type { Database } from "@/lib/schema";
import { useState } from "react";
import { Icons } from "@/components/icons";
type Species = Database["public"]["Tables"]["species"]["Row"];
type Comment = Database["public"]["Tables"]["comments"]["Row"];


interface displayProps {
    sessionId: string;
    species: Array<Species> | null;
    comments: Array<Comment> | null;  }


export default function SpeciesDisplay(props: displayProps) {
  const {sessionId, species, comments} = props;
  const [search, setSearch] = useState<boolean>(false)
  const [searchInput, setSearchInput] = useState<string>("")
  const handleSearch = (input: string, species: Array<Species>)=>{
    setSearchInput(input)
    if (input.length > 0){
      setSearch(true)
    } else if (input.length == 0 || input == null || input == "") {
      setSearch(false)
    }    
  }
  
 
  return (
    <div>
      <Input type="text" name="search" onChange={(event=>{handleSearch(event.target.value, species)})} placeholder="Search species">
        </Input>
        {search ? 
            <div className="flex flex-wrap justify-center">
            {species?.filter((i)=>{return i.scientific_name.toLowerCase().includes(searchInput.toLowerCase()) || i.common_name?.toLowerCase().includes(searchInput.toLowerCase()) || i.description?.toLowerCase().includes(searchInput.toLowerCase())}).map((species: Species) => <SpeciesCard key={species.id} species={species} userId={sessionId} comments={comments}/>)}

            {species?.filter((i)=>{return i.scientific_name.toLowerCase().includes(searchInput.toLowerCase()) || i.common_name?.toLowerCase().includes(searchInput.toLowerCase()) || i.description?.toLowerCase().includes(searchInput.toLowerCase())}).length == 0  && (
        <h3 className="mt-10">No species found!</h3>
        )}
        </div>
        
        : 
          <div className="flex flex-wrap justify-center">
          {species?.map((species: Species) => <SpeciesCard key={species.id} species={species} userId={sessionId} comments={comments}/>)}
      </div>
        
      }
    </div>
    
  
  );
}

