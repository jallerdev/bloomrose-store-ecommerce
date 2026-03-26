import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  // Las variables como APP_BASE_URL, AUTH0_DOMAIN, AUTH0_CLIENT_ID son tomadas automáticamente del .env.local
  // si usas los nombres por defecto de la v4 de Auth0 (ej. APP_BASE_URL en lugar de AUTH0_BASE_URL)
});
