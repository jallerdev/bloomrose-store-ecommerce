# Bloom Rose E-commerce 🎀

Una plataforma de comercio electrónico moderna, elegante y de alto rendimiento diseñada específicamente para la venta de accesorios femeninos (aretes, collares, pulseras). Construida con las últimas tecnologías del ecosistema moderno de React para ofrecer una experiencia interactiva veloz y escalable.

## 🚀 Stack Tecnológico

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Base de Datos & Backend:** [Supabase](https://supabase.com/) (PostgreSQL)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Autenticación:** [Auth0 v4](https://auth0.com/) (Server-side Session Management)
- **Estado Global (Carrito):** [Zustand](https://zustand-demo.pmnd.rs/) (con persistencia en LocalStorage)
- **UI & Estilos:** [Tailwind CSS](https://tailwindcss.com/) + Componentes base de [shadcn/ui](https://ui.shadcn.com/)
- **Iconografía:** [Lucide React](https://lucide.dev/)

## ✨ Características Principales

1. **Catálogo y Rutas Dinámicas (SSR):**
   Las páginas detalladas de productos (`/productos/[slug]`) se renderizan directamente en el servidor (_Server-Side Rendering_) haciendo fetch de la DB, lo cual garantiza una carga inmediata y un SEO impecable.
2. **Carrito de Compras Persistente & Interactivo:**
   Estado global manejado con Zustand. Soporta validación de inventario en tiempo real, suma de sub-variantes individuales (ej. Color Dorado vs Plata) y guardado en `localStorage` impidiendo la pérdida del carrito al recargar. Almacenado estéticamente dentro de una barra lateral deslizable (_Sheet_).

3. **Panel Administrativo Protegido:**
   Un dashboard interno bajo el path `/admin/*` para gestionar productos y categorías. Protegido rigurosamente con Auth0 middleware (`proxy.ts`), impidiendo el acceso a personal no autorizado.

4. **Autenticación Impecable Integrada:**
   Flujo de Login y sincronización de perfiles gestionado mediante las API's seguras lado-servidor de `@auth0/nextjs-auth0`.

## ⚙️ Configuración y Desarrollo Local

### 1. Clonar e Instalar

Clona el repositorio e instala las dependencias utilizando tu gestor de paquetes favorito:

```bash
git clone <url-del-repositorio>
cd bloomrose-ecommerce
pnpm install
# o npm install / yarn install
```

### 2. Variables de Entorno

Copia el archivo de ejemplo y configura tus credenciales locales en `.env.local`:

```bash
cp .env.local.example .env.local
```

> **Nota de Base de Datos:** Asegúrate de usar el puerto **5432 (Session Pooler)** de Supabase en el `DATABASE_URL` para que Drizzle pueda realizar introspección libremente sin bloqueos transaccionales de red.

### 3. Migración de Esquemas (Drizzle)

Sincroniza la tabla de base de datos desde los modelos en `/lib/db/schema.ts` hacia tu base de datos configurada:

```bash
npx drizzle-kit push
```

### 4. Lanzar Servidor de Desarrollo

```bash
pnpm dev
```

Inicia el entorno en `http://localhost:3000`.

## 📂 Estructura del Proyecto

- `/app` — Enrutamiento del App Router, layouts, páginas y proxy de Next.js 16.
- `/components` — Elementos atómicos y funcionales de UI construidos sobre Radix y Tailwind.
- `/lib/db` — Esquemas de Drizzle ORM y singleton del conector PostgreSQL.
- `/lib/store` — Centralización de Lógica de Negocio y Data-Stores (ej. Cart de Zustand).
- `/public` — Recursos estáticos, imágenes default e íconos.

## 🤝 Soporte y Contribución

Para nuevas implementaciones, por favor consulta la arquitectura base descrita dentro de `agents.md` la cual dicta todas las reglas de patrones de diseño de interacción de UI, SSR y persistencia vigentes en la plataforma.
