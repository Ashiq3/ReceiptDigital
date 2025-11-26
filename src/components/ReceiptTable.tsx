"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

interface ReceiptItem {
    item_name: string;
    price: number;
}

interface ReceiptData {
    store_name: string;
    date: string;
    total_amount: number;
    currency: string;
    category: string;
    items: ReceiptItem[];
}

interface ReceiptTableProps {
    data: ReceiptData;
}

export default function ReceiptTable({ data }: ReceiptTableProps) {
    const handleExport = () => {
        const flattenData = data.items.map((item) => ({
            Store: data.store_name,
            Date: data.date,
            Category: data.category,
            Item: item.item_name,
            Price: item.price,
            Currency: data.currency,
            Total: data.total_amount,
        }));

        const ws = XLSX.utils.json_to_sheet(flattenData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Receipt Data");
        XLSX.writeFile(wb, `receipt_${data.date || "scan"}.xlsx`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mx-auto mt-8 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden"
        >
            <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {data.store_name || "Unknown Store"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {data.date} • {data.category}
                    </p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    <Download size={16} />
                    Export Excel
                </button>
            </div>

            <div className="p-6">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-zinc-800/50">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">Item</th>
                            <th className="px-4 py-3 text-right rounded-r-lg">Price</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {data.items?.map((item, index) => (
                            <tr key={index}>
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-200">
                                    {item.item_name}
                                </td>
                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                                    {data.currency} {item.price}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="border-t border-gray-200 dark:border-zinc-800">
                        <tr>
                            <td className="px-4 py-4 font-bold text-gray-900 dark:text-white">
                                Total
                            </td>
                            <td className="px-4 py-4 text-right font-bold text-gray-900 dark:text-white">
                                {data.currency} {data.total_amount}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </motion.div>
    );
}
