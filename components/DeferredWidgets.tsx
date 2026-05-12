"use client";

import dynamic from "next/dynamic";

const Toaster = dynamic(
  () => import("@/components/ui/sonner").then((m) => ({ default: m.Toaster })),
  { ssr: false },
);

const FloatingContact = dynamic(
  () =>
    import("@/components/FloatingContact").then((m) => ({
      default: m.FloatingContact,
    })),
  { ssr: false },
);

const Analytics = dynamic(
  () => import("@/components/Analytics").then((m) => ({ default: m.Analytics })),
  { ssr: false },
);

interface Props {
  whatsappNumber: string;
  chatEnabled: boolean;
}

export function DeferredWidgets({ whatsappNumber, chatEnabled }: Props) {
  return (
    <>
      <Toaster />
      <FloatingContact
        whatsappNumber={whatsappNumber}
        chatEnabled={chatEnabled}
      />
      <Analytics />
    </>
  );
}
