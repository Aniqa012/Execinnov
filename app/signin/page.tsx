import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import SignInClient from "./SignInClient";

export default function SignInPage() {
  
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
          {/* <img
            src={logoSrc}
            alt="Betop Logo"
            className="w-32 h-auto mb-6"
            draggable={false}
          /> */}
          <Card className="w-full max-w-md">
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <SignInClient />
    </Suspense>
  );
}
