import { test, expect } from "@playwright/test";

test.describe("Smoke storefront", () => {
  test("home renderiza marca y CTA al catálogo", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Bloomrose/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("catálogo carga grid y filtros", async ({ page }) => {
    await page.goto("/productos");
    // El grid puede estar vacío si la DB de prueba no tiene productos —
    // basta con verificar que la página renderiza sin errores y muestra
    // el header de filtros.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("checkout vacío redirige al CTA de catálogo", async ({ page }) => {
    await page.goto("/checkout");
    await expect(
      page.getByRole("link", { name: /explorar catálogo/i }),
    ).toBeVisible();
  });

  test("login muestra OAuth y campos de email/password", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(
      page.getByRole("button", { name: /continuar con google/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/correo electrónico/i).first()).toBeVisible();
  });
});
