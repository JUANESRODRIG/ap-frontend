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
}

export interface N8NInvoiceResponse {
    success: boolean;
    popup: boolean;
    message: string;
    invoice: InvoiceData;
}
