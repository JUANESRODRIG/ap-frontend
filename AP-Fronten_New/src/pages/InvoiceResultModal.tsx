import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Info, AlertTriangle, Shield, Tag, Building2, Clock } from 'lucide-react';
import type { WebhookResponse, WebhookPendingApproval, WebhookNeedsReview } from '../types/invoice';
import { isPendingApproval, isNeedsReview } from '../types/invoice';
import './InvoiceResultModal.css';

interface InvoiceResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: WebhookResponse | null;
}

/* ── Confidence helpers ── */

function confidencePercent(val: number | string): number {
    const n = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(n)) return 0;
    return n <= 1 ? Math.round(n * 100) : Math.round(n);
}

function confidenceLevel(pct: number): 'high' | 'medium' | 'low' {
    if (pct >= 85) return 'high';
    if (pct >= 60) return 'medium';
    return 'low';
}

function confidenceColor(level: 'high' | 'medium' | 'low') {
    return level === 'high' ? '#10b981' : level === 'medium' ? '#f59e0b' : '#ef4444';
}

/* ── Approval level label ── */
function approvalLabel(val: string) {
    if (val === 'approved') return 'Approved';
    if (val === 'rejected') return 'Rejected';
    if (val === 'ready_for_approval') return 'Ready for Approval';
    return 'Pending';
}

function approvalIcon(val: string) {
    if (val === 'approved') return <CheckCircle2 size={16} color="#10b981" />;
    if (val === 'rejected') return <AlertTriangle size={16} color="#ef4444" />;
    if (val === 'ready_for_approval') return <Shield size={16} color="#0ea5e9" />;
    return <Clock size={16} color="#f59e0b" />;
}

/* ══════════════════════════════════════════════
   Pending Approval View
   ══════════════════════════════════════════════ */

