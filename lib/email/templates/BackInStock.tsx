import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";

interface Props {
  productTitle: string;
  productImage: string | null;
  productUrl: string;
}

export function BackInStockEmail({
  productTitle,
  productImage,
  productUrl,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>{productTitle} ya está disponible en Bloom Rose</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={brand}>Bloom Rose</Heading>
          <Heading style={h1}>¡Ya está de vuelta!</Heading>
          <Text style={paragraph}>
            La pieza que estabas esperando volvió al inventario. Como las
            unidades suelen volar, te recomendamos asegurarla pronto.
          </Text>

          <Section style={card}>
            {productImage ? (
              <Img
                src={productImage}
                width={120}
                height={120}
                alt={productTitle}
                style={img}
              />
            ) : null}
            <Text style={productName}>{productTitle}</Text>
            <Button style={btn} href={productUrl}>
              Ver producto
            </Button>
          </Section>

          <Text style={small}>
            Si ya no te interesa, puedes ignorar este correo. Solo enviamos un
            aviso por suscripción.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#fafaf9",
  fontFamily: "Helvetica, Arial, sans-serif",
};
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: 520 };
const brand = {
  fontSize: 14,
  letterSpacing: 2,
  textTransform: "uppercase" as const,
  color: "#a37f5f",
  marginBottom: 24,
};
const h1 = {
  fontSize: 24,
  color: "#1c1917",
  marginBottom: 12,
  fontWeight: 600,
};
const paragraph = { fontSize: 14, lineHeight: "22px", color: "#44403c" };
const small = {
  fontSize: 12,
  color: "#a8a29e",
  marginTop: 24,
  textAlign: "center" as const,
};
const card = {
  backgroundColor: "#ffffff",
  border: "1px solid #e7e5e4",
  borderRadius: 12,
  padding: 24,
  textAlign: "center" as const,
  margin: "24px 0",
};
const img = { borderRadius: 8, margin: "0 auto 16px", objectFit: "cover" as const };
const productName = {
  fontSize: 16,
  color: "#1c1917",
  fontWeight: 500,
  margin: "0 0 16px",
};
const btn = {
  backgroundColor: "#1c1917",
  color: "#ffffff",
  padding: "10px 24px",
  borderRadius: 8,
  fontSize: 14,
  textDecoration: "none",
  display: "inline-block",
};
