import { ServerPagination } from "@/components/ServerPagination";
import { ToolsSearchFilter } from "@/components/ToolsSearchFilter";
import ToolsTable from "@/components/ToolsTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    category?: string;
    search?: string;
  }>;
}

async function getCategories() {
  try {
    const request = await fetch(`${process.env.AUTH_URL}/api/categories`)
    const data = await request.json()
    return data.categories 
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

async function getTools(searchParams: {page: string, limit: string, category: string, search: string}) {
  try {
    
    
    // Build query parameters
    const params = new URLSearchParams({
      page: searchParams.page || '1',
      limit: searchParams.limit || '10',
    });
    
    // Add optional parameters if they exist
    if (searchParams.category) {
      params.append('category', searchParams.category);
    }
    
    if (searchParams.search) {
      params.append('search', searchParams.search);
    }

    const response = await fetch(`${process.env.AUTH_URL}/api/tools?${params.toString()}`, {headers: await headers()});
    
    if (!response.ok) {
      throw new Error('Failed to fetch tools');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch tools:", error);
    return {
      tools: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalTools: 0,
        hasMore: false,
        limit: 10
      }
    };
  }
}

export default async function Page({ searchParams }: PageProps) {
  const {page, limit, category, search} = await searchParams
  // Fetch both tools and categories in parallel
  const [{ tools, pagination }, categories] = await Promise.all([
    getTools({page: page || '1', limit: limit || '10', category: category || '', search: search || ''}),
    getCategories()
  ]);

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tools Management</h1>
          <p className="text-muted-foreground">
            Manage your tools and their configurations
          </p>
        </div>
        <Link href="/admin/tools/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Tool
          </Button>
        </Link>
      </div>
      
      <ToolsSearchFilter
        categories={categories}
        currentSearch={search || ''}
        currentCategory={category || ''}
        basePath="/admin/tools"
      />
      
      <ToolsTable tools={tools} />
      
      <ServerPagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalTools}
        basePath="/admin/tools"
        searchParams={{page: page || '1', limit: limit || '10', category: category || 'All', search: search || ''}}
      />
    </div>
  );
}