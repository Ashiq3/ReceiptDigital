
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
            <header className="flex items-center justify-between border-b border-white/5 bg-background/80 backdrop-blur-xl p-4 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary ring-1 ring-white/10">
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
                {/* Spending Overview */}
                <section className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-surface/50 p-5 shadow-xl backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-text-main">Spending Overview</h2>
                            <p className="text-sm text-text-muted">Last 4 Weeks</p>
                        </div>
                        <div className="flex items-center gap-1 rounded-full border border-white/5 bg-black/20 p-1 text-xs">
                            <button className="rounded-full bg-primary px-3 py-1 font-semibold text-white shadow-lg shadow-primary/20">Weekly</button>
                            <button className="rounded-full px-3 py-1 font-medium text-text-muted hover:text-text-main transition-colors">Monthly</button>
                        </div>
                    </div>
                    <div className="grid min-h-[180px] grid-flow-col items-end justify-items-center gap-4 border-t border-white/5 pt-6">
                        <div className="flex h-full w-full flex-col items-center justify-end gap-2 group">
                            <div className="w-full rounded-t-lg bg-gradient-to-t from-primary/5 to-primary/20 transition-all group-hover:from-primary/10 group-hover:to-primary/30" style={{ height: "60%" }}></div>
                            <p className="text-xs font-medium text-text-muted">W1</p>
                        </div>
                        <div className="flex h-full w-full flex-col items-center justify-end gap-2 group">
                            <div className="relative w-full rounded-t-lg bg-gradient-to-t from-primary to-secondary shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] transition-all group-hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.6)]" style={{ height: "95%" }}>
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-black shadow-xl animate-bounce-slight">
                                    $412
                                    <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-white"></div>
                                </div>
                            </div>
                            <p className="text-xs font-bold text-primary">W2</p>
                        </div>
                        <div className="flex h-full w-full flex-col items-center justify-end gap-2 group">
                            <div className="w-full rounded-t-lg bg-gradient-to-t from-primary/5 to-primary/20 transition-all group-hover:from-primary/10 group-hover:to-primary/30" style={{ height: "75%" }}></div>
                            <p className="text-xs font-medium text-text-muted">W3</p>
                        </div>
                        <div className="flex h-full w-full flex-col items-center justify-end gap-2 group">
                            <div className="w-full rounded-t-lg bg-gradient-to-t from-primary/5 to-primary/20 transition-all group-hover:from-primary/10 group-hover:to-primary/30" style={{ height: "85%" }}></div>
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
                                    className="group flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-surface/40 p-4 shadow-sm backdrop-blur-sm cursor-pointer transition-all hover:bg-surface/60 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99]"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white/5 to-white/10 ring-1 ring-white/5 group-hover:from-primary/10 group-hover:to-secondary/10 group-hover:ring-primary/20 transition-all">
                                            <span className="material-symbols-outlined text-text-muted group-hover:text-primary transition-colors">{getCategoryIcon(receipt.category)}</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-text-main group-hover:text-primary transition-colors">{receipt.store_name || "Unknown Store"}</p>
                                            <p className="text-xs font-medium text-text-muted">{receipt.date || "No Date"}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-text-main">{receipt.currency || "$"} {receipt.total_amount?.toFixed(2) || "0.00"}</p>
                                        <p className="text-xs text-text-muted">{receipt.items?.length || 0} items</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>

            <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
                <button
                    onClick={triggerCamera}
                    className="group flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-[0_0_40px_-10px_rgba(59,130,246,0.6)] transition-all hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(59,130,246,0.8)] active:scale-95"
                >
                    <span className="material-symbols-outlined text-4xl group-hover:rotate-12 transition-transform duration-300" style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>photo_camera</span>
                    <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all"></div>
                </button>
            </div>
        </div>
    );
}
