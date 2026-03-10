import { useState, useRef } from "react";
import { CloudUpload, Upload } from "lucide-react";
import "./UploadInvoice.css";

function UploadInvoice() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
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

    async function upload(selectedFile: File) {
        if (!selectedFile) return;

        setUploading(true);

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const res = await fetch("https://n8n.sofiatechnology.ai/webhook-test/upload-invoices", {

                //     https://n8n.sofiatechnology.ai/webhook-test/upload-invoice 
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            console.log("n8n response:", data);

            alert("Invoice uploaded successfully!");
            setFile(null); // Reset state after alert to show clean dropzone again
        } catch (error) {
            console.error(error);
            alert("Error uploading invoice");
            setFile(null);
        }

        setUploading(false);
    }

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
                {uploading && file && <p style={{ marginTop: 10, color: '#8b5cf6', fontSize: '0.85rem' }}>Uploading: {file.name}...</p>}
            </div>
        </div>
    );
}

export default UploadInvoice;
