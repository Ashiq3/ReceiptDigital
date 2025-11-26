import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.log("Demo Mode: Returning mock data");
            // Simulate processing delay
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const mockData = {
                store_name: "Demo Store (No API Key)",
                date: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
                total_amount: 42.50,
                currency: "$",
                category: "Groceries",
                items: [
                    { item_name: "Mock Item 1", price: 10.00 },
                    { item_name: "Mock Item 2", price: 32.50 }
                ]
            };

            return NextResponse.json(mockData);
        }

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString("base64");

        const prompt = `You are a data extraction assistant. Analyze the image of the receipt provided. Extract the following information and return it ONLY in JSON format:

store_name (String)
date (DD-MM-YYYY format)
total_amount (Number)
currency (Symbol like $, ৳, etc.)
category (Guess based on items e.g., Food, Electronics, Travel)
items (Array of objects with 'item_name' and 'price')

If any field is blurry or missing, use 'null'. Do not add any markdown formatting.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: file.type,
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean up the response to ensure it's valid JSON
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            const data = JSON.parse(cleanText);

            // Save to Firebase
            const docRef = await addDoc(collection(db, "receipts"), {
                ...data,
                createdAt: serverTimestamp(),
            });

            return NextResponse.json({ ...data, id: docRef.id });
        } catch (e) {
            console.error("Failed to parse JSON or save to DB:", e);
            return NextResponse.json({ error: "Failed to process receipt" }, { status: 500 });
        }

    } catch (error) {
        console.error("Error processing receipt:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
