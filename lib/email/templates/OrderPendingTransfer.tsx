import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface BankAccountDTO {
  bank: string;
  type: string;
  number: string;
  holder: string;
  legalId?: string;
  agreement?: string;
}

interface OrderPendingTransferProps {
  customerName: string;
  paymentReference: string;
  total: string;
  whatsappUrl: string;
  whatsappNumber: string;
  bankAccounts: BankAccountDTO[];
}

export function OrderPendingTransferEmail({
  customerName,
  paymentReference,
  total,
  whatsappUrl,
  whatsappNumber,
  bankAccounts,
}: OrderPendingTransferProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Tu pedido {paymentReference} está pendiente de pago — reporta tu
        transferencia
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={brand}>Bloom Rose Accesorios</Heading>
          </Section>

          <Section style={card}>
            <Heading as="h1" style={h1}>
              ¡Gracias, {customerName}!
            </Heading>
            <Text style={lead}>
              Recibimos tu pedido <strong>{paymentReference}</strong> por un
              total de <strong>{total}</strong>. Está{" "}
              <strong>pendiente de pago</strong>.
            </Text>

            <Section style={notice}>
              <Text style={noticeText}>
                <strong>ATENCIÓN:</strong> Debes enviar el soporte de pago por
                WhatsApp al <strong>{whatsappNumber}</strong> con el número de
                pedido <strong>{paymentReference}</strong>. Tu orden será
                despachada de <strong>3 a 8 días hábiles (lunes a viernes)</strong>{" "}
                a ciudades principales tras confirmar el pago. Para poblaciones
                rurales o de difícil acceso la entrega puede demorar más días.
              </Text>
            </Section>

            <Text style={sectionLabel}>Cuentas para transferencia</Text>
            {bankAccounts.map((acc) => (
              <Section key={`${acc.bank}-${acc.number}`} style={bankBox}>
                <Text style={bankName}>{acc.bank}</Text>
                <Text style={bankLine}>
                  {acc.type === "Llave" ? "Llave" : `Cuenta de ${acc.type}`}:{" "}
                  <strong>{acc.number}</strong>
                </Text>
                <Text style={bankLine}>Titular: {acc.holder}</Text>
                {acc.legalId && (
                  <Text style={bankLine}>NIT/CC: {acc.legalId}</Text>
                )}
                {acc.agreement && (
                  <Text style={bankLine}>Convenio: {acc.agreement}</Text>
                )}
              </Section>
            ))}

            <Section style={{ textAlign: "center", margin: "28px 0 8px" }}>
              <Button href={whatsappUrl} style={cta}>
                Reportar pago por WhatsApp
              </Button>
            </Section>

            <Hr style={hr} />
            <Text style={fineprint}>
              Recuerda: el pedido no se despacha hasta que confirmemos tu pago.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const PRIMARY_DARK = "#c66993";
const BRAND_TEXT = "#7a3a52";
const FG = "#4a2d3a";
const SUB = "#6f4f5e";
const MUTED = "#b89dab";

const body = {
  backgroundColor: "#fdf6f9",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  margin: 0,
  padding: "24px 0",
};

const container = { margin: "0 auto", padding: "0 16px", maxWidth: 600 };

const header = { textAlign: "center" as const, padding: "8px 0 16px" };

const brand = {
  fontSize: 22,
  color: BRAND_TEXT,
  margin: 0,
  fontWeight: 700,
};

const card = {
  backgroundColor: "#ffffff",
  padding: "32px 28px",
  borderRadius: 16,
  border: "1px solid #f5d6e3",
};

const h1 = { fontSize: 24, color: BRAND_TEXT, margin: "0 0 12px" };

const lead = { fontSize: 15, lineHeight: "24px", color: FG, margin: "0 0 20px" };

const notice = {
  backgroundColor: "#fff7ed",
  border: "1px solid #fed7aa",
  borderRadius: 12,
  padding: "14px 16px",
  margin: "0 0 24px",
};

const noticeText = {
  fontSize: 13,
  lineHeight: "20px",
  color: "#9a3412",
  margin: 0,
};

const sectionLabel = {
  fontSize: 11,
  letterSpacing: 1,
  textTransform: "uppercase" as const,
  color: PRIMARY_DARK,
  fontWeight: 700,
  margin: "0 0 8px",
};

const bankBox = {
  border: "1px solid #f5d6e3",
  borderRadius: 10,
  padding: "12px 14px",
  margin: "0 0 10px",
};

const bankName = { fontSize: 14, fontWeight: 700, color: FG, margin: "0 0 4px" };

const bankLine = { fontSize: 13, color: SUB, margin: "0 0 2px" };

const cta = {
  backgroundColor: "#25D366",
  color: "#ffffff",
  padding: "14px 32px",
  borderRadius: 999,
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 600,
  display: "inline-block",
};

const hr = { borderColor: "#f5d6e3", margin: "24px 0 16px" };

const fineprint = {
  fontSize: 12,
  color: MUTED,
  textAlign: "center" as const,
  margin: 0,
};
