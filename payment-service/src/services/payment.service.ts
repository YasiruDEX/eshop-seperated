import Stripe from "stripe";
import { PrismaClient } from "../../../../generated/prisma-payment";

const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export interface CreatePaymentSessionParams {
  orderId: string;
  amount: number;
  currency?: string;
  customerEmail?: string;
  customerName?: string;
  sellerId?: string;
  metadata?: Record<string, any>;
}

export const createPaymentSession = async (
  params: CreatePaymentSessionParams
) => {
  const {
    orderId,
    amount,
    currency = "usd",
    customerEmail,
    customerName,
    sellerId,
    metadata = {},
  } = params;

  // Check if order already exists
  const existingOrder = await prisma.orders.findUnique({
    where: { orderId },
  });

  if (existingOrder && existingOrder.status === "paid") {
    throw new Error("Order is already paid");
  }

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: `Order ${orderId}`,
            description: `Payment for order ${orderId}`,
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${
      process.env.FRONTEND_SUCCESS_URL ||
      process.env.PAYMENT_SUCCESS_URL ||
      "http://localhost:3000/payment-success"
    }?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
    cancel_url: `${
      process.env.FRONTEND_CANCEL_URL ||
      process.env.PAYMENT_CANCEL_URL ||
      "http://localhost:3000/cart"
    }?order_id=${orderId}`,
    customer_email: customerEmail,
    metadata: {
      orderId,
      sellerId: sellerId || "",
      ...metadata,
    },
  });

  // Create or update order in database
  const orderData = {
    orderId,
    amount,
    currency,
    status: "pending",
    stripeSessionId: session.id,
    customerEmail,
    customerName,
    sellerId,
    metadata: metadata as any,
  };

  if (existingOrder) {
    await prisma.orders.update({
      where: { id: existingOrder.id },
      data: orderData,
    });
  } else {
    await prisma.orders.create({
      data: orderData,
    });
  }

  return {
    sessionId: session.id,
    sessionUrl: session.url,
    orderId,
  };
};

export const handleWebhook = async (signature: string, payload: Buffer) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn(
      "⚠️  Stripe webhook secret not configured, skipping signature verification"
    );
  }

  let event: Stripe.Event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } else {
      // For development without webhook secret
      event = JSON.parse(payload.toString());
    }
  } catch (err: any) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(session);
      break;

    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentIntentSucceeded(paymentIntent);
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      await handlePaymentIntentFailed(failedPayment);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return { received: true };
};

const handleCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session
) => {
  console.log("✅ Checkout session completed:", session.id);

  const orderId = session.metadata?.orderId;
  if (!orderId) {
    console.error("No orderId in session metadata");
    return;
  }

  const order = await prisma.orders.findUnique({
    where: { orderId },
  });

  if (!order) {
    console.error(`Order not found: ${orderId}`);
    return;
  }

  await prisma.orders.update({
    where: { id: order.id },
    data: {
      status: "paid",
      paidAt: new Date(),
      stripePaymentIntent: session.payment_intent as string,
    },
  });

  console.log(`✅ Order ${orderId} marked as paid`);
};

const handlePaymentIntentSucceeded = async (
  paymentIntent: Stripe.PaymentIntent
) => {
  console.log("✅ Payment intent succeeded:", paymentIntent.id);

  // Update order status if we can find it by payment intent
  const order = await prisma.orders.findFirst({
    where: { stripePaymentIntent: paymentIntent.id },
  });

  if (order && order.status !== "paid") {
    await prisma.orders.update({
      where: { id: order.id },
      data: {
        status: "paid",
        paidAt: new Date(),
      },
    });
    console.log(`✅ Order ${order.orderId} marked as paid via payment intent`);
  }
};

const handlePaymentIntentFailed = async (
  paymentIntent: Stripe.PaymentIntent
) => {
  console.log("❌ Payment intent failed:", paymentIntent.id);

  const order = await prisma.orders.findFirst({
    where: { stripePaymentIntent: paymentIntent.id },
  });

  if (order) {
    await prisma.orders.update({
      where: { id: order.id },
      data: {
        status: "failed",
      },
    });
    console.log(`❌ Order ${order.orderId} marked as failed`);
  }
};

export const getOrderPaymentStatus = async (orderId: string) => {
  const order = await prisma.orders.findUnique({
    where: { orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
};

export const verifyPaymentSession = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const order = await prisma.orders.findUnique({
    where: { stripeSessionId: sessionId },
  });

  if (!order) {
    throw new Error("Order not found for this session");
  }

  // Update order if payment was successful but not yet recorded
  if (session.payment_status === "paid" && order.status !== "paid") {
    await prisma.orders.update({
      where: { id: order.id },
      data: {
        status: "paid",
        paidAt: new Date(),
        stripePaymentIntent: session.payment_intent as string,
      },
    });
  }

  return {
    order,
    session,
    isPaid: session.payment_status === "paid",
  };
};
