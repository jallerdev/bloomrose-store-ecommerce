# Bloom Rose Accesorios — E-commerce

## Descripción

Tienda online de accesorios femeninos artesanales (aretes, collares, pulseras, bolsos, lentes, bufandas).
Construida con **Next.js 16 (App Router)** y conectada a **Supabase** como backend.

## Stack Tecnológico

| Capa        | Tecnología                                              |
| ----------- | ------------------------------------------------------- |
| Framework   | Next.js 16 (App Router, Server Components)              |
| Lenguaje    | TypeScript 5.7                                          |
| Estilos     | Tailwind CSS 3 con CSS variables HSL                    |
| Componentes | shadcn/ui (Radix primitives + `cn()` utility)           |
| Iconos      | lucide-react                                            |
| Backend     | Supabase (Postgres, Auth, Storage)                      |
| Fuentes     | DM Sans (`font-sans`) + Playfair Display (`font-serif`) |
| Package Mgr | pnpm                                                    |

## Estructura de Carpetas

```
bloomrose-ecommerce/
├── app/
│   ├── globals.css          # Tokens CSS (HSL variables)
│   ├── layout.tsx           # Root layout (fuentes, metadata)
│   ├── page.tsx             # Home
│   ├── products/page.tsx    # Catálogo con filtros (Server Component + Supabase)
│   ├── nuevos/page.tsx      # Nuevos lanzamientos
│   ├── colecciones/page.tsx # Colecciones temáticas
│   └── nosotros/page.tsx    # Sobre nosotros
├── components/
│   ├── StoreHeader.tsx      # Header con navegación
│   ├── ProductCard.tsx      # Card de producto reutilizable
│   ├── ProductFilters.tsx   # Filtros por material/precio (Client Component)
│   ├── ProductInfo.tsx      # Detalle de producto
│   ├── ProductImageGallery.tsx
│   ├── RelatedProducts.tsx
│   └── ui/                  # shadcn/ui components (50+)
├── lib/
│   ├── utils.ts             # cn() helper (clsx + tailwind-merge)
│   └── supabase/
│       ├── client.ts        # Browser Singleton (createBrowserClient)
│       └── server.ts        # Per-request Singleton (createServerClient + React cache)
├── types/
│   └── supabase.ts          # DB types (products, categories)
├── public/
│   ├── images/              # Imágenes de productos hero
│   └── products/            # Imágenes de catálogo
└── tailwind.config.ts       # Theme extendido con tokens
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
2. **Estilos**: Solo tokens de Tailwind (`text-foreground`, `bg-card`). Nunca colores hardcodeados como `bg-blue-500`.
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

## Supabase

- **Env vars**: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`.
- **Server Components**: Usar `import { createClient } from '@/lib/supabase/server'` + `await createClient()`.
- **Client Components**: Usar `import { createClient } from '@/lib/supabase/client'` + `createClient()`.
- **Tablas**: `products` (id, title, slug, price, image_url, category_id, material, stock, is_active), `categories` (id, name, slug, description).

## Responsabilidades Técnicas

### Módulo de Productos Dinámicos

- Crear y gestionar la carpeta de enrutamiento dinámico en Next.js (App Router): `app/productos/[id]/page.tsx` (o su equivalente `products`).
- Implementar **Server Components** en esta página para hacer _fetching_ de los datos del producto directamente desde Supabase utilizando el ID o SLUG proporcionado en la URL.
- La UI de la página de detalles (`ProductClientComponent`) debe incluir obligatoriamente:
  - Un carrusel de imágenes de alta calidad (específico para accesorios).
  - Nombre del producto, descripción detallada y precio claramente visible.
  - Selector de cantidad y variantes (si aplica, ej: talla de anillo).
  - Botón interactivo de 'Agregar al Carrito'.

### Módulo de Gestión de Carrito (Zustand)

- Configurar e implementar un store de estado global utilizando **Zustand**.
- El store debe definir acciones claras: `addItem` (añadir ítem), `removeItem` (eliminar ítem), `updateQuantity` (actualizar cantidad) y `clearCart` (vaciar carrito).
- Cada ítem en el carrito debe incluir al mínimo: `productId`, `name`, `price`, `quantity`, `imageUrl` y detalles de la variante seleccionada.
- Asegurar la **persistencia** del carrito en `localStorage` utilizando el middleware `persist` de Zustand para que el estado no se pierda al recargar la página.

### Patrón de Programación - Interacción UI/Carrito (Hydration)

- Implementar patrones rigurosos para evitar errores de _hydration mismatch_ al usar `localStorage` en el entorno SSR de Next.js.
- Utilizar un componente envoltorio (_wrapper_) o un hook personalizado (ej. montando un estado con `useEffect`) que espere activamente a que el cliente se cargue por completo antes de renderizar los detalles UI del carrito o sus contadores.

### Patrón de Programación - Validación de Stock

- La acción 'Agregar al Carrito' debe cruzar datos y validar el stock disponible en la base de datos de Supabase _antes_ de sumarlo o incrementar la cantidad en el carrito local.
- Proporcionar **retroalimentación visual** responsiva e inmediata al usuario (ej. toast/notificación de error) si no hay stock suficiente o el carrito ya alcanzó el tope de inventario de esa pieza.
