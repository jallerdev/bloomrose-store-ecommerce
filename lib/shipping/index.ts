// Cálculo provisional de envío. Será reemplazado por la API de Coordinadora.
// Tarifa plana por ciudad para no bloquear el checkout mientras integramos.

const FLAT_RATES: Record<string, number> = {
  bogota: 15000,
  medellin: 18000,
  cali: 18000,
  barranquilla: 20000,
  cartagena: 20000,
};

const DEFAULT_RATE = 22000;
const FREE_SHIPPING_THRESHOLD = 200000;

function normalizeCity(city: string): string {
  return city
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export function estimateShippingCost(params: {
  city: string;
  subtotal: number;
}): number {
  if (params.subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  const key = normalizeCity(params.city);
  return FLAT_RATES[key] ?? DEFAULT_RATE;
}
