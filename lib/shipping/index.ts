// Tarifas de envío desde Turbaco (Bolívar) para paquete pequeño (~1 kg).
// Basadas en Interrapidísimo 2025-2026 y rangos de mercado ecommerce CO.
// Se reemplazará por la cotización real de la API de la transportadora cuando
// estén las credenciales.

const FLAT_RATES: Record<string, number> = {
  // Local (Bolívar)
  turbaco: 6000,
  cartagena: 9000,
  arjona: 9000,
  "el carmen de bolivar": 12000,
  magangue: 14000,

  // Costa Caribe (regional)
  barranquilla: 11000,
  "santa marta": 13000,
  sincelejo: 12000,
  monteria: 14000,
  valledupar: 14000,
  riohacha: 16000,
  "san andres": 28000,

  // Capitales principales
  bogota: 14000,
  medellin: 14000,
  cali: 15000,

  // Eje cafetero / intermedias
  bucaramanga: 15000,
  pereira: 16000,
  manizales: 16000,
  armenia: 16000,
  ibague: 16000,
  cucuta: 17000,
  neiva: 17000,
  villavicencio: 17000,
  tunja: 17000,
  popayan: 18000,
  pasto: 20000,
  quibdo: 22000,
  florencia: 22000,
  mocoa: 24000,
  yopal: 18000,
  arauca: 24000,
  leticia: 35000,
  mitu: 35000,
  "puerto carreno": 28000,
  inirida: 35000,
};

const DEFAULT_RATE = 22000;
const FREE_SHIPPING_THRESHOLD = 200000;

function normalizeCity(city: string): string {
  return city
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
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

export const FREE_SHIPPING_THRESHOLD_COP = FREE_SHIPPING_THRESHOLD;
