import { apiFetch } from './http';

/**
 * Uploads one or more invoice files to the backend for extraction / processing.
 *
 * @param files - Array of File objects selected by the user.
 * @returns The parsed JSON response from the API.
 */
export async function uploadInvoices(files: File[]): Promise<unknown> {
    const formData = new FormData();

    files.forEach((file) => {
        formData.append('files', file);
    });

    return apiFetch('/api/invoices/upload', {
        method: 'POST',
        body: formData,
        // Do NOT set Content-Type — the browser will set it automatically
        // with the correct multipart boundary.
    });
}
