"use client";

import { useState } from "react";

import { ChatBot } from "@/components/ChatBot";
import { WhatsAppFAB } from "@/components/WhatsAppFAB";

interface Props {
  whatsappNumber: string;
  /** True si el server tiene ANTHROPIC_API_KEY para activar el bot. */
  chatEnabled: boolean;
}

/**
 * Coordina el botón flotante de WhatsApp y el bot de chat para que no se
 * superpongan visualmente.
 */
export function FloatingContact({ whatsappNumber, chatEnabled }: Props) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <WhatsAppFAB phoneNumber={whatsappNumber} isChatOpen={chatOpen} />
      <ChatBot enabled={chatEnabled} onOpenChange={setChatOpen} />
    </>
  );
}
