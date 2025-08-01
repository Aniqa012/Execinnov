import { Badge } from "@/components/ui/badge";

import { Tool } from "@/lib/types";
import { CheckCircle, Crown } from "lucide-react";

interface toolCardProps {
  tool: Tool;
  onClick?: (tool: Tool) => void;
}

export default function CustomToolCard({ tool, onClick }: toolCardProps) {
  return (
    <>
      <div onClick={() => onClick?.(tool)} className="cursor-pointer p-[4px] border-border flex flex-col items-center rounded-[28px] w-full bg-[var(--custom-primary)] relative z-0 duration-200 hover:translate-y-[-3px] hover:scale-[1.05] transition-all hover:drop-shadow-md hover:z-10">
        <div className="bg-[var(--custom-secondary)] text-card-foreground rounded-3xl p-4 md:p-6 md:pt-3 shadow-md border w-full min-h-[150px] border-border">
          <div className="mb-3 flex justify-end">
            {tool.isPro ?(
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0"
              >
                <Crown className="w-3 h-3 mr-1" />
                Pro
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Free
              </Badge>
            )}
          </div>
          <h2 className="text-base md:text-lg font-bold text-card-foreground mb-2 leading-tight line-clamp-2">
            {tool.title}
          </h2>
          <p className="text-sm md:text-md text-muted-foreground mb-2 md:mb-3">
            {tool.description}
          </p>
        </div>
        <p
          className="text-sm text-card-foreground hover:text-primary md:text-base font-bold py-2 md:py-3 transition-colors"
          
        >
          {tool?.category?.name || "Uncategorized"}
        </p>
      </div>
    </>
  );
}
