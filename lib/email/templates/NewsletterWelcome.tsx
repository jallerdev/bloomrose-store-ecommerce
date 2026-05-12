import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

interface NewsletterWelcomeProps {
  shopUrl: string;
}

export function NewsletterWelcomeEmail({ shopUrl }: NewsletterWelcomeProps) {
  return (
    <Html>
      <Head />
      <Preview>Te uniste a la lista de Bloom Rose</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={brand}>Bloom Rose</Heading>
          <Heading style={h1}>¡Estás dentro! 💌</Heading>
          <Text style={paragraph}>
            Gracias por sumarte a la lista de Bloom Rose. Recibirás las
            primicias de cada lanzamiento, drops privados y promociones que
            solo enviamos a esta comunidad.
          </Text>
          <Text style={paragraph}>
            Mientras tanto, dale un vistazo a las piezas que ya tenemos
            disponibles.
          </Text>
          <Text style={paragraph}>
            <a href={shopUrl} style={link}>
              Ir al catálogo →
            </a>
          </Text>
          <Text style={footer}>
            Si no fuiste tú quien se suscribió, puedes ignorar este correo —
            no te enviaremos más mensajes.
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
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: 560 };
const brand = {
  fontSize: 14,
  letterSpacing: 2,
  textTransform: "uppercase" as const,
  color: "#a37f5f",
  marginBottom: 24,
};
const h1 = {
  fontSize: 28,
  lineHeight: "32px",
  color: "#1a1a1a",
  marginBottom: 16,
};
const paragraph = {
  fontSize: 15,
  lineHeight: "24px",
  color: "#404040",
  marginBottom: 16,
};
const link = {
  color: "#a37f5f",
  textDecoration: "underline",
};
const footer = {
  fontSize: 12,
  lineHeight: "18px",
  color: "#7a7a7a",
  marginTop: 32,
  paddingTop: 16,
  borderTop: "1px solid #e5e5e5",
};
