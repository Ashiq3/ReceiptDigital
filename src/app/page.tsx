"use client";

import CameraFAB from "@/components/CameraFAB";
import ReceiptList from "@/components/ReceiptList";
import { isFirebaseConfigured } from "@/lib/firebase";
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
                throw new Error("Failed to scan");
            }

            const data = await response.json();

            if (!isFirebaseConfigured()) {
                // Save to Local Storage
                const saved = localStorage.getItem("receipts");
                const receipts = saved ? JSON.parse(saved) : [];
                const newReceipt = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
                localStorage.setItem("receipts", JSON.stringify([newReceipt, ...receipts]));

                // Trigger update
                window.dispatchEvent(new Event("receipts-updated"));
            }
            // If Firebase is configured, the listener in ReceiptList handles it
        } catch (error) {
            console.error("Scan failed:", error);
            alert("Failed to scan receipt. Please try again.");
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
