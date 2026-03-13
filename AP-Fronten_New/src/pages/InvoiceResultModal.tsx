import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, FileText, Info, Save, AlertTriangle } from 'lucide-react';
import type { N8NInvoiceResponse } from '../types/invoice';
import { confirmInvoice } from '../services/invoiceService';
import { useState } from 'react';
import './InvoiceResultModal.css';

interface InvoiceResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: N8NInvoiceResponse | null;
}

const InvoiceResultModal = ({ isOpen, onClose, data }: InvoiceResultModalProps) => {
    const [isConfirming, setIsConfirming] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen || !data) return null;

    const { 
        message, 
        invoice, 
        suggested_category, 
        reason, 
        confidence, 
        vendor_name, 
        invoice_number, 
        invoice_date, 
        currency, 
        invoice_total,
        no_po_no_match,
        owner_name,
        match_status,
        issues,
        summary
    } = data;
    
    const isSuggested = no_po_no_match === true || !!suggested_category;
    const isMatched = match_status === 'Matched';
    const isException = match_status === 'Exception';

    // Normalize data for display
    const displayInvoice = isSuggested ? {
        invoice_number: invoice_number || invoice?.invoice_number || 'N/A',
        vendor_name: vendor_name || invoice?.vendor_name || 'N/A',
        invoice_date: invoice_date || invoice?.invoice_date || 'N/A',
        po_reference: invoice?.po_reference || 'N/A',
        currency: currency || invoice?.currency || 'USD',
        invoice_total: typeof invoice_total === 'string' ? parseFloat(invoice_total) : (invoice_total || invoice?.invoice_total || 0),
        subtotal: invoice?.subtotal || null,
        tax_amount: invoice?.tax_amount || null,
        payment_terms: invoice?.payment_terms || null,
        line_items: invoice?.line_items || [],
        suggested_category: suggested_category || (invoice as any)?.suggested_category,
        reason: reason || (invoice as any)?.reason,
        confidence: confidence || (invoice as any)?.confidence
    } : (invoice || {
        invoice_number: invoice_number || 'N/A',
        vendor_name: vendor_name || data.vendor_id || 'N/A',
        invoice_date: invoice_date || 'N/A',
        po_reference: data.po_reference || 'N/A',
        currency: currency || 'USD',
        invoice_total: typeof invoice_total === 'string' ? parseFloat(invoice_total) : (invoice_total || 0),
        subtotal: null,
        tax_amount: null,
        payment_terms: null,
        line_items: []
    } as any);

    const handleConfirm = async () => {
        setIsConfirming(true);
        setError(null);
        try {
            await confirmInvoice();
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
            }, 2000);
        } catch (err) {
            setError('Failed to confirm invoice. Please try again.');
            console.error(err);
        } finally {
            setIsConfirming(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="modal-overlay" onClick={onClose}>
                <motion.div
                    className="modal-content"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                >
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>

                    <div className="modal-body">
                        <div className="result-header">
                            <div className={`status-icon-${isException ? 'error' : 'success'}`} style={isException ? { backgroundColor: '#fee2e2' } : {}}>
                                {isException ? <AlertTriangle size={32} color="#ef4444" /> : <CheckCircle2 size={32} color="#10b981" />}
                            </div>
                            <h2>{isException ? 'Invoice Exception' : isMatched ? 'Invoice Matched' : isSuggested ? 'Suggested Classification' : 'Extraction Successful'}</h2>
                        </div>

                        {isSuggested && (
                            <div className="clarification-notice">
                                <Info size={18} />
                                <p>No Purchase Order or Vendor found. Based on the invoice content, we've suggested the following category.</p>
                            </div>
                        )}
                        
                        {isMatched && (
                            <div className="clarification-notice" style={{ backgroundColor: '#ecfdf5', color: '#065f46', borderLeft: '4px solid #10b981' }}>
                                <CheckCircle2 size={18} color="#10b981" />
                                <p>This invoice perfectly matches the associated purchase order and goods receipt. Ready for approval.</p>
                            </div>
                        )}

                        {isException && (
                            <div className="clarification-notice" style={{ backgroundColor: '#fef2f2', color: '#991b1b', borderLeft: '4px solid #ef4444' }}>
                                <AlertTriangle size={18} color="#ef4444" />
                                <p>This invoice has discrepancies with the purchase order or goods receipt and requires manual review.</p>
                            </div>
                        )}

                        <div className="result-info-grid">
                            <div className="info-card">
                                <span className="label">Invoice #</span>
                                <span className="value">{displayInvoice.invoice_number || 'N/A'}</span>
                            </div>
                            <div className="info-card">
                                <span className="label">Vendor ID/Name</span>
                                <span className="value">{displayInvoice.vendor_name || data.vendor_id || 'N/A'}</span>
                            </div>
                            {(isMatched || isException) && owner_name && (
                                <div className="info-card">
                                    <span className="label">Owner</span>
                                    <span className="value">{owner_name}</span>
                                </div>
                            )}
                            <div className="info-card">
                                <span className="label">PO Ref</span>
                                <span className="value">{displayInvoice.po_reference || data.po_reference || 'N/A'}</span>
                            </div>
                            {(!isMatched && !isException) && (
                                <div className="info-card">
                                    <span className="label">Date</span>
                                    <span className="value">{displayInvoice.invoice_date || 'N/A'}</span>
                                </div>
                            )}
                        </div>

                        {(isMatched || isException) && (
                            <div className="suggestion-details">
                                <div className="result-section-title">
                                    {isMatched ? (
                                        <CheckCircle2 size={14} style={{ marginRight: 8, display: 'inline', color: '#10b981' }} />
                                    ) : (
                                        <AlertTriangle size={14} style={{ marginRight: 8, display: 'inline', color: '#ef4444' }} />
                                    )}
                                    Matching Results
                                </div>
                                <div className="suggestion-card" style={{ 
                                    borderColor: isMatched ? '#a7f3d0' : '#fecaca', 
                                    backgroundColor: isMatched ? '#f0fdf4' : '#fef2f2' 
                                }}>
                                    <div className="suggestion-field">
                                        <span className="label">Status</span>
                                        <span className="value category-badge" style={{ 
                                            backgroundColor: isMatched ? '#d1fae5' : '#fee2e2', 
                                            color: isMatched ? '#065f46' : '#991b1b' 
                                        }}>
                                            {match_status}
                                        </span>
                                    </div>
                                    <div className="suggestion-field full-width">
                                        <span className="label">Issues</span>
                                        {issues ? (
                                            <div 
                                                className="value reason-text" 
                                                style={{ color: isMatched ? '#059669' : '#b91c1c', fontWeight: 500, lineHeight: 1.6 }}
                                                dangerouslySetInnerHTML={{ __html: issues }}
                                            />
                                        ) : (
                                            <span className="value" style={{ color: isMatched ? '#059669' : '#b91c1c', fontWeight: 500 }}>
                                                None
                                            </span>
                                        )}
                                    </div>
                                    <div className="suggestion-field full-width">
                                        <span className="label">Summary</span>
                                        <p className="reason-text" style={{ color: isMatched ? '#064e3b' : '#7f1d1d' }}>{summary}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isSuggested && (
                            <div className="suggestion-details">
                                <div className="result-section-title">
                                    <Info size={14} style={{ marginRight: 8, display: 'inline' }} />
                                    Suggested Classification
                                </div>
                                <div className="suggestion-card">
                                    <div className="suggestion-field">
                                        <span className="label">Suggested Category</span>
                                        <span className="value category-badge">{displayInvoice.suggested_category}</span>
                                    </div>
                                    <div className="suggestion-field">
                                        <span className="label">Confidence</span>
                                        <span className={`value confidence-badge ${displayInvoice.confidence?.toLowerCase()}`}>
                                            {displayInvoice.confidence}
                                        </span>
                                    </div>
                                    <div className="suggestion-field full-width">
                                        <span className="label">Reasoning</span>
                                        <p className="reason-text">{displayInvoice.reason}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {message && (
                            <>
                                <div className="result-section-title">
                                    <Info size={14} style={{ marginRight: 8, display: 'inline' }} />
                                    Agent Summary
                                </div>
                                <pre className="result-message">
                                    {message}
                                </pre>
                            </>
                        )}

                        {displayInvoice.line_items && displayInvoice.line_items.length > 0 && (
                            <>
                                <div className="result-section-title">
                                    <FileText size={14} style={{ marginRight: 8, display: 'inline' }} />
                                    Line Items
                                </div>
                                <div className="line-items-container">
                                    <table className="line-items-table">
                                        <thead>
                                            <tr>
                                                <th>Description</th>
                                                <th>Qty</th>
                                                <th>Price</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displayInvoice.line_items.map((item: any, idx: number) => (
                                                <tr key={idx}>
                                                    <td>{item.description}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>{item.unit_price}</td>
                                                    <td className="item-total">
                                                        {displayInvoice.currency} {item.line_total}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="modal-footer">
                        {isSuccess ? (
                            <div className="success-message">
                                <CheckCircle2 size={20} />
                                <span>Invoice Saved Successfully!</span>
                            </div>
                        ) : (
                            <>
                                {error && <span className="error-text" style={{ color: 'var(--accent-red)', fontSize: '0.85rem', marginRight: 'auto' }}>{error}</span>}
                                <button 
                                    className="btn-secondary" 
                                    onClick={onClose}
                                    disabled={isConfirming}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="btn-primary" 
                                    onClick={handleConfirm}
                                    disabled={isConfirming}
                                >
                                    {isConfirming ? (
                                        <>
                                            <div className="spinner"></div>
                                            Confirming...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Confirm & Save Invoice
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default InvoiceResultModal;
