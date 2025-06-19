import Stripe from "stripe";
import {NextRequest, NextResponse} from "next/server";
import {authOptions} from "@/pages/api/auth/[...nextauth]";
import {getServerSession} from "next-auth/next";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-05-28.basil",
});

export const POST = async (req: NextRequest) => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { plan } = await req.json();

        let priceId: string | undefined;

        if (plan === "basic") {
            priceId = process.env.STRIPE_BASIC_PRICE_ID;
        } else if (plan === "premium") {
            priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
        }

        if (!priceId) {
            return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
        }

        const customer = await stripe.customers.create({
            email: session.user.email,
            metadata: {
                profile_id: session.user.id.toString(), // 문자열로 변환
            },
        });

        const checkoutSession = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            customer: customer.id,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL!}/checkout/success`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL!}/checkout/cancel`,
        });

        return NextResponse.json({ id: checkoutSession.id }, { status: 200 });
    } catch (err) {
        console.error("Stripe error:", err);
        return NextResponse.json(
            { error: (err as Error).message },
            { status: 500 }
        );
    }
};
