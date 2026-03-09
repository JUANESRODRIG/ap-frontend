import { apiFetch } from './http';

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
    const formData = new FormData();

    files.forEach((file) => {
        formData.append('files', file);
    });

    // We call the Python backend endpoint that will
    // accept multipart/form-data and return JSON.
    return apiFetch<InvoiceExtractionResponse>('/api/invoices/extract', {
        method: 'POST',
        body: formData,
    });
}

