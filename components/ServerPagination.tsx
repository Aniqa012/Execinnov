import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface ServerPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  basePath: string;
  searchParams?: Record<string, string>;
}

export function ServerPagination({
  currentPage,
  totalPages,
  totalItems,
  basePath,
  searchParams = {},
}: ServerPaginationProps) {
  if (totalPages <= 1) return null;

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Helper function to create URL with search params
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    return `${basePath}?${params.toString()}`;
  };

  return (
    <Card className="mt-6">
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Pagination Info */}
          <div className="text-sm text-muted-foreground order-2 sm:order-1">
            Showing page {currentPage} of {totalPages} ({totalItems} total items)
          </div>
          
          {/* Pagination Controls */}
          <div className="flex items-center space-x-2 order-1 sm:order-2">
            {/* First Page */}
            <Link href={createPageUrl(1)}>
              <Button
                variant="outline"
                size="sm"
                disabled={!canGoPrevious}
                className="hidden sm:inline-flex"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            </Link>
            
            {/* Previous Page */}
            <Link href={createPageUrl(currentPage - 1)}>
              <Button
                variant="outline"
                size="sm"
                disabled={!canGoPrevious}
              >
                <ChevronLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
            </Link>
            
            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <Link key={pageNumber} href={createPageUrl(pageNumber)}>
                    <Button
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      className="w-9 h-9"
                    >
                      {pageNumber}
                    </Button>
                  </Link>
                );
              })}
            </div>
            
            {/* Next Page */}
            <Link href={createPageUrl(currentPage + 1)}>
              <Button
                variant="outline"
                size="sm"
                disabled={!canGoNext}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 sm:ml-2" />
              </Button>
            </Link>
            
            {/* Last Page */}
            <Link href={createPageUrl(totalPages)}>
              <Button
                variant="outline"
                size="sm"
                disabled={!canGoNext}
                className="hidden sm:inline-flex"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 