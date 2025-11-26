"use client";

import { useEffect, useState } from "react";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
// Removed unused date-fns import

interface Receipt {
    id: string;
    store_name: string;
    date: string;
    total_amount: number;
    currency: string;
    category: string;
    createdAt: any;
}

export default function ReceiptList() {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isFirebaseConfigured()) {
            const q = query(collection(db, "receipts"), orderBy("createdAt", "desc"));
            const unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    const data = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as Receipt[];
                    setReceipts(data);
                    setLoading(false);
                },
                (error) => {
                    console.error("Error fetching receipts:", error);
                    setLoading(false);
                }
            );
            return () => unsubscribe();
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

            // Listen for custom event to update list
            window.addEventListener("receipts-updated", loadLocalReceipts);
            return () => window.removeEventListener("receipts-updated", loadLocalReceipts);
        }
    }, []);

    if (loading) {
        return (
            <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (receipts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                <p>No receipts yet.</p>
                <p className="text-sm">Tap the camera to scan one.</p>
            </div>
        );
    }

    return (
        <div className="pb-24">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-zinc-900 sticky top-0">
                        <tr>
                            <th className="px-4 py-3">Store</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {receipts.map((receipt) => (
                            <tr key={receipt.id} className="bg-white dark:bg-black">
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                    {receipt.store_name}
                                </td>
                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    {receipt.date}
                                </td>
                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    {receipt.category}
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                    {receipt.currency} {receipt.total_amount}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
