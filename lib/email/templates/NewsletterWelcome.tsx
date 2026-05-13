import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

interface NewsletterWelcomeProps {
  siteUrl: string;
  shopUrl: string;
}

export function NewsletterWelcomeEmail({
  siteUrl,
  shopUrl,
}: NewsletterWelcomeProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Drops privados, lanzamientos antes que nadie y promos solo para
        suscriptoras.
      </Preview>
      <Body style={body}>
        {/* Spacer top */}
        <Container style={spacer} />

        <Container style={container}>
          {/* ── Header wordmark cursivo ──────────────────────────────
              Sin <Img> para evitar artefactos de compresión y problemas
              de carga. La marca se renderiza en cursiva (Brush Script /
              Snell Roundhand) que es la fuente web-safe más cercana a
              Sacramento que usa el sitio. */}
          <Section style={header}>
            <Heading as="h1" style={wordmark}>
              Bloom Rose
            </Heading>
            <Text style={subWordmark}>accesorios</Text>
            <Text style={tagline}>BISUTERÍA ARTESANAL · COLOMBIA</Text>
          </Section>

          {/* ── Card principal ─────────────────────────────────────── */}
          <Section style={card}>
            <Text style={badge}>BIENVENIDA</Text>

            <Heading as="h1" style={h1}>
              ¡Estás dentro! 💌
            </Heading>

            <Text style={lead}>
              Gracias por sumarte a la comunidad Bloom Rose. Desde hoy serás
              de las primeras en enterarte de cada novedad.
            </Text>

            {/* Beneficios */}
            <Section style={benefits}>
              <Row>
                <Column style={benefitCol}>
                  <Text style={benefitEmoji}>✨</Text>
                  <Text style={benefitTitle}>Lanzamientos</Text>
                  <Text style={benefitText}>
                    Acceso anticipado a cada nueva colección.
                  </Text>
                </Column>
                <Column style={benefitCol}>
                  <Text style={benefitEmoji}>🎁</Text>
                  <Text style={benefitTitle}>Drops privados</Text>
                  <Text style={benefitText}>
                    Piezas limitadas, solo para suscriptoras.
                  </Text>
                </Column>
                <Column style={benefitCol}>
                  <Text style={benefitEmoji}>💝</Text>
                  <Text style={benefitTitle}>Promos</Text>
                  <Text style={benefitText}>
                    Descuentos que no compartimos en redes.
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* CTA */}
            <Section style={{ textAlign: "center", margin: "32px 0 8px" }}>
              <Button href={shopUrl} style={cta}>
                Explorar el catálogo
              </Button>
            </Section>

            <Text style={fineprint}>
              Cero spam, solo lo bueno. Te puedes dar de baja cuando quieras.
            </Text>
          </Section>

          {/* ── Footer ─────────────────────────────────────────────── */}
          <Section style={footer}>
            <Text style={footerHeading}>Síguenos</Text>
            <Section style={{ textAlign: "center" }}>
              <Link
                href="https://instagram.com/bloomrose.store"
                style={socialLink}
              >
                Instagram
              </Link>
              <span style={socialSep}>·</span>
              <Link href={siteUrl} style={socialLink}>
                bloomroseaccesorios.com
              </Link>
            </Section>

            <Hr style={hr} />

            <Text style={footerSmall}>
              Recibiste este correo porque te suscribiste en{" "}
              <Link href={siteUrl} style={inlineLink}>
                bloomroseaccesorios.com
              </Link>
              . Si no fuiste tú, ignora este mensaje — no te enviaremos más.
            </Text>
            <Text style={footerCopy}>
              © {new Date().getFullYear()} Bloom Rose Accesorios · Hecho con
              cariño en Colombia
            </Text>
          </Section>
        </Container>

        <Container style={spacer} />
      </Body>
    </Html>
  );
}

// ── Estilos ────────────────────────────────────────────────────────────
// Paleta rosa. Email-safe (sin variables CSS, ni gap, ni flex modernos;
// usa Row/Column de react-email).

const PRIMARY = "#ec9bbf"; // rosa claro (badges, banners)
const PRIMARY_DARK = "#c66993"; // rosa fuerte (acentos, CTA bg)
const PRIMARY_DEEPER = "#a14a6e"; // rosa profundo (CTA hover/borde)
const BRAND_TEXT = "#7a3a52"; // rosa oscuro para wordmark y h1
const FG = "#4a2d3a"; // texto principal (rose-tinted, no café)
const SUB = "#6f4f5e"; // texto secundario
const MUTED = "#b89dab"; // texto auxiliar (fineprint, fechas)
const BG_PAGE = "#fdf6f9";
const BG_CARD = "#ffffff";
const BG_HEADER = "#ec9bbf"; // mismo tono que el rosa del logo
const BG_FOOTER = "#fbe0eb"; // rosa más claro para diferenciar el footer
const BG_BENEFITS = "#fef0f6";
const BORDER = "#f5d6e3";

