import crypto from "crypto";

export interface CreateOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  isMock: boolean;
}

export async function createRazorpayOrder(
  amountRupees: number,
  receiptId: string
): Promise<CreateOrderResult> {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

  const amountPaise = amountRupees * 100;

  if (!keyId || !keySecret) {
    // Development fallback mock
    return {
      orderId: `order_mock_${Date.now()}`,
      amount: amountPaise,
      currency: "INR",
      keyId: "rzp_test_mockKey123",
      isMock: true,
    };
  }

  // Live Razorpay client
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Razorpay = require("razorpay");
  const instance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  const order = await instance.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: receiptId,
    notes: { service: "LIFEIFY_PREMIUM" },
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId,
    isMock: false,
  };
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    // In dev mock mode, accept mock signatures
    return signature.startsWith("mock_sig") || orderId.startsWith("order_mock_");
  }

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expected === signature;
}
