import { useState, useRef, useCallback } from "react";
import { CloudUpload, Upload, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import "./UploadInvoice.css";
import { uploadInvoices } from "../services/invoiceService";
import type { N8NInvoiceResponse } from "../types/invoice";
import InvoiceResultModal from "./InvoiceResultModal";

function UploadInvoice() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [result, setResult] = useState<N8NInvoiceResponse | null>(null);
    const [showResult, setShowResult] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            setFile(droppedFile);
            upload(droppedFile); // automatically upload on drop
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            upload(selectedFile); // automatically upload on selection
        }
    };

    const upload = useCallback(async (selectedFile: File) => {
        if (!selectedFile) return;

        setUploading(true);
        setResult(null);

        try {
            const results = await uploadInvoices([selectedFile]);

            // n8n returns an array, we take the first one for the modal if present
            if (results && results.length > 0) {
                setResult(results[0]);
                setShowResult(true);
            }

            setFile(null); // Reset state to show clean dropzone again
        } catch (error) {
            console.error(error);
            alert("Error uploading invoice");
            setFile(null);
        } finally {
            setUploading(false);
        }
    }, [uploadInvoices]);

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
                    disabled={uploading}
                    onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                    }}
                >
                    <Upload size={18} />
                    {uploading ? "Uploading..." : "Browse Files"}
                </button>

                <p className="upload-footer-text">
                    Supported: PDF, PNG, JPG, XLSX, CSV — Max 25MB per file
                </p>
                {uploading && file && (
                    <p style={{ marginTop: 10, color: '#8b5cf6', fontSize: '0.85rem' }}>
                        Uploading: {file.name}...
                    </p>
                )}
            </div>

            <InvoiceResultModal
                isOpen={showResult}
                onClose={() => setShowResult(false)}
                data={result}
            />
        </div>
    );
}

export default UploadInvoice;