const body = {
  backgroundColor: BG_PAGE,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  margin: 0,
  padding: 0,
};

const spacer = { padding: "16px 0" };

const container = {
  margin: "0 auto",
  padding: "0 16px",
  maxWidth: 600,
};

// Header
const header = {
  backgroundColor: BG_HEADER,
  padding: "40px 24px 32px",
  borderRadius: "16px 16px 0 0",
  textAlign: "center" as const,
};

const wordmark = {
  // Fuente cursiva web-safe — la más cercana a Sacramento que se renderiza
  // de forma consistente en Gmail/Apple Mail/Outlook web.
  fontFamily:
    "'Brush Script MT', 'Snell Roundhand', 'Lucida Handwriting', cursive",
  fontSize: 56,
  fontWeight: 400,
  lineHeight: "60px",
  color: BRAND_TEXT,
  margin: 0,
  letterSpacing: 0.5,
  textAlign: "center" as const,
};

const subWordmark = {
  // Contraste con la cursiva del wordmark: sans-serif uppercase con
  // letter-spacing amplio — el patrón clásico de marca premium.
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  fontSize: 11,
  fontWeight: 700,
  lineHeight: "14px",
  letterSpacing: 3,
  textTransform: "uppercase" as const,
  color: BRAND_TEXT,
  margin: "4px 0 8px",
  textAlign: "center" as const,
};

const tagline = {
  fontSize: 10,
  letterSpacing: 2,
  textTransform: "uppercase" as const,
  color: BRAND_TEXT,
  margin: 0,
  fontWeight: 700,
  textAlign: "center" as const,
};

// Card
const card = {
  backgroundColor: BG_CARD,
  padding: "40px 32px 32px",
  borderLeft: `1px solid ${BORDER}`,
  borderRight: `1px solid ${BORDER}`,
  borderBottom: `1px solid ${BORDER}`,
};

const badge = {
  display: "inline-block",
  fontSize: 10,
  letterSpacing: 2,
  color: PRIMARY_DARK,
  margin: "0 0 12px",
  fontWeight: 700,
};

const h1 = {
  fontSize: 30,
  lineHeight: "36px",
  color: BRAND_TEXT,
  margin: "0 0 16px",
  fontWeight: 600,
};

const lead = {
  fontSize: 16,
  lineHeight: "26px",
  color: SUB,
  margin: "0 0 24px",
};

// Benefits
const benefits = {
  backgroundColor: BG_BENEFITS,
  padding: "20px 12px",
  borderRadius: 12,
  margin: "0 0 8px",
};

const benefitCol = {
  width: "33.33%",
  textAlign: "center" as const,
  padding: "0 8px",
  verticalAlign: "top" as const,
};

const benefitEmoji = {
  fontSize: 24,
  margin: "0 0 4px",
  lineHeight: "28px",
};

const benefitTitle = {
  fontSize: 12,
  fontWeight: 700,
  color: BRAND_TEXT,
  margin: "0 0 4px",
  letterSpacing: 0.2,
};

const benefitText = {
  fontSize: 11,
  lineHeight: "16px",
  color: SUB,
  margin: 0,
};

// CTA
const cta = {
  backgroundColor: PRIMARY_DARK,
  color: "#ffffff",
  padding: "14px 36px",
  borderRadius: 999,
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: 0.5,
  display: "inline-block",
  boxShadow: `0 2px 0 ${PRIMARY_DEEPER}`,
};

const fineprint = {
  fontSize: 11,
  color: MUTED,
  textAlign: "center" as const,
  margin: "16px 0 0",
};

// Footer
const footer = {
  backgroundColor: BG_FOOTER,
  padding: "28px 24px 32px",
  borderRadius: "0 0 16px 16px",
  textAlign: "center" as const,
};

const footerHeading = {
  fontSize: 10,
  letterSpacing: 2,
  textTransform: "uppercase" as const,
  color: PRIMARY_DARK,
  fontWeight: 700,
  margin: "0 0 12px",
};

const socialLink = {
  fontSize: 13,
  color: BRAND_TEXT,
  textDecoration: "none",
  fontWeight: 600,
  padding: "0 8px",
};

const socialSep = {
  color: MUTED,
  fontSize: 13,
};

const hr = {
  borderColor: BORDER,
  margin: "20px 0 16px",
};

const footerSmall = {
  fontSize: 11,
  lineHeight: "16px",
  color: MUTED,
  margin: "0 0 8px",
};

const footerCopy = {
  fontSize: 11,
  lineHeight: "14px",
  color: MUTED,
  margin: 0,
};

const inlineLink = {
  color: PRIMARY_DARK,
  textDecoration: "underline",
};
