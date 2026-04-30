import { StoreHeader } from "@/components/StoreHeader";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata = {
  title: "Recuperar contraseña",
  alternates: { canonical: "/auth/forgot-password" },
};

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />
      <div className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-8">
          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}
