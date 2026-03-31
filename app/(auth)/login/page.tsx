import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="glass w-full max-w-md rounded-2xl p-8">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">Use Supabase Auth to access your trade journal.</p>
        <div className="mt-6 space-y-3">
          <Button className="w-full">Continue with Email</Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Back to Landing</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
