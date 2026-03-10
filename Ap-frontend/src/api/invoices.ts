export interface LineItem {
    description: string;
    product_code: string | null;
    quantity: number;
    unit_price: number;
    line_total: number;
}

export interface InvoiceData {
    invoice_number: string;
    invoice_date: string;
    vendor_name: string;
    vendor_id: string;
    po_reference: string;
    currency: string;
    invoice_total: number | null;
    subtotal: number | null;
    tax_amount: number | null;
    payment_terms: string | null;
    line_items: LineItem[];
}

export interface N8NInvoiceResponse {
    success: boolean;
    popup: boolean;
    message: string;
    invoice: InvoiceData;
}

/**
 * Uploads one or more invoice files to the n8n webhook for extraction / processing.
 *
 * @param files - Array of File objects selected by the user.
 * @returns The parsed JSON response from the webhook.
 */
export async function uploadInvoices(
    files: File[]
): Promise<N8NInvoiceResponse[]> {
    const formData = new FormData();

    // The webhook might expect 'file' or 'files'
    files.forEach((file) => {
        formData.append('file', file);
    });

    const response = await fetch('https://n8n.sofiatechnology.ai/webhook/upload-invoice', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
    }

    return await response.json();
}
