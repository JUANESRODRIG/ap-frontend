import React, { useState, useRef, useEffect } from "react";
import { fetchCompanies } from "../lib/api";
import { CloudUpload, AlertCircle, Loader, Upload } from "lucide-react";
import "./UploadInvoice.css";
import ContractResultModal from "./ContractResultModal";

export default function UploadContract() {
    const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState<"idle" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    // Result modal state
    const [result, setResult] = useState<any>(null);
    const [showResult, setShowResult] = useState(false);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type !== "application/pdf") {
                setErrorMessage("Please upload a valid PDF file.");
                setStatus("error");
                setFile(null);
            } else {
                setFile(selectedFile);
                setStatus("idle");
                setErrorMessage("");
            }
        }
    };

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
            if (droppedFile.type !== "application/pdf") {
                setErrorMessage("Please upload a valid PDF file.");
                setStatus("error");
                setFile(null);
            } else {
                setFile(droppedFile);
                setStatus("idle");
                setErrorMessage("");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCompany || !file) {
            setErrorMessage("Please select a company and upload a PDF file.");
            setStatus("error");
            return;
        }

        setSubmitting(true);
        setStatus("idle");
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('company_code', selectedCompany.company_code);
            formData.append('company_name', selectedCompany.company_name);
            formData.append('description', selectedCompany.Description || '');
            formData.append('area', selectedCompany.Area || '');

            const response = await fetch("https://n8n.sofiatechnology.ai/webhook/SLA", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error("Failed to submit the contract.");
            }

            const text = await response.text();
            let parsedResult;
            try {
                const parsed = JSON.parse(text);
                parsedResult = Array.isArray(parsed) ? parsed[0] : parsed;
            } catch {
                throw new Error('Invalid JSON response from webhook');
            }

            setResult(parsedResult);
            setShowResult(true);

            // Reset form
            setFile(null);
            setErrorMessage("");

        } catch (error: any) {
            console.error("Submission error:", error);
            setErrorMessage(error.message || "An error occurred during submission.");
            setStatus("error");
            setFile(null);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="upload-page">
            <div className="upload-header">
                <h1 className="upload-title">Upload Contract</h1>
                <p className="upload-subtitle">
                    Select a company and upload a PDF contract to process.
                </p>


            </div>

            <div
                className={`upload-dropzone ${isDragging ? "active" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{ marginTop: '0' }}
            >
                <input
                    type="file"
                    className="hidden-input"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    style={{ display: "none" }}
                />

                <div className="upload-icon-container">
                    <CloudUpload size={40} strokeWidth={1.5} />
                </div>

                <h2 className="upload-dropzone-title">Drag & drop your contract PDF</h2>
                <p className="upload-dropzone-subtitle">or click to browse from your computer</p>

                <button
                    className="upload-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                    }}
                >
                    <Upload size={18} />
                    Browse Files
                </button>

                <p className="upload-footer-text">
                    Supported: PDF only — Max 10MB per file
                </p>
                {file && (
                    <p style={{ marginTop: 10, color: 'var(--accent-primary, #8b5cf6)', fontSize: '0.85rem', fontWeight: 500 }}>
                        Uploading: {file.name}...
                    </p>
                )}
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
                {status === "error" && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 20px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderRadius: "12px", fontSize: "0.9rem", marginBottom: "16px", width: "100%", justifyContent: 'center' }}>
                        <AlertCircle size={18} />
                        {errorMessage}
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={submitting || !selectedCompany || !file}
                    style={{
                        padding: "16px 32px",
                        borderRadius: "8px",
                        background: "var(--accent-primary, #8b5cf6)",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "1rem",
                        border: "none",
                        cursor: (submitting || !selectedCompany || !file) ? "not-allowed" : "pointer",
                        opacity: (submitting || !selectedCompany || !file) ? 0.5 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        transition: "all 0.2s ease",
                        width: "100%",
                        boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)"
                    }}
                >
                    {submitting ? (
                        <><Loader className="animate-spin" size={20} /> Uploading...</>
                    ) : (
                        <><CloudUpload size={20} /> Submit Contract</>
                    )}
                </button>
            </div>

            <ContractResultModal
                isOpen={showResult}
                onClose={() => setShowResult(false)}
                data={result}
            />
        </div>
    );
}
