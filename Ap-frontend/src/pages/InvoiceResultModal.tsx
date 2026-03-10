import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, FileText, Info } from 'lucide-react';
import { N8NInvoiceResponse } from '../api/invoices';

interface InvoiceResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: N8NInvoiceResponse | null;
}

const InvoiceResultModal = ({ isOpen, onClose, data }: InvoiceResultModalProps) => {
    if (!isOpen || !data) return null;

    const { message, invoice } = data;

    return (
        <AnimatePresence>
            <div className="modal-overlay" onClick={onClose}>
                <motion.div
                    className="modal-content"
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                >
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>

                    <div className="modal-body">
                        <div className="result-header">
                            <div className="status-icon-success">
                                <CheckCircle2 size={32} color="#10b981" />
                            </div>
                            <h2>Extraction Successful</h2>
                        </div>

                        <div className="result-info-grid">
                            <div className="info-card">
                                <span className="label">Invoice #</span>
                                <span className="value">{invoice.invoice_number || 'N/A'}</span>
                            </div>
                            <div className="info-card">
                                <span className="label">Vendor</span>
                                <span className="value">{invoice.vendor_name || 'N/A'}</span>
                            </div>
                            <div className="info-card">
                                <span className="label">Date</span>
                                <span className="value">{invoice.invoice_date || 'N/A'}</span>
                            </div>
                            <div className="info-card">
                                <span className="label">PO Ref</span>
                                <span className="value">{invoice.po_reference || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="result-section-title">
                            <Info size={14} style={{ marginRight: 8, display: 'inline' }} />
                            Agent Summary
                        </div>
                        <pre className="result-message">
                            {message}
                        </pre>

                        {invoice.line_items && invoice.line_items.length > 0 && (
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
                                            {invoice.line_items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>{item.description}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>{item.unit_price}</td>
                                                    <td className="item-total">
                                                        {invoice.currency} {item.line_total}
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
                        <button className="btn-primary" onClick={onClose}>
                            Done
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default InvoiceResultModal;
