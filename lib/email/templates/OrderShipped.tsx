import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "@react-email/components";

interface OrderShippedEmailProps {
  customerName: string;
  paymentReference: string;
  trackingNumber: string;
  carrier: string;
  trackingUrl?: string;
}

export function OrderShippedEmail({
  customerName,
  paymentReference,
  trackingNumber,
  carrier,
  trackingUrl,
}: OrderShippedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Tu pedido va en camino</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={brand}>Bloom Rose</Heading>
          <Heading style={h1}>¡Tu pedido va en camino, {customerName}!</Heading>
          <Text style={paragraph}>
            Tu pedido <strong>{paymentReference}</strong> ya está en manos de{" "}
            {carrier}.
          </Text>
          <Hr style={hr} />
          <Text style={paragraph}>
            <strong>Número de guía</strong>
            <br />
            <span style={code}>{trackingNumber}</span>
          </Text>
          {trackingUrl && (
            <Text style={paragraph}>
              <a href={trackingUrl} style={link}>
                Rastrear envío
              </a>
            </Text>
          )}
          <Hr style={hr} />
          <Text style={small}>
            Si tienes cualquier duda escríbenos respondiendo este email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = { backgroundColor: "#fafaf9", fontFamily: "Helvetica, Arial, sans-serif" };
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: 560 };
const brand = {
  fontSize: 14,
  letterSpacing: 2,
  textTransform: "uppercase" as const,
  color: "#a37f5f",
  marginBottom: 24,
};
const h1 = { fontSize: 24, color: "#1c1917", marginBottom: 8, fontWeight: 600 };
const paragraph = { fontSize: 14, lineHeight: "22px", color: "#44403c" };
const small = { fontSize: 13, color: "#78716c" };
const hr = { borderColor: "#e7e5e4", margin: "24px 0" };
const code = {
  fontFamily: "monospace",
  fontSize: 18,
  color: "#1c1917",
  letterSpacing: 1,
};
const link = { color: "#a37f5f", textDecoration: "underline" };
