/**
 * Construye el link de WhatsApp pre-rellenado para que la clienta reporte
 * el pago de su transferencia. Compartido entre la página /pago y el email.
 */
export function buildPaymentWhatsappUrl(args: {
  whatsappNumber: string;
  paymentReference: string;
  total: string;
}): string {
  const text = `Hola Bloom Rose, ya pagué mi pedido ${args.paymentReference} por ${args.total} por transferencia bancaria. Adjunto el comprobante.`;
  const number = args.whatsappNumber.replace(/[^0-9]/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
