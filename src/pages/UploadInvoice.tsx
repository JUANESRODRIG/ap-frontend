import { useState, useRef, useCallback, useEffect, type DragEvent, type ChangeEvent } from "react";
import { CloudUpload, Upload, Loader2, Sparkles, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./UploadInvoice.css";
import { uploadInvoices } from "../services/invoiceService";
import type { WebhookResponse, Company } from "../types/invoice";
import InvoiceResultModal from "./InvoiceResultModal";
import { fetchCompanies } from "../lib/api";

function UploadInvoice() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [result, setResult] = useState<WebhookResponse | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchDefaultCompany = async () => {
            const { data, error } = await fetchCompanies();

            if (error) {
                console.error("Error fetching companies:", error);
            } else if (data) {
                const company = data.find(c => c.company_code === 'LATAM');
                if (company) {
                    setSelectedCompany(company);
                }
            }
        };

        fetchDefaultCompany();
    }, []);


    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (!selectedCompany) {
            alert("Please select a company before uploading.");
            return;
        }

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            setFile(droppedFile);
            upload(droppedFile);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!selectedCompany) {
            alert("Please select a company before uploading.");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            upload(selectedFile);
        }
    };

    const upload = useCallback(async (selectedFile: File) => {
        if (!selectedFile) return;

        setUploading(true);
        setResult(null);

        try {
            const responseData = await uploadInvoices([selectedFile], selectedCompany!);
            console.log("Webhook Response:", responseData);
            setResult(responseData);
            setShowResult(true);
            setFile(null);
        } catch (error) {
            console.error(error);
            setFile(null);
        } finally {
            setUploading(false);
        }
    }, [selectedCompany]);

    return (
        <div className="upload-page">
            <div className="upload-header">
                <h1 className="upload-title">Upload Invoice</h1>
                <p className="upload-subtitle">
                    Drag and drop your invoice files or click to browse. We support PDF, PNG, JPG, and Excel formats.
                </p>

            </div>

            <div
                className={`upload-dropzone ${isDragging ? "active" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    className="hidden-input"
                    accept=".pdf,.png,.jpg,.jpeg,.xlsx,.csv"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    style={{ display: "none" }}
                />

                <div className="upload-icon-container">
                    <CloudUpload size={40} strokeWidth={1.5} />
                </div>

                <h2 className="upload-dropzone-title">Drag & drop your invoices</h2>
                <p className="upload-dropzone-subtitle">or click to browse from your computer</p>

                <button
                    className="upload-btn"
                    disabled={uploading || !selectedCompany}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!selectedCompany) {
                            alert("Please select a company first.");
                            return;
                        }
                        fileInputRef.current?.click();
                    }}
                >
                    <Upload size={18} />
                    {uploading ? "Uploading..." : "Browse Files"}
                </button>

                <p className="upload-footer-text">
                    Supported: PDF, PNG, JPG, XLSX, CSV — Max 25MB per file
                </p>
            </div>

            <AnimatePresence>
                {uploading && (
                    <motion.div 
                        className="processing-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div 
                            className="processing-content"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                            <div className="processing-visual">
                                <motion.div 
                                    className="processing-spinner-outer"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                />
                                <motion.div 
                                    className="processing-spinner-inner"
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                />
                                <div className="processing-icon">
                                    <Cpu size={32} className="ai-cpu-icon" />
                                    <motion.div 
                                        className="sparkle-icon"
                                        animate={{ 
                                            scale: [1, 1.2, 1],
                                            opacity: [0.5, 1, 0.5] 
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Sparkles size={16} />
                                    </motion.div>
                                </div>
                            </div>

                            <div className="processing-text">
                                <h3 className="processing-title">AI Agent Processing</h3>
                                <div className="processing-steps">
                                    <div className="step active">
                                        <Loader2 size={14} className="spin" />
                                        <span>Analyzing document structure...</span>
                                    </div>
                                    <div className="processing-filename">
                                        Processing: <strong>{file?.name}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="processing-progress">
                                <motion.div 
                                    className="processing-progress-bar"
                                    animate={{ 
                                        x: ["-100%", "100%"] 
                                    }}
                                    transition={{ 
                                        duration: 1.5, 
                                        repeat: Infinity, 
                                        ease: "easeInOut" 
                                    }}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <InvoiceResultModal
                isOpen={showResult}
                onClose={() => setShowResult(false)}
                data={result}
            />
        </div>
    );
}

export default UploadInvoice;
