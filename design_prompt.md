# App Functional Specification: Smart Receipt Scanner

**Objective:** Build a mobile-first web application for small business owners to scan receipts and automatically store structured data in a database.

## Core Workflow
1.  **Landing View (Dashboard):**
    -   The user opens the app and immediately sees a **Data Grid** (Spreadsheet view) of all previously scanned receipts.
    -   Rows should be sorted by Date (newest first).
    -   Columns: Store Name, Date, Category, Total Amount.

2.  **Capture Action:**
    -   A prominent **Floating Action Button (FAB)** with a Camera icon is fixed at the bottom center of the screen.
    -   Tapping this button triggers the device's native camera input.

3.  **Processing & Storage:**
    -   Upon photo capture, the app automatically sends the image to the AI backend.
    -   **AI Extraction:** The system extracts:
        -   `store_name` (String)
        -   `date` (Date format)
        -   `total_amount` (Number)
        -   `currency` (Symbol)
        -   `category` (Enum: Food, Travel, Supplies, etc.)
        -   `items` (List of line items and prices)
    -   **Auto-Save:** The extracted data is instantly saved to the database without requiring user confirmation.

4.  **Data Management:**
    -   **Real-time Updates:** The Data Grid on the dashboard updates automatically when a new receipt is added.
    -   **Export:** A button to export the current data view to an Excel (`.xlsx`) file.

## Technical Functions Required
-   **Camera Access:** Must support `capture="environment"` to use the rear camera on mobile devices.
-   **Database Integration:** Connect to a real-time database (e.g., Firebase Firestore) for persistent storage.
-   **AI Integration:** Use a multimodal LLM (e.g., Gemini 1.5 Flash) for image-to-JSON extraction.
-   **Error Handling:**
    -   If extraction fails, allow the user to retry or manually enter data.
    -   Show a loading indicator (spinner) during the AI processing phase.

## Data Structure (Schema)
The application must handle the following data model for each receipt:
```json
{
  "id": "unique_id",
  "store_name": "Walmart",
  "date": "25-11-2025",
  "total_amount": 125.50,
  "currency": "$",
  "category": "Groceries",
  "items": [
    { "item_name": "Milk", "price": 4.50 },
    { "item_name": "Bread", "price": 2.00 }
  ],
  "createdAt": "Timestamp"
}
```
