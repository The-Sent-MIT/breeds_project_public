import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import {supabase} from "@/lib/supabaseClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-05-28.basil',
});

export async function POST(req: NextRequest) {
    const body = await req.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        return NextResponse.json({ error: `Webhook Error: ${err}` }, { status: 400 });
    }

    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0].price.id;

        const customer = await stripe.customers.retrieve(customerId);
        const profileId = (customer as Stripe.Customer).metadata?.profile_id;

        console.log(customer)

        if (!profileId) {
            console.error('❌ profile_id not found in customer metadata');
            return NextResponse.json({ error: 'No profile_id found' }, { status: 400 });
        }

        let status: string = 'canceled';
        if (subscription.status === 'active' || subscription.status === 'trialing') {
            if (priceId === process.env.STRIPE_BASIC_PRICE_ID) {
                status = 'basic';
            } else if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
                status = 'premium';
            }
        }

        const { error } = await supabase
            .from('profiles')
            .update({ subscription_status: status })
            .eq('id', profileId);

        if (error) {
            console.error('❌ Supabase update failed:', error.message);
        }
    }

    return NextResponse.json({ received: true });
}
