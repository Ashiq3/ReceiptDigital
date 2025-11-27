
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isFirebaseConfigured, auth } from "@/lib/firebase";

export default function ScanPage() {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [flashOn, setFlashOn] = useState(false);

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Could not access camera. Please allow camera permissions.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const toggleFlash = async () => {
        if (!stream) return;
        const track = stream.getVideoTracks()[0];
        try {
            await track.applyConstraints({
                advanced: [{ torch: !flashOn } as any]
            });
            setFlashOn(!flashOn);
        } catch (err) {
            console.error("Flash not supported", err);
        }
    };

    const captureImage = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (context) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                if (blob) {
                    handleScan(new File([blob], "receipt.jpg", { type: "image/jpeg" }));
                }
            }, "image/jpeg", 0.8);
        }
    };

    const handleScan = async (file: File) => {
        setAnalyzing(true);
        setError(null);

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

            // Save logic (similar to dashboard)
            if (isFirebaseConfigured() && auth?.currentUser) {
                try {
                    const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
                    const { db } = await import("@/lib/firebase");
                    await addDoc(collection(db, "receipts"), {
                        ...data,
                        uid: auth.currentUser.uid,
                        createdAt: serverTimestamp(),
                    });
                } catch (e) {
                    console.error("Firestore error", e);
                    saveToLocalStorage(data);
                }
            } else {
                saveToLocalStorage(data);
            }

            // Success - go back to dashboard
            router.push("/");

        } catch (err) {
            console.error("Scan error:", err);
            setError(err instanceof Error ? err.message : "We couldn't read the receipt clearly. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    const saveToLocalStorage = (data: any) => {
        const saved = localStorage.getItem("receipts");
        const receipts = saved ? JSON.parse(saved) : [];
        const newReceipt = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
        localStorage.setItem("receipts", JSON.stringify([newReceipt, ...receipts]));
        window.dispatchEvent(new Event("receipts-updated"));
    };

    return (
        <div className="relative mx-auto flex h-screen w-full flex-col bg-[#121212] overflow-hidden font-sans">
            {/* Camera View */}
            <div className="absolute inset-0 z-0 flex h-full w-full flex-col">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="h-full w-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* UI Overlay */}
            <div className="relative z-10 flex h-full flex-col justify-between">
                <header className="flex items-center p-4">
                    <button
                        onClick={() => router.back()}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                    <div className="flex-1"></div>
                    <button
                        onClick={toggleFlash}
                        className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm ${flashOn ? 'text-yellow-400' : ''}`}
                    >
                        <span className="material-symbols-outlined text-2xl">flash_on</span>
                    </button>
                </header>

                <main className="flex flex-1 flex-col items-center justify-center p-4">
                    <div className="h-full w-full max-w-xs rounded-xl border-2 border-dashed border-white/70"></div>
                    <p className="mt-4 text-center text-sm font-medium text-white">Position receipt within the frame</p>
                </main>

                <footer className="p-6">
                    <div className="flex items-center justify-center">
                        <button
                            onClick={captureImage}
                            className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-white/30 p-1 backdrop-blur-sm"
                        >
                            <div className="h-full w-full rounded-full bg-white"></div>
                        </button>
                    </div>
                </footer>
            </div>

            {/* Analyzing Overlay */}
            {analyzing && (
                <div className="absolute inset-0 z-20 flex h-full w-full flex-col items-center justify-center bg-black/70 p-8 backdrop-blur-md">
                    <div className="flex h-16 w-16 animate-spin items-center justify-center rounded-full border-4 border-t-[#4A90E2] border-white/30"></div>
                    <h2 className="mt-6 text-xl font-bold text-[#FFFFFF]">Analyzing your receipt...</h2>
                    <p className="mt-2 text-center text-[#8E8E93]">Our AI is reading the details. This will only take a moment.</p>
                </div>
            )}

            {/* Error Overlay */}
            {error && (
                <div className="absolute inset-0 z-30 flex h-full w-full flex-col items-center justify-center bg-black/70 p-8 backdrop-blur-md">
                    <div className="flex w-full max-w-sm flex-col items-center rounded-xl bg-[#1C1C1E] p-6 text-center shadow-lg">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D0021B]/20 text-[#D0021B]">
                            <span className="material-symbols-outlined text-4xl">error</span>
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-[#FFFFFF]">Scan Unsuccessful</h2>
                        <p className="mt-2 text-[#8E8E93]">{error}</p>
                        <div className="mt-6 flex w-full flex-col gap-3">
                            <button
                                onClick={() => setError(null)}
                                className="flex h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-[#4A90E2] text-base font-bold text-white"
                            >
                                Retry Scan
                            </button>
                            <button
                                onClick={() => router.push("/")}
                                className="flex h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-white/10 text-base font-bold text-white/90"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
