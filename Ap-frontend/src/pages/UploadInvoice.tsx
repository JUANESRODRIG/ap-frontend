import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CloudUpload,
    FileText,
    X,
    CheckCircle2,
    Upload,
    Loader2,
} from 'lucide-react';
import { uploadInvoices, N8NInvoiceResponse } from '../api/invoices';
import InvoiceResultModal from './InvoiceResultModal';

interface UploadedFile {
    id: string;
    file: File;
    progress: number;
    status: 'idle' | 'uploading' | 'complete';
}

const UploadInvoice = () => {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [dragging, setDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<N8NInvoiceResponse | null>(null);
    const [showResult, setShowResult] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFiles = useCallback((newFiles: FileList | null) => {
        if (!newFiles) return;

        const incoming: UploadedFile[] = Array.from(newFiles).map((file) => ({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            file,
            progress: 0,
            status: 'idle' as const,
        }));

        setFiles((prev) => [...prev, ...incoming]);
    }, []);

    const removeFile = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => setDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleSubmit = async () => {
        if (files.length === 0 || isProcessing) return;

        try {
            setIsProcessing(true);
            setError(null);

            // Set all idle files to uploading
            setFiles((prev) =>
                prev.map((f) =>
                    f.status === 'idle' ? { ...f, status: 'uploading' } : f
                )
            );

            // Simulate upload progress for all files
            const simulationPromises = files.map((item) => {
                if (item.status !== 'idle') return Promise.resolve();

                return new Promise<void>((resolve) => {
                    let progress = 0;
                    const interval = setInterval(() => {
                        progress += Math.random() * 25 + 15;
                        if (progress >= 100) {
                            progress = 100;
                            clearInterval(interval);
                            setFiles((prev) =>
                                prev.map((f) =>
                                    f.id === item.id
                                        ? { ...f, progress: 100, status: 'complete' }
                                        : f
                                )
                            );
                            resolve();
                        } else {
                            setFiles((prev) =>
                                prev.map((f) =>
                                    f.id === item.id ? { ...f, progress } : f
                                )
                            );
                        }
                    }, 300);
                });
            });

            const rawFiles = files.map((f) => f.file);

            // Start the actual API call in parallel with progress simulation
            const [results] = await Promise.all([
                uploadInvoices(rawFiles),
                ...simulationPromises
            ]);

            // n8n returns an array, we take the first one for the modal if present
            if (results && results.length > 0) {
                setResult(results[0]);
                setShowResult(true);
            }

            // TODO: integrate the result into your UI (e.g. navigate to a
            // results page or show extracted data). For now, we just log it.
            // eslint-disable-next-line no-console
            console.log('Invoice extraction result:', result);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to process invoices';
            setError(message);
            // Reset status on error so user can try again
            setFiles((prev) =>
                prev.map((f) =>
                    f.status === 'uploading' ? { ...f, status: 'idle', progress: 0 } : f
                )
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const allComplete = files.length > 0 && files.every((f) => f.status === 'complete');

    return (
        <motion.div
            className="upload-page"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="upload-page-header">
                <h1>Upload Invoice</h1>
                <p>
                    Drag and drop your invoice files or click to browse. We support
                    PDF, PNG, JPG, and Excel formats.
                </p>
            </div>

            {/* Dropzone */}
            <div
                className={`upload-dropzone ${dragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                id="upload-dropzone"
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.csv"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFiles(e.target.files)}
                    id="file-input"
                />
                <div className="upload-dropzone-content">
                    <motion.div
                        className="upload-icon-wrapper"
                        animate={dragging ? { scale: 1.1, y: -8 } : { scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <CloudUpload size={36} />
                    </motion.div>
                    <div className="upload-title">
                        {dragging ? 'Drop your files here' : 'Drag & drop your invoices'}
                    </div>
                    <div className="upload-subtitle">or click to browse from your computer</div>
                    <button
                        className="upload-browse-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            inputRef.current?.click();
                        }}
                        id="browse-files-btn"
                    >
                        <Upload size={16} />
                        Browse Files
                    </button>
                    <div className="upload-formats">
                        Supported: PDF, PNG, JPG, XLSX, CSV — Max 25MB per file
                    </div>
                </div>
            </div>

            {/* File list */}
            <AnimatePresence>
                {files.length > 0 && (
                    <motion.div
                        className="upload-file-list"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        {files.map((item) => (
                            <motion.div
                                key={item.id}
                                className="upload-file-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                layout
                            >
                                <div className="upload-file-icon">
                                    <FileText size={22} />
                                </div>
                                <div className="upload-file-info">
                                    <div className="upload-file-name">{item.file.name}</div>
                                    <div className="upload-file-size">
                                        {formatSize(item.file.size)}
                                    </div>
                                    {item.status === 'uploading' && (
                                        <div className="upload-file-progress">
                                            <div
                                                className="upload-file-progress-bar"
                                                style={{ width: `${item.progress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <span
                                    className={`upload-file-status ${item.status}`}
                                >
                                    {item.status === 'idle' ? (
                                        <>
                                            <div className="status-dot" style={{ backgroundColor: 'var(--text-secondary)' }} />
                                            Ready
                                        </>
                                    ) : item.status === 'uploading' ? (
                                        <>
                                            <Loader2
                                                size={12}
                                                style={{
                                                    animation: 'spin 1s linear infinite',
                                                    display: 'inline',
                                                    marginRight: 4,
                                                }}
                                            />
                                            {Math.round(item.progress)}%
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2
                                                size={12}
                                                style={{ display: 'inline', marginRight: 4 }}
                                            />
                                            Done
                                        </>
                                    )}
                                </span>
                                <button
                                    className="upload-file-remove"
                                    onClick={() => removeFile(item.id)}
                                    aria-label={`Remove ${item.file.name}`}
                                >
                                    <X size={16} />
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error message */}
            {error && (
                <div className="upload-error-message">
                    {error}
                </div>
            )}

            {/* Submit button */}
            {files.length > 0 && (
                <motion.button
                    className="upload-submit-btn"
                    disabled={isProcessing || (!files.some(f => f.status === 'idle') && !allComplete)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={!isProcessing ? { scale: 1.02 } : {}}
                    whileTap={!isProcessing ? { scale: 0.98 } : {}}
                    id="submit-invoices-btn"
                    onClick={handleSubmit}
                >
                    <CheckCircle2 size={20} />
                    {isProcessing
                        ? 'Processing...'
                        : allComplete
                            ? 'Processing Complete'
                            : `Process ${files.filter(f => f.status === 'idle').length} Invoice${files.filter(f => f.status === 'idle').length > 1 ? 's' : ''}`}
                </motion.button>
            )}

            <InvoiceResultModal
                isOpen={showResult}
                onClose={() => setShowResult(false)}
                data={result}
            />
        </motion.div>
    );
};

export default UploadInvoice;
