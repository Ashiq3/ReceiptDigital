"use client";

import { Camera } from "lucide-react";
import { useRef } from "react";

interface CameraFABProps {
    onCapture: (file: File) => void;
    disabled?: boolean;
}

export default function CameraFAB({ onCapture, disabled }: CameraFABProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onCapture(e.target.files[0]);
        }
    };

    return (
        <>
            <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                ref={fileInputRef}
                onChange={handleChange}
            />
            <button
                onClick={handleClick}
                disabled={disabled}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed z-50"
            >
                <Camera size={32} />
            </button>
        </>
    );
}
