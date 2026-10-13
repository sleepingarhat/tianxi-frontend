import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";

let _supabase: ReturnType<typeof createClient> | null = null;
function db() {
  if (!_supabase) _supabase = createClient(process.env['SUPABASE_URL']!, process.env['SUPABASE_SERVICE_ROLE_KEY']!);
  return _supabase as any;
}

const iso = (s?: number | null) => (s ? new Date(s * 1000).toISOString() : null);

function fields(subscription: any) {
  const item = subscription.items?.data?.[0];
  return {
    price_id: item?.price?.lookup_key || item?.price?.metadata?.lovable_external_id || item?.price?.id,
    product_id: typeof item?.price?.product === "string" ? item.price.product : item?.price?.product?.id,
    current_period_start: iso(item?.current_period_start ?? subscription.current_period_start),
    current_period_end: iso(item?.current_period_end ?? subscription.current_period_end),
  };
}

async function upsertSub(subscription: any, env: StripeEnv) {
  const userId = subscription.metadata?.userId;
  if (!userId) { console.error("No userId in subscription metadata"); return; }
  await db().from("subscriptions").upsert({
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id,
    ...fields(subscription),
    status: subscription.status,
    cancel_at_period_end: subscription.cancel_at_period_end || false,
    environment: env,
    updated_at: new Date().toISOString(),
  }, { onConflict: "stripe_subscription_id" });
}

async function handle(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);
  const obj = event.data.object;
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await upsertSub(obj, env);
      break;
    case "customer.subscription.deleted":
      await db().from("subscriptions").update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", obj.id).eq("environment", env);
      break;
    case "invoice.payment_failed": {
      // 用戶規則：扣款失敗即時停權
      const subId = obj.parent?.subscription_details?.subscription ?? obj.subscription;
      if (subId) await db().from("subscriptions").update({ status: "past_due", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", subId).eq("environment", env);
      break;
    }
    default:
      console.log("Unhandled event:", event.type);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") return Response.json({ received: true, ignored: "invalid env" });
        try {
          await handle(request, rawEnv);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
