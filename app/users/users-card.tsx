"use client";


import type { Database } from "@/lib/schema";

type User = Database["public"]["Tables"]["profiles"]["Row"];


export default function UsersCard({user} : {user : User}) {

  return (
    <div className="m-4 w-72 min-w-72 flex-none rounded border-2 p-3 shadow">
      
      <h3 className="mt-3 text-2xl font-semibold">{user.display_name}</h3>
      <h4 className="text-lg font-light italic">{user.email}</h4>
      <p className="mt-3">{user.biography}</p>
      

    </div>
  );
}
