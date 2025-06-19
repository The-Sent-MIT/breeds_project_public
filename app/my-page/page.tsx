"use client"
import { redirect } from "next/navigation";
import {signOut, useSession} from "next-auth/react";
import {useEffect, useState} from "react";
import ProfileEditModal from "@/components/ProfileEditModal";
import {type Session } from "next-auth"
import {getMyProfile} from "@/actions/getMyProfile";
import { useRouter } from "next/navigation";

const SubscriptionStatus = ({session} : {session: Session}) => {
    if (session.user.subscription_status === 'basic') {
        return (
            <p>Subscription: <span className="px-2 py-1 border-blue-500 border-4 rounded-xl bg-yellow-100 text-blue-500 font-bold">Basic Plan</span></p>
        )
    } else if (session.user.subscription_status === 'premium') {
        return (
            <p>Subscription: <span className="px-2 py-1 border-purple-700 border-4 rounded-xl bg-yellow-100 text-purple-700 font-bold">Premium Plan</span></p>
        )
    } else {
        return (
            <p>Subscription: None</p>
        )
    }
}

export default function MyPage() {
    const {data: session} = useSession();
    const [profile, setProfile] = useState<Session["user"] | null>(null);
    const [loggedIn, setLoggedIn] = useState<boolean | null>(null); // null = 로딩 중
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();

    // // Update after the modal closed : session.user.* -> profile.*

    const loadProfile = async () => {
        const data = await getMyProfile();
        console.log(data.profile)
        setProfile(data.profile);
        setLoggedIn(data.loggedIn);
    };

    useEffect(() => {
        loadProfile();
    }, []);

      useEffect(() => {
        if (loggedIn === false) {
          router.replace("/login");
        }
      }, [loggedIn]);

    if (!session?.user) {
        redirect("/login");
    }

    if (loggedIn === null) return <p>Loading...</p>; // fetch 중
    if (!profile) return <p>No profile found.</p>;

    return (
        <div className="max-w-md mx-auto mt-10 space-y-3">
            <h1 className="text-2xl font-bold mb-4">My Page</h1>
            <p>Welcome, {session.user.name}.</p>
            <p>Your user ID is {session.user.id}.</p>
            <p>Your email is {session.user.email}.</p>
            <p>Your phone number is {profile.phone}.</p>
            <SubscriptionStatus session={session}/>
            <p><strong>Address:</strong></p>
            <div className="ml-4">
                <p>{profile.street}</p>
                <p>{profile.city}, {profile.state} {profile.zipcode}</p>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => router.push("/checkout")}
                    className="bg-orange-400 text-white px-4 py-2 rounded cursor-pointer"
                >
                    Purchase Test
                </button>

                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
                >
                    Edit Profile
                </button>

                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="bg-gray-700 text-white px-4 py-2 rounded cursor-pointer"
                >
                    Log out
                </button>
            </div>


            {showModal && (
                <ProfileEditModal onClose={() => setShowModal(false)} onSave={loadProfile}/>

            )}
        </div>
    );
}
