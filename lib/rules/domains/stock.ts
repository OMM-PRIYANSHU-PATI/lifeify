import { Rule } from "../engine";

export interface StockInput {
  medicineName: string;
  currentQuantity: number;
  dosesPerDay: number;
  refillThresholdDays?: number;
}

export interface StockOutput {
  daysRemaining: number;
  isLowStock: boolean;
  refillRecommended: boolean;
}

export const stockRule: Rule<StockInput, StockOutput> = {
  id: "rule_stock_v1",
  name: "Medicine Stock & Refill Calculator",
  domain: "stock",
  evaluate(input: StockInput) {
    const threshold = input.refillThresholdDays ?? 5;
    const qty = Math.max(0, input.currentQuantity);
    const daily = Math.max(1, input.dosesPerDay);

    const daysRemaining = Math.floor(qty / daily);
    const isLowStock = daysRemaining <= threshold;
    const refillRecommended = daysRemaining <= threshold;

    let explanation = `At ${daily} dose(s) per day, ${qty} units of ${input.medicineName} will last approximately ${daysRemaining} day(s).`;
    if (daysRemaining === 0) {
      explanation = `CRITICAL: ${input.medicineName} is completely out of stock.`;
    } else if (isLowStock) {
      explanation += ` Stock is below your ${threshold}-day refill threshold. Arranging a refill is recommended.`;
    }

    return {
      output: {
        daysRemaining,
        isLowStock,
        refillRecommended,
      },
      explanation,
      details: {
        currentQuantity: qty,
        dosesPerDay: daily,
        daysRemaining,
        threshold,
      },
    };
  },
};
