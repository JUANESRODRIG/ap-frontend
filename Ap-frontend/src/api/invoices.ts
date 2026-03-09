import { apiFetch } from './http';

<<<<<<< HEAD
export interface ParsedInvoice {
    date?: string;
    total?: number;
    vendor?: string;
    [key: string]: unknown;
}

export interface InvoiceResult {
    filename: string;
    rawText: string;
    parsed: ParsedInvoice;
}

export interface InvoiceExtractionResponse {
    invoices: InvoiceResult[];
}
export async function uploadInvoices(
    files: File[]
): Promise<InvoiceExtractionResponse> {
=======
/**
 * Uploads one or more invoice files to the backend for extraction / processing.
 *
 * @param files - Array of File objects selected by the user.
 * @returns The parsed JSON response from the API.
 */
export async function uploadInvoices(files: File[]): Promise<unknown> {
>>>>>>> ea2487e84586f7918406edea334248618d9b68ca
    const formData = new FormData();

    files.forEach((file) => {
        formData.append('files', file);
    });

<<<<<<< HEAD
    // We call the Python backend endpoint that will
    // accept multipart/form-data and return JSON.
    return apiFetch<InvoiceExtractionResponse>('/api/invoices/extract', {
        method: 'POST',
        body: formData,
    });
}

=======
    return apiFetch('/api/invoices/upload', {
        method: 'POST',
        body: formData,
        // Do NOT set Content-Type — the browser will set it automatically
        // with the correct multipart boundary.
    });
}
>>>>>>> ea2487e84586f7918406edea334248618d9b68ca
