import dbConnect from "@/lib/dbConnection";
import CategoriesTable from "@/components/CategoriesTable";
import AddCategoryModal from "@/components/AddCategoryModal";

async function getCategories() {
  try {
    await dbConnect();
    const categories = await fetch(`${process.env.AUTH_URL}/api/categories`);
    const data = await categories.json();
    return data.categories;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export default async function Page() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Categories Management</h1>
          <p className="text-muted-foreground">
            Manage your tool categories
          </p>
        </div>
        <AddCategoryModal />
      </div>
      
      <CategoriesTable categories={categories} />
    </div>
  );
}