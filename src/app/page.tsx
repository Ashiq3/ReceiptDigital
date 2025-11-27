"use client";

import CameraFAB from "@/components/CameraFAB";
import ReceiptList from "@/components/ReceiptList";
import { isFirebaseConfigured, auth } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { Scan, Loader2 } from "lucide-react";

export default function Home() {
    const [processing, setProcessing] = useState(false);
    const [installPrompt, setInstallPrompt] = useState<any>(null);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setInstallPrompt(e);
        };
        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstall = () => {
        if (installPrompt) {
            installPrompt.prompt();
            setInstallPrompt(null);
        }
    };

    const saveToLocalStorage = (data: any) => {
        const saved = localStorage.getItem("receipts");
        const receipts = saved ? JSON.parse(saved) : [];
        const newReceipt = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
        localStorage.setItem("receipts", JSON.stringify([newReceipt, ...receipts]));
        window.dispatchEvent(new Event("receipts-updated"));
    };

    const handleCapture = async (file: File) => {
        setProcessing(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/scan", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to scan");
            }

            const data = await response.json();

            // Check if user is logged in and Firebase is configured
            if (isFirebaseConfigured() && auth?.currentUser) {
                try {
                    const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
                    const { db } = await import("@/lib/firebase");

                    await addDoc(collection(db, "receipts"), {
                        ...data,
                        uid: auth.currentUser.uid, // Associate with user
                        createdAt: serverTimestamp(),
                    });
                } catch (e) {
                    console.error("Error saving to Firestore:", e);
                    alert("Scanned successfully, but failed to save to cloud. Saving locally instead.");
                    // Fallback to local storage
                    saveToLocalStorage(data);
                }
            } else {
                // Save to Local Storage (Not logged in or no Firebase)
                saveToLocalStorage(data);
            }
        } catch (error) {
            console.error("Scan failed:", error);
            alert(`Failed to scan receipt: ${error instanceof Error ? error.message : "Please try again."}`);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <main className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
            {/* Mobile Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800 px-4 h-14 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-600 rounded-md text-white">
                        <Scan size={16} />
                    </div>
                    <span className="font-bold text-lg">ReceiptAI</span>
                </div>
                <div className="flex items-center gap-3">
                    <a href="/login" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                        Login
                    </a>
                    {installPrompt && (
                        <button
                            onClick={handleInstall}
                            className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium"
                        >
                            Install App
                        </button>
                    )}
                    {processing && (
                        <div className="flex items-center gap-2 text-sm text-blue-600 font-medium animate-pulse">
                            <Loader2 size={14} className="animate-spin" />
                            Processing...
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content - Data Grid */}
            <ReceiptList />

            {/* Floating Action Button */}
            <CameraFAB onCapture={handleCapture} disabled={processing} />
        </main>
    );
}
