/**
 * Cuentas bancarias para pago por transferencia manual.
 * No son datos secretos — se muestran al cliente en el checkout, en la página
 * de pago y en el email de pedido pendiente.
 *
 * TODO(usuario): reemplazar los números placeholder por los reales de Bloom Rose.
 */

export interface BankAccount {
  bank: string;
  /** Tipo de cuenta: "Ahorros", "Corriente", o "Llave" para Nequi/Bre-B. */
  type: string;
  number: string;
  holder: string;
  /** NIT/CC del titular (opcional). */
  legalId?: string;
  /** Convenio de recaudo (opcional, Bancolombia/Davivienda). */
  agreement?: string;
}

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    bank: "Bancolombia",
    type: "Ahorros",
    number: "000-000000-00",
    holder: "Bloom Rose Accesorios",
    legalId: "000000000-0",
  },
  {
    bank: "Davivienda",
    type: "Ahorros",
    number: "0000000000",
    holder: "Bloom Rose Accesorios",
    legalId: "000000000-0",
  },
  {
    bank: "Nequi",
    type: "Llave",
    number: "+57 300 000 0000",
    holder: "Bloom Rose Accesorios",
  },
];
