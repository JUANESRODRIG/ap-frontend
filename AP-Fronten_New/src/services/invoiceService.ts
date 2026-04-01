import type { WebhookResponse, Company } from '../types/invoice';

/**
 * Uploads one or more invoice files to the n8n webhook for extraction / processing.
 *
 * @param files - Array of File objects selected by the user.
 * @param company - The selected company object.
 * @returns The parsed and normalised webhook response.
 */
export async function uploadInvoices(
    files: File[],
    company: Company
): Promise<WebhookResponse> {
    const formData = new FormData();

    files.forEach((file) => {
        formData.append('file', file);
    });

    formData.append('company_code', company.company_code);
    formData.append('company_name', company.company_name);
    formData.append('description', company.Description || '');
    formData.append('area', company.Area || '');

    const response = await fetch('https://n8n.sofiatechnology.ai/webhook/po', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
    }

    const text = await response.text();
    if (!text) {
        throw new Error('Empty response from webhook');
    }

    try {
        const parsed = JSON.parse(text);

        // The webhook may wrap the response in an array — unwrap first element
        const data = Array.isArray(parsed) ? parsed[0] : parsed;

        if (!data) {
            throw new Error('No usable data in webhook response');
        }

        return data as WebhookResponse;
    } catch (e) {
        console.error("Failed to parse response as JSON:", text);
        throw new Error('Invalid JSON response from webhook');
    }
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
