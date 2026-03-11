import type { N8NInvoiceResponse } from '../types/invoice';

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

    const response = await fetch('/n8n-api/webhook-test/upload-invoices', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
    }

    return await response.json();
}
