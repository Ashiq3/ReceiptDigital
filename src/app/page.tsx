
"use client";

import { useState, useEffect } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReceiptModal from "@/components/ReceiptModal";

interface Receipt {
    id: string;
    store_name: string;
    date: string;
    total_amount: number;
    currency: string;
    category: string;
    items?: { item_name: string; price: number }[];
    createdAt: any;
}

export default function Dashboard() {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const router = useRouter();

    // PWA Install Prompt
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

    // Data Fetching
    useEffect(() => {
        if (isFirebaseConfigured()) {
            const { db, auth } = require("@/lib/firebase"); // Lazy load db and auth
            const { onAuthStateChanged } = require("firebase/auth");

            const unsubscribeAuth = onAuthStateChanged(auth, (user: any) => {
                if (!user) {
                    router.push("/login");
                } else {
                    const q = query(collection(db, "receipts"), orderBy("createdAt", "desc"));
                    const unsubscribeSnapshot = onSnapshot(
                        q,
                        (snapshot: any) => {
                            const data = snapshot.docs.map((doc: any) => ({
                                id: doc.id,
                                ...doc.data(),
                            })) as Receipt[];
                            setReceipts(data);
                            setLoading(false);
                        },
                        (error: any) => {
                            console.error("Error fetching receipts:", error);
                            setLoading(false);
                        }
                    );
                    return () => unsubscribeSnapshot();
                }
            });
            return () => unsubscribeAuth();
        } else {
            // Local Storage Mode
            const loadLocalReceipts = () => {
                const saved = localStorage.getItem("receipts");
                if (saved) {
                    setReceipts(JSON.parse(saved));
                }
                setLoading(false);
            };

            loadLocalReceipts();
            window.addEventListener("receipts-updated", loadLocalReceipts);
            return () => window.removeEventListener("receipts-updated", loadLocalReceipts);
        }
    }, []);

    const triggerCamera = () => {
        router.push("/scan");
    };

    const getCategoryIcon = (category: string) => {
        const map: Record<string, string> = {
            food: "restaurant",
            dining: "restaurant",
            groceries: "storefront",
            retail: "shopping_bag",
            gas: "local_gas_station",
            transport: "directions_car",
            utilities: "bolt",
            entertainment: "movie",
            health: "medical_services",
            travel: "flight",
        };
        return map[category?.toLowerCase()] || "receipt_long";
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background text-text-main font-sans">
            <header className="flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md p-4 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <span className="material-symbols-outlined text-2xl">receipt_long</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-text-main">Receipts</h1>
                </div>
                <div className="flex gap-2">
                    {installPrompt && (
                        <button
                            onClick={handleInstall}
                            className="flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-main/90 shadow-sm transition-colors hover:bg-border"
                        >
                            <span>Install App</span>
                        </button>
                    )}
                    <button className="flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-main/90 shadow-sm transition-colors hover:bg-border">
                        <span className="material-symbols-outlined text-base">ios_share</span>
                        <span>Export</span>
                    </button>
                </div>
            </header>

            <main className="flex flex-col gap-8 p-4 pb-28">
                {/* Spending Overview - Static for now as per design */}
                <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-text-main">Spending Overview</h2>
                            <p className="text-sm text-text-muted">Last 4 Weeks</p>
                        </div>
                        <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1 text-xs">
                            <button className="rounded-full bg-primary px-3 py-1 font-semibold text-white">Weekly</button>
                            <button className="rounded-full px-3 py-1 font-medium text-text-muted">Monthly</button>
                        </div>
                    </div>
                    <div className="grid min-h-[180px] grid-flow-col items-end justify-items-center gap-4 border-t border-border pt-4">
                        <div className="flex h-full w-full flex-col items-center justify-end gap-2">
                            <div className="w-full rounded-t-lg bg-primary/20" style={{ height: "60%" }}></div>
                            <p className="text-xs font-medium text-text-muted">W1</p>
                        </div>
                        <div className="flex h-full w-full flex-col items-center justify-end gap-2">
                            <div className="relative w-full rounded-t-lg bg-primary" style={{ height: "95%" }}>
                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-md bg-white px-2 py-1 text-xs font-bold text-black shadow-lg">$412</div>
                                <div className="absolute bottom-full left-1/2 h-2 w-px -translate-x-1/2 bg-white/50"></div>
                            </div>
                            <p className="text-xs font-bold text-primary">W2</p>
                        </div>
                        <div className="flex h-full w-full flex-col items-center justify-end gap-2">
                            <div className="w-full rounded-t-lg bg-primary/20" style={{ height: "75%" }}></div>
                            <p className="text-xs font-medium text-text-muted">W3</p>
                        </div>
                        <div className="flex h-full w-full flex-col items-center justify-end gap-2">
                            <div className="w-full rounded-t-lg bg-primary/20" style={{ height: "85%" }}></div>
                            <p className="text-xs font-medium text-text-muted">W4</p>
                        </div>
                    </div>
                </section>

                <section className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-lg font-semibold tracking-tight text-text-main">Recent Receipts</h2>
                        <Link className="text-sm font-semibold text-primary" href="#">View All</Link>
                    </div>
                    <div className="flex flex-col gap-3">
                        {loading ? (
                            <div className="text-center text-text-muted py-8">Loading receipts...</div>
                        ) : receipts.length === 0 ? (
                            <div className="text-center text-text-muted py-8">No receipts yet. Tap the camera to scan!</div>
                        ) : (
                            receipts.map((receipt) => (
                                <div
                                    key={receipt.id}
                                    onClick={() => setSelectedReceipt(receipt)}
                                    className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-3 shadow-sm cursor-pointer transition-colors hover:bg-border/50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background">
                                            <span className="material-symbols-outlined text-text-muted">{getCategoryIcon(receipt.category)}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-text-main">{receipt.store_name || "Unknown Store"}</p>
                                            <p className="text-sm text-text-muted">{receipt.date || "No Date"}</p>
                                        </div>
                                    </div>
                                    <p className="font-semibold text-text-main">{receipt.currency || "$"} {receipt.total_amount?.toFixed(2) || "0.00"}</p>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>

            <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
                <button
                    onClick={triggerCamera}
                    className="flex size-16 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30 transition-transform active:scale-95"
                >
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}>photo_camera</span>
                </button>
            </div>
        </div>
    );
}
