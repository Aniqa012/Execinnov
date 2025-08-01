import AdminUsersClient from "@/components/AdminUsersClient";

export default async function AdminUsersPage() {

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Users</h1>
          <p className="text-gray-600">Manage admin users and their permissions</p>
        </div>
      </div>
      
      <AdminUsersClient />
    </div>
  );
} 