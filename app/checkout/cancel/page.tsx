'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CancelPage() {
    const router = useRouter();

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.push('/');
        }, 5000);

        return () => clearTimeout(timeout);
    }, [router]);

    return (
        <div className="p-8 text-center">
            <h1 className="text-2xl font-bold text-green-600">❌ Your purchase has been canceled.</h1>
            <p className="mt-4">There was a problem with the payment process or your order was cancelled.</p>
            <p className="mt-2 text-gray-500">Return to the main page in 5 seconds...</p>
        </div>
    );
}
