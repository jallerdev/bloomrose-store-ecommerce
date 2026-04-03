import { AuthForm } from "@/components/auth/AuthForm";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4 py-12 bg-background">
      <Suspense
        fallback={
          <div className="h-[400px] w-full max-w-md animate-pulse rounded-2xl bg-muted" />
        }
      >
        <AuthForm />
      </Suspense>
    </div>
  );
}
