import UserDetails from "./UserDetails";
import { headers } from "next/headers";

export default async function Page() {
  const response = await fetch(`${process.env.AUTH_URL}/api/users/me`, {
    headers: await headers(),
  });
  const user = await response.json();
  console.log("user: ", user);

  return (
    <div className="container mx-auto ">
      
      {user ? <UserDetails user={user} /> : <div>Loading...</div>}
    </div>
  );
}
