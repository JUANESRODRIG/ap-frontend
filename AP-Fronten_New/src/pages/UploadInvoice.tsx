import { useState, useRef, useCallback, useEffect, type DragEvent, type ChangeEvent } from "react";
import { CloudUpload, Upload } from "lucide-react";
import "./UploadInvoice.css";
import { uploadInvoices } from "../services/invoiceService";
import type { WebhookResponse, Company } from "../types/invoice";
import InvoiceResultModal from "./InvoiceResultModal";
import { supabase } from "../lib/supabase";

function UploadInvoice() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [result, setResult] = useState<WebhookResponse | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchCompanies = async () => {
            const { data, error } = await supabase
                .from("companies")
                .select("company_code, company_name, Description, Area");

            if (error) {
                console.error("Error fetching companies:", error);
            } else if (data) {
                setCompanies(data);
            }
        };

        fetchCompanies();
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

                <div className="company-selection-container">
                    <label htmlFor="company-select" className="company-select-label">Company</label>
                    <select
                        id="company-select"
                        className="company-select"
                        value={selectedCompany?.company_code || ""}
                        onChange={(e) => {
                            const company = companies.find(c => c.company_code === e.target.value);
                            setSelectedCompany(company || null);
                        }}
                    >
                        <option value="" disabled>Select a company...</option>
                        {companies.map((company) => (
                            <option key={company.company_code} value={company.company_code}>
                                {company.company_name}
                            </option>
                        ))}
                    </select>
                </div>
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
