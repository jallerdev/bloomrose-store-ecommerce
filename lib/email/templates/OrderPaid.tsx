import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";

interface OrderPaidEmailProps {
  customerName: string;
  paymentReference: string;
  items: {
    title: string;
    variantName: string | null;
    quantity: number;
    lineTotal: string;
    imageUrl: string | null;
  }[];
  subtotal: string;
  shippingCost: string;
  giftWrapCost?: string | null;
  giftMessage?: string | null;
  total: string;
  shippingAddress: {
    line1: string;
    line2: string | null;
    city: string;
    department: string;
  };
  orderUrl: string;
}

export function OrderPaidEmail({
  customerName,
  paymentReference,
  items,
  subtotal,
  shippingCost,
  giftWrapCost,
  giftMessage,
  total,
  shippingAddress,
  orderUrl,
}: OrderPaidEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Tu pedido en Bloom Rose ha sido confirmado</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={brand}>Bloom Rose</Heading>
          <Heading style={h1}>¡Gracias por tu compra, {customerName}!</Heading>
          <Text style={paragraph}>
            Recibimos tu pago. Estamos preparando tu pedido con cariño.
          </Text>
          <Text style={small}>
            Referencia: <strong>{paymentReference}</strong>
          </Text>

          <Hr style={hr} />

          <Heading as="h2" style={h2}>
            Tu pedido
          </Heading>
          <Section>
            {items.map((item, i) => (
              <Row key={i} style={itemRow}>
                <Column style={{ width: 56 }}>
                  {item.imageUrl ? (
                    <Img
                      src={item.imageUrl}
                      width={48}
                      height={48}
                      alt={item.title}
                      style={itemImg}
                    />
                  ) : null}
                </Column>
                <Column>
                  <Text style={itemTitle}>{item.title}</Text>
                  <Text style={itemMeta}>
                    {item.variantName ? `${item.variantName} · ` : ""}x
                    {item.quantity}
                  </Text>
                </Column>
                <Column align="right">
                  <Text style={itemPrice}>{item.lineTotal}</Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={hr} />

          <Section>
            <Row>
              <Column>
                <Text style={small}>Subtotal</Text>
              </Column>
              <Column align="right">
                <Text style={small}>{subtotal}</Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text style={small}>Envío</Text>
              </Column>
              <Column align="right">
                <Text style={small}>{shippingCost}</Text>
              </Column>
            </Row>
            {giftWrapCost ? (
              <Row>
                <Column>
                  <Text style={small}>Empaque de regalo</Text>
                </Column>
                <Column align="right">
                  <Text style={small}>{giftWrapCost}</Text>
                </Column>
              </Row>
            ) : null}
            <Row>
              <Column>
                <Text style={totalText}>Total</Text>
              </Column>
              <Column align="right">
                <Text style={totalText}>{total}</Text>
              </Column>
            </Row>
          </Section>

          {giftMessage ? (
            <>
              <Hr style={hr} />
              <Heading as="h2" style={h2}>
                🎁 Tu mensaje de regalo
              </Heading>
              <Text style={{ ...paragraph, fontStyle: "italic" }}>
                “{giftMessage}”
              </Text>
            </>
          ) : null}

          <Hr style={hr} />

          <Heading as="h2" style={h2}>
            Dirección de envío
          </Heading>
          <Text style={paragraph}>
            {shippingAddress.line1}
            {shippingAddress.line2 ? `, ${shippingAddress.line2}` : ""}
            <br />
            {shippingAddress.city}, {shippingAddress.department}
          </Text>

          <Hr style={hr} />

          <Text style={paragraph}>
            Te avisaremos cuando tu pedido salga de nuestra bodega con su número
            de guía.
          </Text>
          <Text style={paragraph}>
            <a href={orderUrl} style={link}>
              Ver pedido en mi cuenta
            </a>
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
const h2 = { fontSize: 16, color: "#1c1917", marginTop: 16, marginBottom: 8 };
const paragraph = { fontSize: 14, lineHeight: "22px", color: "#44403c" };
const small = { fontSize: 13, color: "#78716c", margin: "4px 0" };
const hr = { borderColor: "#e7e5e4", margin: "24px 0" };
const itemRow = { marginBottom: 12 };
const itemImg = { borderRadius: 6, objectFit: "cover" as const };
const itemTitle = { fontSize: 14, color: "#1c1917", margin: 0, fontWeight: 500 };
const itemMeta = { fontSize: 12, color: "#78716c", margin: "2px 0 0" };
const itemPrice = { fontSize: 14, color: "#1c1917", margin: 0, fontWeight: 500 };
const totalText = { fontSize: 16, color: "#1c1917", fontWeight: 600, margin: "8px 0 0" };
const link = { color: "#a37f5f", textDecoration: "underline" };
