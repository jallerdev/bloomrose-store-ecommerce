# Bloom Rose Accesorios — E-commerce

## Descripción

Tienda online de accesorios femeninos artesanales (aretes, collares, pulseras, bolsos, lentes, bufandas).
Construida con **Next.js 16 (App Router)**, **Supabase Auth (SSR)** y **Drizzle ORM** sobre PostgreSQL.

## Stack Tecnológico

| Capa        | Tecnología                                              |
| ----------- | ------------------------------------------------------- |
| Framework   | Next.js 16 (App Router, Server Components)              |
| Lenguaje    | TypeScript 5.7                                          |
| Estilos     | Tailwind CSS 3 con CSS variables HSL                    |
| Componentes | shadcn/ui (Radix primitives + `cn()` utility)           |
| Iconos      | lucide-react                                            |
| Backend     | Supabase (Postgres, SSR Auth, Storage)                  |
| ORM         | Drizzle ORM (queries relacionales anidadas)             |
| Estado      | Zustand (carrito persistente en `localStorage`)         |
| Fuentes     | DM Sans (`font-sans`) + Playfair Display (`font-serif`) |
| Package Mgr | pnpm                                                    |

## Estructura de Carpetas

```
bloomrose-ecommerce/
├── app/
│   ├── globals.css               # Tokens CSS (HSL variables)
│   ├── layout.tsx                # Root layout (fuentes, metadata)
│   ├── page.tsx                  # Home
│   ├── products/page.tsx         # Catálogo Server Component (Drizzle con variantes e imágenes)
│   ├── productos/[slug]/page.tsx # Detalle de producto con selector de variantes
│   ├── auth/
│   │   ├── login/page.tsx        # Página de login/registro (AuthForm)
│   │   ├── actions.ts            # Server Actions: loginAction, signupAction, logoutAction
│   │   └── callback/route.ts     # Callback OAuth (email confirm, etc.)
│   ├── admin/
│   │   ├── layout.tsx            # Guard de rol ADMIN via Supabase SSR
│   │   └── page.tsx              # Dashboard principal
│   ├── perfil/page.tsx           # Página de perfil protegida
│   └── checkout/page.tsx         # Checkout protegido
├── components/
│   ├── StoreHeader.tsx           # Server Component: lee sesión del server, pasa props
│   ├── StoreHeaderClient.tsx     # Client Component: UI del header (dropdown, nav)
│   ├── CartSheet.tsx             # Carrito como Drawer (Sheet de shadcn)
│   ├── AddToCartButton.tsx       # Botón de agregar al carrito (Client)
│   ├── ProductVariantSelector.tsx # Selector de variantes con RadioGroup (Client)
│   ├── ProductCard.tsx           # Card de catálogo reutilizable
│   ├── ProductFilters.tsx        # Filtros por material/precio (Client Component)
│   └── auth/
│       └── AuthForm.tsx          # Formulario Login/Registro con Tabs (Client)
├── lib/
│   ├── db/
│   │   ├── schema.ts             # Drizzle schema (tables + relations)
│   │   ├── setup.ts              # DDL script + Postgres trigger de auth
│   │   └── seed.ts               # Datos de prueba
│   ├── store/
│   │   └── cart.ts               # Zustand store del carrito
│   ├── supabase/
│   │   ├── client.ts             # Browser Singleton (createBrowserClient)
│   │   └── server.ts             # Per-request Singleton (createServerClient)
│   └── utils.ts                  # cn() helper
├── proxy.ts                      # Middleware Edge: protege /admin /perfil /checkout
└── tailwind.config.ts            # Theme extendido con tokens
```

## Paleta de Colores (CSS Variables)

Los colores se definen en `globals.css` como HSL sin `hsl()` wrapper:

| Token                | Valor (Light)   | Uso                           |
| -------------------- | --------------- | ----------------------------- |
| `--primary`          | `339 76% 75%`   | Rosa principal, CTAs, acentos |
| `--background`       | `180 60% 99%`   | Fondo general                 |
| `--foreground`       | `338 25% 16%`   | Texto principal               |
| `--card`             | `0 0% 100%`     | Fondo de tarjetas             |
| `--secondary`        | `338 67% 93%`   | Fondos suaves, badges         |
| `--muted-foreground` | `338 12% 46%`   | Texto secundario              |
| `--accent`           | `336 51% 77%`   | Hover, elementos decorativos  |
| `--border`           | `338 35% 91%`   | Bordes                        |
| `--destructive`      | `0 84.2% 60.2%` | Errores                       |

**Uso en Tailwind:** `bg-background`, `text-foreground`, `border-border`, `bg-primary`, etc.

