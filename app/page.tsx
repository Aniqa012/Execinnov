import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full" size="lg">
            <Link href="/signin">Sign In</Link>
          </Button>
          <Button asChild variant="outline" className="w-full" size="lg">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
