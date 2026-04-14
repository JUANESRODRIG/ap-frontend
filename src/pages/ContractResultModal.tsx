import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, Info, FileText, DollarSign, Building2 } from 'lucide-react';
import './InvoiceResultModal.css';

interface ContractResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any | null;
}

const ContractResultModal = ({ isOpen, onClose, data }: ContractResultModalProps) => {
    if (!isOpen || !data) return null;

    const isSuccess = data.status === 'success';

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
                        {/* Header */}
                        <div className="result-header">
                            {isSuccess ? (
                                <div className="status-icon-success">
                                    <CheckCircle2 size={32} color="#10b981" />
                                </div>
                            ) : (
                                <div className="status-icon-success" style={{ backgroundColor: '#fef3c7' }}>
                                    <AlertTriangle size={32} color="#f59e0b" />
                                </div>
                            )}
                            <h2>Contract Checked</h2>
                            <p className="result-subtitle">{isSuccess ? "Evaluated successfully" : "Evaluation returned warnings"}</p>
                        </div>

                        {/* Message */}
                        {data.message && (
                            <div className="clarification-notice" style={{ backgroundColor: isSuccess ? '#ecfdf5' : '#fffbeb', color: isSuccess ? '#065f46' : '#92400e', borderLeft: `4px solid ${isSuccess ? '#10b981' : '#f59e0b'}` }}>
                                {isSuccess ? <Info size={18} color="#10b981" /> : <AlertTriangle size={18} color="#f59e0b" />}
                                <p>{data.message}</p>
                            </div>
                        )}

                        {data.invoice && (
                            <div className="suggestion-details">
                                <div className="result-section-title">
                                    <FileText size={14} style={{ marginRight: 8 }} />
                                    Invoice Information
                                </div>
                                <div className="result-info-grid" style={{ marginBottom: 0 }}>
                                    <div className="info-card">
                                        <span className="label">Invoice #</span>
                                        <span className="value" style={{ fontFamily: 'monospace', fontWeight: 700 }}>{data.invoice.invoice_number}</span>
                                    </div>
                                    <div className="info-card">
                                        <span className="label">Vendor Name</span>
                                        <span className="value"><Building2 size={13} style={{ marginRight: 4, display: 'inline-block' }}/>{data.invoice.vendor_name}</span>
                                    </div>
                                    <div className="info-card" style={{ gridColumn: 'span 2' }}>
                                        <span className="label">Total Amount</span>
                                        <span className="value"><DollarSign size={13} style={{ display: 'inline-block' }}/>{data.invoice.total_amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {data.contract_compliance && (
                            <div className="suggestion-details">
                                <div className="result-section-title">
                                    <CheckCircle2 size={14} style={{ marginRight: 8 }} />
                                    Contract Compliance
                                </div>
                                <div className="suggestion-card">
                                    <div className="suggestion-field">
                                        <span className="label">Matched</span>
                                        <span className={`value category-badge ${data.contract_compliance.matched ? 'badge-green' : 'badge-red'}`}>
                                            {data.contract_compliance.matched ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    <div className="suggestion-field">
                                        <span className="label">Difference</span>
                                        <span className={`value category-badge ${data.contract_compliance.difference === 0 ? 'badge-blue' : 'badge-orange'}`}>
                                            ${data.contract_compliance.difference}
                                        </span>
                                    </div>
                                    <div className="suggestion-field full-width" style={{ marginTop: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-primary, #1e1e1e)', borderRadius: '8px', border: '1px solid var(--border-color, #333)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)' }}>Contract Value</span>
                                                <span style={{ fontWeight: 600, color: 'var(--text-primary, #fff)' }}>${data.contract_compliance.contract_value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)' }}>Invoice Total</span>
                                                <span style={{ fontWeight: 600, color: 'var(--text-primary, #fff)' }}>${data.contract_compliance.invoice_total?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    <div className="modal-footer">
                        <button
                            className="btn-secondary"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ContractResultModal;
