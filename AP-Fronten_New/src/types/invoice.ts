export interface Invoice {
    invoice_id: number;
    invoice_number: string;
    vendor_id: string;
    status: string;
    invoice_total: number;
}

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
    description?: string;
    suggested_category?: string;
    reason?: string;
    confidence?: string;
    no_po_no_match?: boolean;
}

export interface N8NInvoiceResponse {
    success?: boolean;
    popup?: boolean;
    message?: string;
    invoice?: InvoiceData;
    // Fields for the "suggested category" response structure
    vendor_name?: string;
    invoice_number?: string;
    invoice_date?: string;
    description?: string;
    currency?: string;
    invoice_total?: string | number;
    suggested_category?: string;
    reason?: string;
    confidence?: string;
    no_po_no_match?: boolean;
    // Fields for the "Matched" response structure
    owner_name?: string;
    match_status?: string;
    issues?: string;
    summary?: string;
    vendor_id?: string;
    po_reference?: string;
}

/* ── New webhook response types ── */

export interface WebhookVendor {
    vendor_name: string;
    vendor_found: boolean;
    note?: string;
}

export interface WebhookAccounting {
    category: string;
    gl_account: string;
    cost_center: string | null;
}

export interface WebhookClassification {
    method: string;
    confidence: number;
}

export interface WebhookAmount {
    currency: string;
    value: number;
}

export interface WebhookApproval {
    level_1: string;
    level_2: string;
    level_3: string;
}

export interface WebhookCategorize {
    type: string;
    cost_type: string;
}

/** Response when the invoice is classified and sent for approval */
export interface WebhookPendingApproval {
    invoice_number: string;
    status: 'pending_approval';
    message: string;
    vendor: WebhookVendor;
    accounting: WebhookAccounting;
    classification: WebhookClassification;
    amount: WebhookAmount;
    approval: WebhookApproval;
    categorize?: WebhookCategorize;
}

/** Response when the invoice needs manual review (low confidence) */
export interface WebhookNeedsReview {
    vendor_found: boolean;
    category_found: boolean;
    gl_account: string | null;
    method: string;
    reason: string;
    confidence: number | string;
    status: 'needs_review';
    review_required: boolean;
}

export interface Company {
    company_code: string;
    company_name: string;
    Description: string | null;
    Area: string | null;
}

/** Discriminated union for all new webhook responses */
export type WebhookResponse = WebhookPendingApproval | WebhookNeedsReview;

/** Helper to check which response type we got */
export function isPendingApproval(r: WebhookResponse): r is WebhookPendingApproval {
    return r.status === 'pending_approval';
}

export function isNeedsReview(r: WebhookResponse): r is WebhookNeedsReview {
    return r.status === 'needs_review';
}
