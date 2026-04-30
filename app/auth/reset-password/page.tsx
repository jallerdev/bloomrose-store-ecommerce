import { StoreHeader } from "@/components/StoreHeader";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata = {
  title: "Cambiar contraseña",
  alternates: { canonical: "/auth/reset-password" },
};

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />
      <div className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-8">
          <ResetPasswordForm />
        </div>
      </div>
    </main>
  );
}
