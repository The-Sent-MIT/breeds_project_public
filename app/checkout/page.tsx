'use client';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        setLoading(true);
        const res = await axios.post('/api/checkout_sessions')
        const data = res.data;

        const stripe = await stripePromise;
        if (stripe) {
            await stripe.redirectToCheckout({ sessionId: data.id });
        }
        setLoading(false);
    };

    const handleSubscribe = async (plan: 'basic' | 'premium') => {
        setLoading(true);
        const res = await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan }),
        });

        const data = await res.json();

        const stripe = await stripePromise;
        if (stripe) {
            await stripe.redirectToCheckout({ sessionId: data.id });
        }

        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto mt-10 space-y-3 min-h-[800px]">
            {/* <div>
                <h1>Stripe 단품 결제</h1>
                <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-800"
                >
                    {loading ? 'Loading...' : 'Purchase ($20)'}
                </button>
            </div> */}

            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold">구독 플랜 선택</h1>
                <div className="flex justify-center gap-6 mt-6">
                    <button
                        onClick={() => handleSubscribe('basic')}
                        disabled={loading}
                        className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-800"
                    >
                        Basic 구독 ($5/월)
                    </button>
                    <button
                        onClick={() => handleSubscribe('premium')}
                        disabled={loading}
                        className="bg-purple-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-purple-800"
                    >
                        Premium 구독 ($10/월)
                    </button>
                </div>
            </div>
        </div>
    )

}