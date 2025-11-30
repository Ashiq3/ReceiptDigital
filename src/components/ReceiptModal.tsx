"use client";

import { useEffect, useState } from "react";

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

interface ReceiptModalProps {
    receipt: Receipt | null;
    onClose: () => void;
}

export default function ReceiptModal({ receipt, onClose }: ReceiptModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (receipt) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [receipt]);

    if (!receipt) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-surface border border-border shadow-2xl transition-all">
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-text-main">Receipt Details</h3>
                        <button onClick={onClose} className="rounded-full p-1 text-text-muted hover:bg-white/10 hover:text-text-main">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="mt-4 flex flex-col items-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background border border-border shadow-inner">
                            <span className="material-symbols-outlined text-3xl text-primary">receipt_long</span>
                        </div>
                        <h2 className="mt-3 text-2xl font-bold text-text-main">{receipt.store_name || "Unknown Store"}</h2>
                        <p className="text-text-muted">{receipt.date || "No Date"}</p>
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex items-center justify-between rounded-xl bg-background p-4 border border-border">
                        <span className="text-text-muted">Total Amount</span>
                        <span className="text-2xl font-bold text-primary">{receipt.currency || "$"} {receipt.total_amount?.toFixed(2) || "0.00"}</span>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Category</p>
                            <p className="mt-1 font-medium text-text-main flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">label</span>
                                {receipt.category || "Uncategorized"}
                            </p>
                        </div>

                        {receipt.items && receipt.items.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Items</p>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                    {receipt.items.map((item, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <span className="text-text-main">{item.item_name}</span>
                                            <span className="text-text-muted">{receipt.currency}{item.price?.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-transform active:scale-95">
                            Edit
                        </button>
                        <button className="flex-1 rounded-xl border border-border bg-background py-3 text-sm font-bold text-text-main transition-colors hover:bg-border">
                            Share
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
