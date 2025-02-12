  "use client";

import { Input } from "@/components/ui/input";
import SpeciesCard from "./species-card";
import type { Database } from "@/lib/schema";
import { useState } from "react";


type Species = Database["public"]["Tables"]["species"]["Row"];
type Comment = Database["public"]["Tables"]["comments"]["Row"];

//prop types and declaration
interface displayProps {
    sessionId: string;
    species: Species[] | null;
    comments: Comment[] | null;  }


export default function SpeciesDisplay(props: displayProps) {
  //props
  const {sessionId, species, comments} = props;

  //toggle search state 
  const [search, setSearch] = useState<boolean>(false)
  const [searchInput, setSearchInput] = useState<string>("")

  //if typing in search bar input, toggle search state to be true
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
      
      {/* if searching, display species for the filtered list of species, checking scientific name, common name, and description */}
        {search && comments  && (
            <div className="flex flex-wrap justify-center">
            {species?.filter(function(i: Species) {
                if (i.scientific_name.toLowerCase().includes(searchInput.toLowerCase())){
                  return true;
                } else if (i.common_name?.toLowerCase().includes(searchInput.toLowerCase())){
                  return true
                } else if (i.description?.toLowerCase().includes(searchInput.toLowerCase())) {
                  return true
                } else {
                  false
                }
                }).map((species: Species) => <SpeciesCard key={species.id} species={species} userId={sessionId} comments={comments}/>)}

        {/* if filtered list is empty, show message of no search results found */}
        {species?.filter(function(i: Species) {
                if (i.scientific_name.toLowerCase().includes(searchInput.toLowerCase())){
                  return true;
                } else if (i.common_name?.toLowerCase().includes(searchInput.toLowerCase())){
                  return true
                } else if (i.description?.toLowerCase().includes(searchInput.toLowerCase())) {
                  return true
                } else {
                  false
                }
                }).length == 0  && (
        <h3 className="mt-10">No species found!</h3>
        )}
        </div>
        
       )}

      {/* if not searching, show all species */}
       {search==false && comments && (
          <div className="flex flex-wrap justify-center">
          {species?.map((species: Species) => <SpeciesCard key={species.id} species={species} userId={sessionId} comments={comments}/>)}
            </div>
        )}


      </div>
  
  );
}

