/**
 * Normalizes incoming clinical & health metric units into canonical SI/standard units
 */
export function normalizeMetricValue(
  metricType: string,
  value: number | string,
  unit?: string
): { normalizedValue: number | string; normalizedUnit: string } {
  if (typeof value === "string") {
    return { normalizedValue: value, normalizedUnit: unit || "text" };
  }

  const cleanUnit = (unit || "").toLowerCase().trim();
  const num = Number(value);

  switch (metricType) {
    case "weight":
    case "body_mass":
      if (cleanUnit === "lbs" || cleanUnit === "pound" || cleanUnit === "pounds") {
        return { normalizedValue: Number((num * 0.453592).toFixed(2)), normalizedUnit: "kg" };
      }
      return { normalizedValue: num, normalizedUnit: "kg" };

    case "height":
      if (cleanUnit === "in" || cleanUnit === "inch" || cleanUnit === "inches") {
        return { normalizedValue: Number((num * 2.54).toFixed(1)), normalizedUnit: "cm" };
      }
      if (cleanUnit === "m" || cleanUnit === "meter") {
        return { normalizedValue: Number((num * 100).toFixed(1)), normalizedUnit: "cm" };
      }
      return { normalizedValue: num, normalizedUnit: "cm" };

    case "blood_glucose":
    case "glucose":
      // mmol/L to mg/dL: multiply by 18.0182
      if (cleanUnit === "mmol/l" || cleanUnit === "mmol") {
        return { normalizedValue: Number((num * 18.0182).toFixed(0)), normalizedUnit: "mg/dL" };
      }
      return { normalizedValue: num, normalizedUnit: "mg/dL" };

    case "hydration":
    case "water":
      if (cleanUnit === "oz" || cleanUnit === "fl oz") {
        return { normalizedValue: Number((num * 29.5735).toFixed(0)), normalizedUnit: "mL" };
      }
      if (cleanUnit === "l" || cleanUnit === "liters" || cleanUnit === "liter") {
        return { normalizedValue: Number((num * 1000).toFixed(0)), normalizedUnit: "mL" };
      }
      return { normalizedValue: num, normalizedUnit: "mL" };

    case "temperature":
      if (cleanUnit === "c" || cleanUnit === "celsius" || num < 45) {
        return { normalizedValue: Number(((num * 9) / 5 + 32).toFixed(1)), normalizedUnit: "°F" };
      }
      return { normalizedValue: num, normalizedUnit: "°F" };

    default:
      return { normalizedValue: num, normalizedUnit: unit || "count" };
  }
}

export const normalizer = {
  normalize(metricType: string, value: number | string, unit?: string) {
    const res = normalizeMetricValue(metricType, value, unit);
    return {
      value: res.normalizedValue,
      unit: res.normalizedUnit
    };
  }
};
