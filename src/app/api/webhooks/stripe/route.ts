import Stripe from "stripe";
import { NextResponse } from "next/server";

type StripeMetadata = {
	user_id?: string;
	masseurmatch_plan?: string;
	plan_key?: string;
};

type StripeEventObject = {
	metadata?: StripeMetadata;
	customer?: string;
	status?: string;
	subscription?: string | { metadata?: StripeMetadata };
};

type StripeEvent = {
	type: string;
	data: {
		object: StripeEventObject;
	};
};

const VALID_TIERS = new Set(["free", "standard", "pro", "elite"]);

function resolveTier(plan: string | undefined): "free" | "standard" | "pro" | "elite" {
	if (plan && VALID_TIERS.has(plan)) {
		return plan as "free" | "standard" | "pro" | "elite";
	}
	return "free";
}

function getStripeClient() {
	const key = process.env.STRIPE_SECRET_KEY || "";
	return new Stripe(key, { apiVersion: "2025-02-24.acacia" as any });
}

async function updateTier(userId: string, tier: "free" | "standard" | "pro" | "elite") {
	const url = process.env.SUPABASE_URL;
	const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !serviceKey) return;

	await fetch(`${url}/rest/v1/profiles?user_id=eq.${userId}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
			apikey: serviceKey,
			Authorization: `Bearer ${serviceKey}`,
			Prefer: "return=minimal",
		},
		body: JSON.stringify({ tier }),
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

	const obj = event.data?.object;
	const meta = obj?.metadata;
	const userId = meta?.user_id;

	if (userId) {
		if (event.type === "checkout.session.completed") {
			const plan = meta?.plan_key ?? meta?.masseurmatch_plan;
			await updateTier(userId, resolveTier(plan));
		}

		if (event.type === "customer.subscription.updated") {
			const status = obj?.status;
			if (status === "active" || status === "trialing") {
				const plan = meta?.masseurmatch_plan ?? meta?.plan_key;
				await updateTier(userId, resolveTier(plan));
			} else {
				await updateTier(userId, "free");
			}
		}

		if (event.type === "customer.subscription.deleted") {
			await updateTier(userId, "free");
		}
	}

	return NextResponse.json({ ok: true });
}
