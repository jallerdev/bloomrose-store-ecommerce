# Bloomrose E-commerce 🎀

Tienda online de **bisutería y accesorios** (aretes, collares, pulseras, anillos y más) enfocada al mercado colombiano. Construida sobre el stack más reciente del ecosistema React/Next para entregar una experiencia rápida, segura y escalable.

## 🚀 Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/) + React 19 + TypeScript estricto
- **Base de datos:** [Supabase](https://supabase.com/) (PostgreSQL) + [Drizzle ORM](https://orm.drizzle.team/)
- **Autenticación:** Supabase Auth (`@supabase/ssr`) con Edge Middleware
- **Estado global (carrito):** [Zustand](https://zustand-demo.pmnd.rs/) con persistencia en `localStorage`
- **UI:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix) — fonts DM Sans / Playfair Display
- **Validación:** Zod + react-hook-form
- **Pasarela de pago:** [Wompi](https://wompi.co/) (Web Checkout + webhook firmado)
- **Transportadora:** [Coordinadora](https://coordinadora.com/) (cotización + generación de guía, con fallback a tarifa plana)
- **Emails transaccionales:** [Resend](https://resend.com/) + React Email
- **Iconografía:** [Lucide React](https://lucide.dev/)
- **Hosting:** [Netlify](https://www.netlify.com/)

## ✨ Funcionalidades

### Storefront
- **Catálogo dinámico (SSR)** con filtros por material y precio.
- **Detalle de producto** rico: galería, breadcrumb, selector de variantes con stock por opción, cantidad, wishlist, compartir, pills de confianza (envío gratis / devoluciones / garantía / pago seguro), tabs de descripción/especificaciones/cuidados/envíos, **sección de reseñas** con calificación promedio, distribución por estrellas y formulario para clientes autenticados, y productos relacionados de la misma categoría.
- **Carrito persistente** con validación de stock en tiempo real, soporte de variantes (Oro 18k, Plata 925, etc.) y drawer lateral.
- **ProductCard enriquecida**: precio en COP, badge de descuento automático, stock bajo (`¡Solo quedan 3!`), pill de envío gratis, conteo de variantes y estado "Agotado".

### Cuenta de usuario
- Registro / login con Supabase Auth.
- Perfil con configuración personal.
- **Mis pedidos** — listado e historial completo con detalle por pedido y tracking.

### Checkout & pago
- Formulario de envío con selector de direcciones guardadas + opción de nueva dirección.
- **Snapshot inmutable** de dirección y precios al momento del pedido.
- **Reserva transaccional de stock** al crear el pedido (`PENDING`).
- Redirección a **Wompi Web Checkout** para tarjetas, PSE, Nequi y Bancolombia.
- **Webhook firmado (HMAC SHA256)** que actualiza el estado del pedido y restaura stock si el pago falla.

### Envíos (Coordinadora)
- Cotización dinámica por ciudad/peso/dimensiones.
- Generación automática de guía desde el panel admin.
- **Fallback a tarifa plana** cuando las credenciales no están configuradas (no bloquea el checkout durante el onboarding comercial).

### Emails (Resend + React Email)
- Bienvenida al registrarse.
- Confirmación de pago con resumen del pedido.
- Notificación de envío con número de guía.

### Admin
- Dashboard con métricas básicas.
- CRUD completo de productos, variantes, categorías y clientes.
- **Gestión de pedidos**: cambio de estado, registro manual de tracking, generación de guía Coordinadora, reenvío de emails.
- Roles `ADMIN` / `CUSTOMER` con doble guard (middleware + layout).

## ⚙️ Setup local

### 1. Clonar e instalar

```bash
git clone <repository-url>
cd bloomrose-ecommerce
pnpm install
```

### 2. Variables de entorno

```bash
cp .env.local.example .env.local
```

Variables mínimas para correr el catálogo (ver `.env.local.example` para todas):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=         # Session Pooler de Supabase, puerto 6543
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Para activar pagos, envíos y emails se requieren además:

- **Wompi:** `WOMPI_PUBLIC_KEY`, `WOMPI_PRIVATE_KEY`, `WOMPI_INTEGRITY_SECRET`, `WOMPI_EVENTS_SECRET`
- **Coordinadora (opcional):** `COORDINADORA_API_KEY`, `COORDINADORA_NIT`, `COORDINADORA_ID_CLIENTE`
- **Resend:** `RESEND_API_KEY`, `EMAIL_FROM`

### 3. Esquema y datos de prueba

Aplicar migraciones a Supabase:

```bash
pnpm exec tsx scripts/apply-migration.ts supabase/migrations/<archivo>.sql
```

Sembrar 14 productos / 29 variantes con datos completos (precios COP, peso, dimensiones, descuentos):

```bash
pnpm exec tsx lib/db/seed.ts
```

### 4. Servidor de desarrollo

```bash
pnpm dev
```

Disponible en `http://localhost:3000`.

## 🔌 Webhooks en local

Para probar el webhook de Wompi (`/api/wompi/webhook`) desde localhost necesitas exponer el puerto con HTTPS:

```bash
# con cloudflared
cloudflared tunnel --url http://localhost:3000

# o con ngrok
ngrok http 3000
```

Registra la URL pública resultante en el panel de Wompi para el evento `transaction.updated`.

## 📂 Estructura

```
app/
  page.tsx                       Home
  productos/                     Catálogo + detalle
  checkout/                      Checkout + página de pago Wompi
  api/wompi/webhook/             Webhook de pagos
  perfil/                        Área de usuario (config + pedidos)
  admin/                         Panel administrativo (productos, categorías, pedidos, clientes)
  auth/                          Login / signup
components/
  ProductCard.tsx                Card enriquecida (descuento, stock, variantes, envío gratis)
  CartSheet.tsx                  Drawer del carrito
  StoreHeader[Client].tsx        Header con split server/client (anti auth-locks)
  OrderStatusBadge.tsx           Badge de estado de pedido
  ui/                            shadcn/ui (Radix)
lib/
  db/                            Drizzle: schema, cliente, seed
  store/cart.ts                  Zustand
  supabase/                      Clientes server/client
  wompi/                         Firma de integridad + verificación de webhook
  coordinadora/                  Cotización + creación de guía + fallback
  shipping/                      Tarifa plana de respaldo
  email/                         Resend + plantillas React Email
scripts/
  apply-migration.ts             Aplicador de migraciones idempotente
  verify-schema.ts               Verifica columnas en la DB
supabase/
  migrations/                    SQL generado por drizzle-kit
middleware.ts                    Edge — protege /admin, /perfil, /checkout
```

## 📝 Convenciones

- **Server / Client split del header:** la sesión se lee en `StoreHeader` (Server) y se pasa por props a `StoreHeaderClient`. **Nunca** llamar a `auth.getUser()` desde un Client Component del header — produce auth locks.
- **Anti-hydration:** componentes con `localStorage` (carrito) o portales Radix usan el patrón `mounted` con `useEffect` antes de renderizar.
- **Snapshot inmutable** en pedidos: dirección de envío y precios se copian al `order` para que el historial sobreviva si el cliente borra direcciones o cambian precios.
- **Validación servidor-side:** stocks, precios y descuentos siempre se re-validan en el Server Action — el carrito del cliente no es fuente de verdad.
- **Idioma:** UI 100% en español (mercado Colombia).

## 🤝 Documentación adicional

- `CLAUDE.md` — guía de arquitectura y convenciones del repo.
- `PLAN.md` — diagnóstico y hoja de ruta priorizada.
