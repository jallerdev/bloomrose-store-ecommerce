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

interface NewsletterWelcomeProps {
  shopUrl: string;
}

export function NewsletterWelcomeEmail({ shopUrl }: NewsletterWelcomeProps) {
  return (
    <Html>
      <Head />
      <Preview>Te uniste a la lista de Bloom Rose 💌</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Banner header con color de marca */}
          <Section style={header}>
            <Text style={brand}>Bloom Rose</Text>
            <Text style={tagline}>Bisutería artesanal · Colombia</Text>
          </Section>

          {/* Card principal */}
          <Section style={card}>
            <Text style={badge}>Comunidad Bloom Rose</Text>
            <Heading as="h1" style={h1}>
              ¡Estás dentro! 💌
            </Heading>
            <Text style={paragraph}>
              Gracias por sumarte a nuestra lista. Serás de las primeras en
              enterarte de cada lanzamiento, drops privados y promociones que
              solo enviamos a esta comunidad.
            </Text>
            <Text style={paragraph}>
              Mientras tanto, dale un vistazo a las piezas que ya tenemos
              disponibles — hechas a mano para resaltar tu esencia.
            </Text>

            <Section style={{ textAlign: "center", margin: "32px 0 8px" }}>
              <Button href={shopUrl} style={cta}>
                Explorar el catálogo
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Text style={footerText}>
            Estás recibiendo este correo porque te suscribiste en{" "}
            <a href={shopUrl} style={inlineLink}>
              bloomroseaccesorios.com
            </a>
            . Si no fuiste tú, ignora este mensaje — no te enviaremos más.
          </Text>
          <Text style={footerCopy}>
            © {new Date().getFullYear()} Bloom Rose Accesorios · Hecho con
            cariño en Colombia
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// ── Estilos ────────────────────────────────────────────────────────────
// Paleta alineada con globals.css (--primary rosa #ec9bbf, --foreground
// #3a232c). Email-safe (sin variables CSS).

const PRIMARY = "#ec9bbf";
const PRIMARY_DARK = "#d97aa8";
const FG = "#3a232c";
const MUTED = "#7a6770";
const BG_PAGE = "#fdf9fa";
const BG_CARD = "#ffffff";
const BG_HEADER = "#fce4ee";
const BORDER = "#f0e1e8";

const body = {
  backgroundColor: BG_PAGE,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  margin: 0,
  padding: 0,
};

const container = {
  margin: "0 auto",
  padding: "24px 16px 40px",
  maxWidth: 580,
};

const header = {
  backgroundColor: BG_HEADER,
  padding: "32px 24px",
  borderRadius: "16px 16px 0 0",
  textAlign: "center" as const,
};

const brand = {
  fontSize: 32,
  fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
  color: FG,
  margin: 0,
  lineHeight: "32px",
};

const tagline = {
  fontSize: 11,
  letterSpacing: 2,
  textTransform: "uppercase" as const,
  color: PRIMARY_DARK,
  margin: "8px 0 0",
  fontWeight: 600,
};

const card = {
  backgroundColor: BG_CARD,
  padding: "40px 32px 32px",
  borderRadius: "0 0 16px 16px",
  border: `1px solid ${BORDER}`,
  borderTop: "none",
};

const badge = {
  display: "inline-block",
  fontSize: 10,
  letterSpacing: 2,
  textTransform: "uppercase" as const,
  color: PRIMARY_DARK,
  backgroundColor: BG_HEADER,
  padding: "4px 12px",
  borderRadius: 999,
  margin: "0 0 16px",
  fontWeight: 600,
};

const h1 = {
  fontSize: 28,
  lineHeight: "34px",
  color: FG,
  margin: "0 0 16px",
  fontWeight: 600,
};

const paragraph = {
  fontSize: 15,
  lineHeight: "24px",
  color: FG,
  margin: "0 0 16px",
};

const cta = {
  backgroundColor: FG,
  color: "#ffffff",
  padding: "14px 32px",
  borderRadius: 12,
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 500,
  letterSpacing: 0.3,
  display: "inline-block",
};

const hr = {
  borderColor: BORDER,
  margin: "32px 0 16px",
};

const footerText = {
  fontSize: 12,
  lineHeight: "18px",
  color: MUTED,
  margin: "0 0 8px",
  textAlign: "center" as const,
};

const footerCopy = {
  fontSize: 11,
  lineHeight: "16px",
  color: MUTED,
  margin: 0,
  textAlign: "center" as const,
};

const inlineLink = {
  color: PRIMARY_DARK,
  textDecoration: "underline",
};
