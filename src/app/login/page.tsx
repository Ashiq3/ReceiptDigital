"use client";

import React from 'react';
import Link from 'next/link';

import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";

export default function LoginPage() {
    const [error, setError] = React.useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setError(null);
        try {
            if (!auth || !googleProvider) {
                setError("Firebase auth not initialized. Please refresh.");
                return;
            }
            await signInWithPopup(auth, googleProvider);
            window.location.href = "/";
        } catch (err: any) {
            console.error("Login failed:", err);
            setError(err.message || "Failed to login with Google");
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 bg-background font-display">
            <div className="flex w-full max-w-sm flex-col items-center">
                <div className="mb-8 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-primary text-4xl">receipt_long</span>
                    <p className="text-2xl font-bold text-text-dark">ScanFlow</p>
                </div>
                <h1 className="text-text-dark tracking-tight text-3xl font-bold leading-tight text-center">Welcome Back</h1>
                <p className="text-text-dark/80 text-base font-normal leading-normal pt-2 text-center">Sign in to manage your receipts.</p>

                {error && (
                    <div className="mt-4 w-full rounded-lg bg-red-900/30 p-3 text-sm text-red-400 text-center">
                        {error}
                    </div>
                )}

                <div className="flex w-full flex-col items-stretch gap-3 px-0 py-6">
                    <button onClick={handleGoogleLogin} className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#FFFFFF1A] text-text-dark text-base font-medium leading-normal tracking-[0.01em] border border-gray-600 w-full hover:bg-[#FFFFFF2A] transition-colors">
                        <img alt="Google G logo" className="w-5 h-5 mr-3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcp1lR1i0NSm4QZze4s96KLP1BZvLrgePkeB_Yq5vVUIbhke8jerILcWj54WOQcBSMQsaMST42rYAcSJ6INHB_v2esEW1wPV7L_LU3S-AWQ7YEkyNdmj8Piy4wTaLjXohORJtcXf35oB7MIGqY6GPCGAE8YpPj4TgackIegVYC8f6lyfAddl2KdXTnwAVf4EpukNZ_o3jIeO38tdWSaT9SwpUyuyo-wUWqfZJjIaDz81r2MpbdDxteN1cK6Fg0NxVHR_ogA3_H05zQ" />
                        <span className="truncate">Continue with Google</span>
                    </button>
                    <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#1877F2] text-white text-base font-medium leading-normal tracking-[0.01em] w-full hover:bg-[#166FE5] transition-colors">
                        <svg className="mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                        </svg>
                        <span className="truncate">Continue with Facebook</span>
                    </button>
                </div>

                <div className="flex w-full items-center gap-4 py-2">
                    <hr className="flex-grow border-gray-700" />
                    <p className="text-gray-400 text-sm font-normal leading-normal">or</p>
                    <hr className="flex-grow border-gray-700" />
                </div>

                <div className="w-full space-y-4 pt-6">
                    <div className="relative">
                        <label className="sr-only" htmlFor="email">Email</label>
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <span className="material-symbols-outlined text-gray-500 text-2xl">mail</span>
                        </div>
                        <input className="block w-full rounded-xl border-none bg-field text-text-dark py-4 pl-14 pr-4 text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary" id="email" name="email" placeholder="Email" type="email" />
                    </div>
                    <div className="relative">
                        <label className="sr-only" htmlFor="password">Password</label>
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <span className="material-symbols-outlined text-gray-500 text-2xl">lock</span>
                        </div>
                        <input className="block w-full rounded-xl border-none bg-field text-text-dark py-4 pl-14 pr-4 text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary" id="password" name="password" placeholder="Password" type="password" />
                    </div>
                </div>

                <div className="flex w-full items-center justify-between mt-4">
                    <div className="flex items-center">
                        <input className="h-4 w-4 rounded border-gray-600 bg-field text-primary focus:ring-primary ring-offset-background" id="remember-me" name="remember-me" type="checkbox" />
                        <label className="ml-2 block text-sm text-text-dark" htmlFor="remember-me">Remember Me</label>
                    </div>
                    <a className="text-sm font-medium text-primary hover:underline" href="#">Forgot Password?</a>
                </div>

                <div className="flex w-full flex-col items-stretch pt-6">
                    <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] w-full hover:bg-primary/90 transition-colors">
                        <span className="truncate">Log In</span>
                    </button>
                </div>

                <p className="text-text-dark/80 text-sm font-normal leading-normal pt-8 text-center">
                    Don't have an account? <Link className="font-bold text-primary hover:underline" href="#">Sign up</Link>
                </p>
            </div>
        </div>
    );
}
