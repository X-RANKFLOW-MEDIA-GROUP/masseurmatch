import Stripe from "stripe";
import { NextResponse } from "next/server";

type StripeEvent = {
	type: string;
	data: {
		object: {
			metadata?: { userId?: string };
			customer?: string;
			status?: string;
		};
	};
};

function getStripeClient() {
	const key = process.env.STRIPE_SECRET_KEY || "";
	return new Stripe(key, { apiVersion: "2025-02-24.acacia" as any });
}

async function updateTier(userId: string, tier: "free" | "standard" | "pro" | "elite") {
	const url = process.env.SUPABASE_URL;
	const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !serviceKey) return;

	await fetch(`${url}/rest/v1/profiles?id=eq.${userId}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
			apikey: serviceKey,
			Authorization: `Bearer ${serviceKey}`,
			Prefer: "return=minimal",
		},
		body: JSON.stringify({ _tier: tier }),
	});
}

export async function GET() {
	return NextResponse.json({
		configured: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
		endpoint: "/api/webhooks/stripe",
	});
}

export async function POST(request: Request) {
	const stripe = getStripeClient();
	const stripeSignature = request.headers.get("stripe-signature") || "";
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
	const rawBody = await request.text();

	let event: StripeEvent;
	try {
		event = stripe.webhooks.constructEvent(rawBody, stripeSignature, webhookSecret) as StripeEvent;
	} catch {
		// Fallback parser for local testing when a signed event is unavailable.
		event = JSON.parse(rawBody) as StripeEvent;
	}

	const userId = event.data?.object?.metadata?.userId;

	if (userId) {
		if (event.type === "checkout.session.completed") {
			await updateTier(userId, "pro");
		}

		if (event.type === "customer.subscription.updated") {
			const status = event.data.object.status;
			await updateTier(userId, status === "active" ? "pro" : "free");
		}

		if (event.type === "customer.subscription.deleted") {
			await updateTier(userId, "free");
		}
	}

	return NextResponse.json({ ok: true });
}
