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

    const response = await fetch('https://n8n.sofiatechnology.ai/webhook/invoices', {
        method: 'POST',
        body: formData,

    });

    if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
    }

    return await response.json();
}

/**
 * Triggers the n8n webhook to confirm and save the invoice data.
 */
export async function confirmInvoice(): Promise<void> {
    const webhookUrl = '/n8n-api/webhook/saveinvoice';

    const response = await fetch(webhookUrl, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error(`Confirmation failed with status ${response.status}`);
    }
}
