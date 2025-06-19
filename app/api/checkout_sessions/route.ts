import Stripe from "stripe";
import {NextRequest, NextResponse} from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-05-28.basil"
});

export const POST = async (req: NextRequest) => {
    try {
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        unit_amount: 2000,
                        product_data: {
                            name: "Single Item Purchase Test",
                            description: "This is a test product for single item purchase",
                        },
                    },
                    quantity: 1
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
        });

        return NextResponse.json({id: session.id});
    } catch (error) {
        console.error("Stripe Checkout Error: ", error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}