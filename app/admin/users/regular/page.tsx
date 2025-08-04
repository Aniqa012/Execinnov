import RegularUsersClient from "@/components/RegularUsersClient";

export default async function RegularUsersPage() {

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Regular Users</h1>
          <p className="text-gray-600">Manage regular users and their accounts</p>
        </div>
      </div>
      
      <RegularUsersClient />
    </div>
  );
} 