## Convenciones de Código

1. **Componentes**: Exportación con nombre (`export function Component`), no default (excepto pages).
2. **Estilos**: Solo tokens de Tailwind (`text-foreground`, `bg-card`). Nunca colores hardcodeados.
3. **Tipografía**: `font-serif` para headings de display, `font-sans` para body.
4. **Categorías/labels**: `text-[10px] font-medium uppercase tracking-wider text-muted-foreground`.
5. **Imágenes**: Siempre `next/image` con `fill` + `sizes` + `object-cover`.
6. **Interactividad**: `cn()` para clases condicionales. `transition-*` en todo hover.
7. **Layout**: `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`.
8. **Shadcn/ui**: Usar `Button`, `Badge`, `Select`, `Slider`, `Separator`, `Label`, etc.
9. **Idioma**: UI en español. Comentarios en español.

## Rutas de Navegación

| Tab         | Ruta           |
| ----------- | -------------- |
| Logo/Home   | `/`            |
| Tienda      | `/products`    |
| Nuevos      | `/nuevos`      |
| Colecciones | `/colecciones` |
| Nosotros    | `/nosotros`    |

## Supabase & Drizzle ORM

- **Env vars**: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`. `DATABASE_URL` para Drizzle (puerto `6543` pooler).
- **Server Components / Actions**: `import { createClient } from '@/lib/supabase/server'` + `await createClient()`.
- **Client Components**: **NO** llamar a Supabase directamente para obtener datos de auth. En cambio, recibir los datos ya procesados como `props` del Server Component padre.
- **Tablas Principales**: `products` (raíz) → `product_variants` (precio, SKU, stock) + `product_images` (fotos). `profiles` (sincronizado por trigger o Server Action al registrarse). `categories`, `orders`, `order_items`, `reviews`.
- **Drizzle Relacional**: Usar `db.query.<tabla>.findMany({ with: { variants: true, images: true } })` para queries anidadas.

## Arquitectura de Auth (Patrón Clave)

> **IMPORTANTE**: El `StoreHeader` es un **Server Component**. Lee la sesión del usuario en el servidor y le pasa los datos como `props` al `StoreHeaderClient` (Client Component) para renderizar el Dropdown y el avatar. **Nunca** llames a `supabase.auth.getUser()` o `getSession()` directamente dentro de un Client Component del Header, ya que causa "locks" de token y estados de carga infinitos.

```
StoreHeader (Server) → lee sesión + perfil → StoreHeaderClient (Client) recibe {serverUser, serverRole}
```

- **Sincronización de perfil al registro**: La `signupAction` en `app/auth/actions.ts` hace un `db.insert(profiles)` con `.onConflictDoNothing()` para garantizar que el perfil exista en la DB, sin depender únicamente del trigger de PostgreSQL.
- **Roles**: La tabla `profiles` tiene un campo `role` (enum: `CUSTOMER` | `ADMIN`). El layout de `/admin` valida este rol. El header muestra el enlace "Panel Admin" solo si `serverRole === "ADMIN"`.

## Módulo de Gestión de Carrito (Zustand)

- Store en `lib/store/cart.ts`. Persiste en `localStorage` via middleware `persist`.
- `CartItem` usa `id` = `productVariantId` (UUID de la variante) como llave única. Incluye `productId`, `title`, `price`, `imageUrl`, `stock`, `quantity`, `variantName`.
- El `userId` de Supabase se inyecta al store desde `StoreHeaderClient` via `setUserId()` en un `useEffect`.
- **Anti-Hydration**: `CartSheet` retorna un `<button>` estático simple mientras `!mounted`, para evitar mismatches de Radix UI IDs entre SSR y cliente.

## Módulo de Productos Dinámicos

- Catálogo: `app/products/page.tsx` — Server Component, query Drizzle con `with: { variants, images, category }`.
- Detalle: `app/productos/[slug]/page.tsx` — Server Component, carga el producto por slug con todas sus relaciones.
- `ProductVariantSelector.tsx` — Client Component que recibe variantes como props y actualiza el precio/stock dinámicamente con `RadioGroup`. Al confirmar, llama a `AddToCartButton`.
- `AddToCartButton.tsx` — Client Component; valida stock localmente contra el store de Zustand antes de añadir.

## Patrón Anti-Hydration (Radix UI + Zustand)

Cuando un componente de Radix UI (Sheet, Dialog, DropdownMenu) se combina con estado de `localStorage` (Zustand persist), **siempre** usar el patrón:

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

if (!mounted) return <FallbackEstaticoSinRadix />;
return <ComponenteConRadixUI />;
```
