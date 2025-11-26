"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

interface ImageUploadProps {
    onImageSelect: (file: File) => void;
    selectedImage: File | null;
    onClear: () => void;
}

export default function ImageUpload({
    onImageSelect,
    selectedImage,
    onClear,
}: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onImageSelect(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageSelect(e.target.files[0]);
        }
    };

    if (selectedImage) {
        return (
            <div className="relative w-full max-w-md mx-auto aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:bg-zinc-800 dark:border-zinc-700">
                <Image
                    src={URL.createObjectURL(selectedImage)}
                    alt="Receipt preview"
                    fill
                    className="object-contain"
                />
                <button
                    onClick={onClear}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        );
    }

    return (
        <div
            className={`relative w-full max-w-md mx-auto aspect-video rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center cursor-pointer
        ${isDragging
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 hover:border-gray-400 dark:border-zinc-700 dark:hover:border-zinc-600"
                }
      `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                <div className="p-4 rounded-full bg-gray-100 dark:bg-zinc-800">
                    <Upload size={24} />
                </div>
                <p className="text-sm font-medium">Click or drag receipt here</p>
                <p className="text-xs text-gray-400">Supports JPG, PNG</p>
            </div>
        </div>
    );
}
