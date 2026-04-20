import type { Invoice, Company } from '../types/invoice';
import type { Vendor } from '../types/vendor';

export interface Exception {
  id: number;
  invoice_id: number;
  exception_type: string;
  description: string;
  // Add other fields as needed
}

const BASE_URL = '/n8n-api/webhook';

export async function fetchInvoices(): Promise<{ data: Invoice[] | null; error: unknown }> {
  try {
    const response = await fetch(`${BASE_URL}/fetch-invoices`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function fetchExceptions(): Promise<{ data: Exception[] | null; error: unknown }> {
  try {
    const response = await fetch(`${BASE_URL}/fetch-exceptions`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function fetchVendors(): Promise<{ data: Vendor[] | null; error: unknown }> {
  try {
    const response = await fetch(`${BASE_URL}/fetch-vendors`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function fetchCompanies(): Promise<{ data: Company[] | null; error: unknown }> {
  try {
    const response = await fetch(`${BASE_URL}/fetch-companies`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}