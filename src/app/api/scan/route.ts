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
            return NextResponse.json(
                { error: "Server Configuration Error: GEMINI_API_KEY is missing. Please check your .env.local file." },
                { status: 500 }
            );
        }

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        console.log("Processing image with Gemini...");

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64Image = buffer.toString("base64");

            const prompt = `You are an advanced AI data extraction assistant. Your task is to analyze the provided image and extract key information into a structured JSON format. 
            
The image could be a receipt, an invoice, a bill, a ticket, or any document with financial or transaction details.

Please extract the following fields:
- store_name: The name of the merchant, store, or entity issuing the document.
- date: The date of the transaction in DD-MM-YYYY format.
- total_amount: The final total amount paid or due (number only).
- currency: The currency symbol (e.g., $, €, £, ৳).
- category: A smart categorization of the transaction (e.g., Groceries, Dining, Travel, Utilities, Electronics, Healthcare, etc.).
- items: An array of purchased items, where each item has:
    - item_name: Description of the item.
    - price: The price of the item (number).

If the document is NOT a receipt or financial document, try to extract whatever relevant data fits these fields best, or return null for specific fields if they truly don't apply.
If a field is missing or illegible, set it to null. 
Return ONLY raw JSON. Do not include markdown formatting like \`\`\`json.`;

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
            console.log("Gemini Response:", text);

            // Clean up the response to ensure it's valid JSON
            const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();

            const data = JSON.parse(cleanText);

            // Return the extracted data to the client
            return NextResponse.json(data);
        } catch (geminiError) {
            console.error("Gemini API Error:", geminiError);
            return NextResponse.json({
                error: `Gemini API Error: ${geminiError instanceof Error ? geminiError.message : String(geminiError)}`
            }, { status: 500 });
        }

    } catch (error) {
        console.error("Error processing receipt:", error);
        return NextResponse.json(
            { error: `Internal server error: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 }
        );
    }
}
