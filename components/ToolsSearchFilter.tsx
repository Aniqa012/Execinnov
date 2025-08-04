"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

interface ToolsSearchFilterProps {
  categories: Category[];
  currentSearch?: string;
  currentCategory?: string;
  basePath: string;
}

export function ToolsSearchFilter({
  categories,
  currentSearch,
  currentCategory,
  basePath
}: ToolsSearchFilterProps) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch || "");
  const [category, setCategory] = useState(currentCategory || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set('search', search.trim());
    }
    if (category) {
      params.set('category', category);
    }
    
    const queryString = params.toString();
    const url = queryString ? `${basePath}?${queryString}` : basePath;
    router.push(url);
  };



  return (
    <div className="mb-6">
     
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="space-y-2">
              <Label htmlFor="search">Search Tools</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by title or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category || 'All'} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            
          </div>

          {/* Current Filters Display */}
          {(currentSearch || currentCategory) && (
            <div className="border-t pt-4">
              <div className="text-sm text-muted-foreground mb-2">Active Filters:</div>
              <div className="flex flex-wrap gap-2">
                {currentSearch && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    <span>Search: &quot;{currentSearch}&quot;</span>
                    <Link 
                      href={`${basePath}?${new URLSearchParams({ 
                        ...(currentCategory && { category: currentCategory })
                      }).toString()}`}
                      className="ml-1"
                    >
                      <X className="h-3 w-3 cursor-pointer hover:text-blue-600" />
                    </Link>
                  </Badge>
                )}
                {currentCategory && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                    <span>
                      Category: {categories.find(c => c.id === currentCategory)?.name || 'Unknown'}
                    </span>
                    <Link 
                      href={`${basePath}?${new URLSearchParams({ 
                        ...(currentSearch && { search: currentSearch })
                      }).toString()}`}
                      className="ml-1"
                    >
                      <X className="h-3 w-3 cursor-pointer hover:text-green-600" />
                    </Link>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
} 