import { Landmark } from "lucide-react";

import { BANK_ACCOUNTS } from "@/lib/checkout/bank-accounts";

/**
 * Lista de cuentas bancarias para pago por transferencia manual.
 * Server component (sin estado) — reusable en checkout, página de pago y
 * (vía render estático) referenciable desde el email.
 */
export function BankAccountList() {
  return (
    <div className="flex flex-col gap-3">
      {BANK_ACCOUNTS.map((acc) => (
        <div
          key={`${acc.bank}-${acc.number}`}
          className="rounded-lg border border-border bg-background p-3 text-sm"
        >
          <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
            <Landmark className="h-4 w-4 text-primary" />
            {acc.bank}
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <dt>{acc.type === "Llave" ? "Llave" : `Cuenta de ${acc.type}`}</dt>
            <dd className="font-mono text-foreground">{acc.number}</dd>
            <dt>Titular</dt>
            <dd className="text-foreground">{acc.holder}</dd>
            {acc.legalId && (
              <>
                <dt>NIT/CC</dt>
                <dd className="text-foreground">{acc.legalId}</dd>
              </>
            )}
            {acc.agreement && (
              <>
                <dt>Convenio</dt>
                <dd className="text-foreground">{acc.agreement}</dd>
              </>
            )}
          </dl>
        </div>
      ))}
    </div>
  );
}
