import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  customerName: string;
  shopUrl: string;
}

export function WelcomeEmail({ customerName, shopUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenida a Bloom Rose</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={brand}>Bloom Rose</Heading>
          <Heading style={h1}>¡Bienvenida, {customerName}!</Heading>
          <Text style={paragraph}>
            Gracias por unirte a la familia Bloom Rose. Estamos felices de
            tenerte aquí.
          </Text>
          <Text style={paragraph}>
            Explora nuestra colección de bisutería y accesorios artesanales
            diseñados para resaltar tu esencia única.
          </Text>
          <Text style={paragraph}>
            <a href={shopUrl} style={link}>
              Ir al catálogo
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
const paragraph = { fontSize: 14, lineHeight: "22px", color: "#44403c" };
const link = { color: "#a37f5f", textDecoration: "underline" };
