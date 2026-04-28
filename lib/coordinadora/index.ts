/**
 * Cliente para la API de Coordinadora.
 *
 * Coordinadora ofrece un API REST/SOAP que requiere convenio comercial
 * (NIT + ID Cliente + usuario + clave). Mientras se completa el onboarding,
 * usamos un fallback con tarifas planas para no bloquear el checkout.
 *
 * Cuando las credenciales estén configuradas, las funciones `quote` y
 * `createGuide` llamarán al API real automáticamente.
 *
 * Doc oficial: https://coordinadora.com (sección Integraciones)
 */

import { estimateShippingCost } from "@/lib/shipping";

// ─────────────────────────────────────────────────────────────────
// Configuración
// ─────────────────────────────────────────────────────────────────

const COORDINADORA_API_URL =
  process.env.COORDINADORA_API_URL ?? "https://api.coordinadora.com/api/v2";

function isConfigured(): boolean {
  return Boolean(
    process.env.COORDINADORA_API_KEY &&
      process.env.COORDINADORA_NIT &&
      process.env.COORDINADORA_ID_CLIENTE,
  );
}

// ─────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────

export interface ShippingPackage {
  /** Peso total en gramos */
  weightGrams: number;
  /** Largo total en cm */
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  /** Valor declarado en COP (para seguro). */
  declaredValue: number;
}

export interface QuoteParams {
  originCity: string;
  originDepartment: string;
  destinationCity: string;
  destinationDepartment: string;
  package: ShippingPackage;
  /** Subtotal del pedido — usado para cálculo de envío gratis en fallback. */
  subtotal: number;
}

export interface QuoteResult {
  cost: number;
  /** ETA en días hábiles. */
  estimatedDays?: number;
  /** "coordinadora" | "flat-rate-fallback" */
  source: "coordinadora" | "flat-rate-fallback";
}

export interface CreateGuideParams {
  orderId: string;
  paymentReference: string;
  recipient: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    department: string;
    postalCode?: string | null;
  };
  package: ShippingPackage;
}

export interface CreateGuideResult {
  trackingNumber: string;
  labelUrl?: string;
}

// ─────────────────────────────────────────────────────────────────
// Origen (bodega): leer de env vars
// ─────────────────────────────────────────────────────────────────

const ORIGIN = {
  city: process.env.COORDINADORA_ORIGIN_CITY ?? "Bogota",
  department: process.env.COORDINADORA_ORIGIN_DEPARTMENT ?? "Cundinamarca",
};

// ─────────────────────────────────────────────────────────────────
// Cotización
// ─────────────────────────────────────────────────────────────────

/**
 * Cotiza el envío contra Coordinadora. Si el API no está configurado,
 * cae al cálculo de tarifa plana (`lib/shipping`).
 */
export async function quote(params: QuoteParams): Promise<QuoteResult> {
  if (!isConfigured()) {
    return {
      cost: estimateShippingCost({
        city: params.destinationCity,
        subtotal: params.subtotal,
      }),
      source: "flat-rate-fallback",
    };
  }

  try {
    const res = await fetch(`${COORDINADORA_API_URL}/cotizador`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.COORDINADORA_API_KEY}`,
      },
      body: JSON.stringify({
        nit: process.env.COORDINADORA_NIT,
        idCliente: process.env.COORDINADORA_ID_CLIENTE,
        origen: { ciudad: ORIGIN.city, departamento: ORIGIN.department },
        destino: {
          ciudad: params.destinationCity,
          departamento: params.destinationDepartment,
        },
        paquete: {
          peso: params.package.weightGrams / 1000, // kg
          largo: params.package.lengthCm,
          ancho: params.package.widthCm,
          alto: params.package.heightCm,
          valorDeclarado: params.package.declaredValue,
        },
      }),
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`Coordinadora ${res.status}`);
    const data = (await res.json()) as {
      flete: number;
      tiempoEntrega?: number;
    };

    return {
      cost: data.flete,
      estimatedDays: data.tiempoEntrega,
      source: "coordinadora",
    };
  } catch (err) {
    console.error("[coordinadora.quote] fallback to flat rate:", err);
    return {
      cost: estimateShippingCost({
        city: params.destinationCity,
        subtotal: params.subtotal,
      }),
      source: "flat-rate-fallback",
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// Creación de guía
// ─────────────────────────────────────────────────────────────────

/**
 * Genera la guía de envío en Coordinadora. Lanza si no está configurado
 * o si la API falla — el admin debe poder reintentarlo o registrar el
 * tracking manualmente.
 */
export async function createGuide(
  params: CreateGuideParams,
): Promise<CreateGuideResult> {
  if (!isConfigured()) {
    throw new Error(
      "Coordinadora no está configurada. Registra el tracking manualmente.",
    );
  }

  const res = await fetch(`${COORDINADORA_API_URL}/guia`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.COORDINADORA_API_KEY}`,
    },
    body: JSON.stringify({
      nit: process.env.COORDINADORA_NIT,
      idCliente: process.env.COORDINADORA_ID_CLIENTE,
      referencia: params.paymentReference,
      origen: { ciudad: ORIGIN.city, departamento: ORIGIN.department },
      destino: {
        nombre: params.recipient.fullName,
        telefono: params.recipient.phone,
        direccion: [
          params.recipient.addressLine1,
          params.recipient.addressLine2,
        ]
          .filter(Boolean)
          .join(", "),
        ciudad: params.recipient.city,
        departamento: params.recipient.department,
        codigoPostal: params.recipient.postalCode,
      },
      paquete: {
        peso: params.package.weightGrams / 1000,
        largo: params.package.lengthCm,
        ancho: params.package.widthCm,
        alto: params.package.heightCm,
        valorDeclarado: params.package.declaredValue,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Coordinadora guía ${res.status}: ${text}`);
  }

  const data = (await res.json()) as {
    numeroGuia: string;
    urlRotulo?: string;
  };

  return {
    trackingNumber: data.numeroGuia,
    labelUrl: data.urlRotulo,
  };
}
