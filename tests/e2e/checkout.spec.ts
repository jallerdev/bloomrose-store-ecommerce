import { test, expect } from "@playwright/test";

/**
 * Pruebas del flujo guest checkout. Asumen que existe al menos un producto
 * activo y con stock en la DB de prueba.
 *
 * No completamos el pago real con Wompi: validamos que llegamos a la página
 * `/checkout/pago/[orderId]` (que es donde se redirige después de crear la
 * orden pendiente).
 */
test.describe("Checkout guest", () => {
  test("agregar producto al carrito y llegar a la página de pago", async ({
    page,
  }) => {
    await page.goto("/productos");

    // Tomamos el primer producto con link visible y vamos al PDP.
    const firstProductLink = page
      .locator('a[href^="/productos/"]')
      .filter({ hasNotText: "Explorar" })
      .first();
    await firstProductLink.scrollIntoViewIfNeeded();
    await firstProductLink.click();

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const addToCart = page.getByRole("button", { name: /añadir al carrito/i });
    await addToCart.click();

    // Vamos directo a /checkout (carrito persistido en localStorage).
    await page.goto("/checkout");

    // Llenar contacto guest
    await page.getByLabel(/email/i).first().fill("guest+e2e@bloomrose.test");
    await page.getByLabel(/nombre completo/i).fill("Guest E2E");
    await page.getByLabel(/teléfono/i).fill("3001234567");

    // Dirección nueva
    await page.getByLabel(/dirección.*1/i).fill("Calle 100 #10-10");
    await page.getByLabel(/ciudad/i).fill("Bogotá");
    await page.getByLabel(/departamento/i).fill("Cundinamarca");

    await page.getByRole("button", { name: /confirmar y pagar/i }).click();

    await page.waitForURL(/\/checkout\/pago\//, { timeout: 30_000 });
    await expect(page.getByText(/confirmación de pago/i)).toBeVisible();
  });

  test("aplicar cupón inválido muestra error", async ({ page }) => {
    await page.goto("/productos");
    const firstProductLink = page
      .locator('a[href^="/productos/"]')
      .filter({ hasNotText: "Explorar" })
      .first();
    await firstProductLink.click();
    await page.getByRole("button", { name: /añadir al carrito/i }).click();

    await page.goto("/checkout");
    await page
      .getByPlaceholder(/código de descuento/i)
      .fill("CUPON-NO-EXISTE");
    // El handler "Apply" se dispara con Enter
    await page.getByPlaceholder(/código de descuento/i).press("Enter");

    // Toast de error debe aparecer
    await expect(page.getByText(/no.*existe|inválido|expirado/i)).toBeVisible({
      timeout: 5_000,
    });
  });
});