function PendingApprovalView({ data }: { data: WebhookPendingApproval }) {
    const confPct = confidencePercent(data.classification.confidence);
    const confLvl = confidenceLevel(confPct);
    const confClr = confidenceColor(confLvl);

    return (
        <>
            {/* Header */}
            <div className="result-header">
                <div className={data.status === 'ready_for_approval' ? "status-icon-ready" : "status-icon-success"}>
                    {data.status === 'ready_for_approval' ? <Shield size={32} color="#0ea5e9" /> : <CheckCircle2 size={32} color="#10b981" />}
                </div>
                <h2>{data.status === 'ready_for_approval' ? 'Processed: Ready for Approval' : 'Invoice Classified'}</h2>
                <p className="result-subtitle">
                    {data.status === 'ready_for_approval' ? 'Automated extraction completed with high confidence.' : (data.message || 'Pending 3-level approval')}
                </p>
            </div>

            {/* Message */}
            {data.message && (
                <div className="clarification-notice" style={{ backgroundColor: '#ecfdf5', color: '#065f46', borderLeft: '4px solid #10b981' }}>
                    <Info size={18} color="#10b981" />
                    <p>{data.message}</p>
                </div>
            )}

            {/* Invoice & Amount */}
            <div className="result-info-grid">
                <div className="info-card">
                    <span className="label">Invoice #</span>
                    <span className="value">{data.invoice_number}</span>
                </div>
                <div className="info-card">
                    <span className="label">Amount</span>
                    <span className="value">{data.amount.currency} {data.amount.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>

            {/* Vendor Info */}
            <div className="suggestion-details">
                <div className="result-section-title">
                    <Building2 size={14} style={{ marginRight: 8 }} />
                    Vendor Information
                </div>
                <div className="suggestion-card">
                    <div className="suggestion-field">
                        <span className="label">Vendor Name</span>
                        <span className="value">{data.vendor.vendor_name}</span>
                    </div>
                    <div className="suggestion-field">
                        <span className="label">Status</span>
                        <span className={`value category-badge ${data.vendor.vendor_found ? 'badge-green' : 'badge-orange'}`}>
                            {data.vendor.vendor_found ? 'Extracted' : 'Not Extracted'}
                        </span>
                    </div>
                    {data.vendor.note && !data.vendor.vendor_found && (
                        <div className="suggestion-field full-width">
                            <div className="vendor-warning">
                                <AlertTriangle size={14} color="#f59e0b" />
                                <span>{data.vendor.note}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Accounting & Categorization */}
            <div className="suggestion-details">
                <div className="result-section-title">
                    <Tag size={14} style={{ marginRight: 8 }} />
                    Accounting Assignment
                </div>
                <div className="suggestion-card">
                    <div className="suggestion-field">
                        <span className="label">Category</span>
                        <span className="value category-badge">{data.accounting.category}</span>
                    </div>
                    <div className="suggestion-field">
                        <span className="label">GL Account</span>
                        <span className="value" style={{ fontFamily: 'monospace', fontWeight: 700 }}>{data.accounting.gl_account}</span>
                    </div>
                    {data.accounting.cost_center && data.accounting.cost_center !== 'null' && (
                        <div className="suggestion-field">
                            <span className="label">Cost Center</span>
                            <span className="value">{data.accounting.cost_center}</span>
                        </div>
                    )}
                    
                    {/* New Categorization Fields */}
                    {data.categorize && (
                        <>
                            <div className="suggestion-field">
                                <span className="label">Type</span>
                                <span className={`value category-badge ${data.categorize.type?.toLowerCase().includes('capex') ? 'badge-blue' : 'badge-purple'}`}>
                                    {data.categorize.type || '—'}
                                </span>
                            </div>
                            <div className="suggestion-field">
                                <span className="label">Cost Type</span>
                                <span className={`value category-badge ${data.categorize.cost_type?.toLowerCase().includes('direct') ? 'badge-green' : 'badge-orange'}`}>
                                    {data.categorize.cost_type || '—'}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Classification & Confidence */}
            <div className="suggestion-details">
                <div className="result-section-title">
                    <Info size={14} style={{ marginRight: 8 }} />
                    Classification
                </div>
                <div className="suggestion-card">
                    <div className="suggestion-field">
                        <span className="label">Method</span>
                        <span className="value" style={{ textTransform: 'capitalize' }}>{data.classification.method.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="suggestion-field">
                        <span className="label">Confidence</span>
                        <div className="confidence-bar-container">
                            <div className="confidence-bar-track">
                                <div
                                    className="confidence-bar-fill"
                                    style={{ width: `${confPct}%`, backgroundColor: confClr }}
                                />
                            </div>
                            <span className="confidence-bar-label" style={{ color: confClr }}>{confPct}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Approval Tracker */}
            <div className="suggestion-details">
                <div className="result-section-title">
                    <Shield size={14} style={{ marginRight: 8 }} />
                    Approval Status
                </div>
                <div className="approval-tracker">
                    {(['level_1', 'level_2', 'level_3'] as const).map((key, i) => {
                        const val = data.approval[key];
                        const labels = ['Manager', 'Director', 'CEO'];
                        return (
                            <div key={key} className={`approval-step ${val}`}>
                                <div className="approval-step-icon">{approvalIcon(val)}</div>
                                <div className="approval-step-info">
                                    <span className="approval-step-title">{labels[i]}</span>
                                    <span className={`approval-step-status status-${val}`}>{approvalLabel(val)}</span>
                                </div>
                                {i < 2 && <div className={`approval-connector ${val === 'approved' ? 'active' : ''}`} />}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

/* ══════════════════════════════════════════════
   Needs Review View
   ══════════════════════════════════════════════ */

function NeedsReviewView({ data }: { data: WebhookNeedsReview }) {
    const confPct = confidencePercent(data.confidence);
    const confLvl = confidenceLevel(confPct);
    const confClr = confidenceColor(confLvl);

    return (
        <>
            {/* Header */}
            <div className="result-header">
                <div className="status-icon-success" style={{ backgroundColor: '#fef3c7' }}>
                    <AlertTriangle size={32} color="#f59e0b" />
                </div>
                <h2>Manual Review Required</h2>
                <p className="result-subtitle">Low confidence — please review before processing</p>
            </div>

            {/* Warning notice */}
            <div className="clarification-notice" style={{ backgroundColor: '#fffbeb', color: '#92400e', borderLeft: '4px solid #f59e0b' }}>
                <AlertTriangle size={18} color="#f59e0b" />
                <p>The AI classification confidence is too low for automatic processing. A manual review is required to assign the correct GL category.</p>
            </div>

            {/* Details grid */}
            <div className="result-info-grid">
                <div className="info-card">
                    <span className="label">Vendor Found</span>
                    <span className={`value category-badge ${data.vendor_found ? 'badge-green' : 'badge-red'}`}>
                        {data.vendor_found ? 'Extracted' : 'Not Extracted'}
                    </span>
                </div>
                <div className="info-card">
                    <span className="label">Category Found</span>
                    <span className={`value category-badge ${data.category_found ? 'badge-green' : 'badge-red'}`}>
                        {data.category_found ? 'Yes' : 'No'}
                    </span>
                </div>
                <div className="info-card">
                    <span className="label">GL Account</span>
                    <span className="value" style={{ fontFamily: 'monospace', fontWeight: 700 }}>{data.gl_account || '—'}</span>
                </div>
                <div className="info-card">
                    <span className="label">Method</span>
                    <span className="value" style={{ textTransform: 'capitalize' }}>{data.method.replace(/_/g, ' ')}</span>
                </div>
            </div>

            {/* Confidence bar */}
            <div className="suggestion-details">
                <div className="result-section-title">
                    <Info size={14} style={{ marginRight: 8 }} />
                    Confidence Score
                </div>
                <div className="suggestion-card" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="suggestion-field">
                        <div className="confidence-bar-container" style={{ width: '100%' }}>
                            <div className="confidence-bar-track" style={{ flex: 1 }}>
                                <div
                                    className="confidence-bar-fill"
                                    style={{ width: `${confPct}%`, backgroundColor: confClr }}
                                />
                            </div>
                            <span className="confidence-bar-label" style={{ color: confClr }}>{confPct}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reason */}
            {data.reason && (
                <div className="suggestion-details">
                    <div className="result-section-title">
                        <Info size={14} style={{ marginRight: 8 }} />
                        Reason
                    </div>
                    <pre className="result-message" style={{ borderLeftColor: '#f59e0b' }}>
                        {data.reason}
                    </pre>
                </div>
            )}
        </>
    );
}

/* ══════════════════════════════════════════════
   Main Modal Component
   ══════════════════════════════════════════════ */

const InvoiceResultModal = ({ isOpen, onClose, data }: InvoiceResultModalProps) => {
    if (!isOpen || !data) return null;

    const isPending = isPendingApproval(data);
    const isReview = isNeedsReview(data);

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
                        {isPending && <PendingApprovalView data={data} />}
                        {isReview && <NeedsReviewView data={data} />}
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

export default InvoiceResultModal;
