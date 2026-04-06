import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { CloudUpload, AlertCircle, Loader, Building2, ChevronDown, Search, MapPin, Check, Upload } from "lucide-react";
import "./UploadInvoice.css";
import ContractResultModal from "./ContractResultModal";

export default function UploadContract() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState<"idle" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    // Result modal state
    const [result, setResult] = useState<any>(null);
    const [showResult, setShowResult] = useState(false);

    // Dropdown state
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

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

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
                setSearchQuery("");
                setHighlightedIndex(-1);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (dropdownOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [dropdownOpen]);

    const filteredCompanies = companies.filter((c) => {
        const q = searchQuery.toLowerCase();
        return (
            c.company_name.toLowerCase().includes(q) ||
            c.company_code.toLowerCase().includes(q) ||
            (c.Description && c.Description.toLowerCase().includes(q)) ||
            (c.Area && c.Area.toLowerCase().includes(q))
        );
    });

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!dropdownOpen) {
            if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                e.preventDefault();
                setDropdownOpen(true);
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < filteredCompanies.length - 1 ? prev + 1 : 0
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : filteredCompanies.length - 1
                );
                break;
            case "Enter":
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredCompanies.length) {
                    setSelectedCompany(filteredCompanies[highlightedIndex]);
                    setDropdownOpen(false);
                    setSearchQuery("");
                    setHighlightedIndex(-1);
                }
                break;
            case "Escape":
                setDropdownOpen(false);
                setSearchQuery("");
                setHighlightedIndex(-1);
                break;
        }
    };

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

                {/* Company dropdown */}
                <div className="company-dropdown-wrapper" ref={dropdownRef} onKeyDown={handleKeyDown} style={{ marginBottom: '20px' }}>
                    <label className="company-dropdown-label">
                        <Building2 size={15} />
                        Select Company
                    </label>
                    <button
                        type="button"
                        className={`company-dropdown-trigger ${dropdownOpen ? "open" : ""} ${selectedCompany ? "has-value" : ""}`}
                        onClick={() => setDropdownOpen((prev) => !prev)}
                        aria-haspopup="listbox"
                        aria-expanded={dropdownOpen}
                        id="company-select"
                    >
                        {selectedCompany ? (
                            <div className="company-dropdown-selected">
                                <div className="company-dropdown-selected-avatar">
                                    {selectedCompany.company_name.charAt(0)}
                                </div>
                                <div className="company-dropdown-selected-info">
                                    <span className="company-dropdown-selected-name">{selectedCompany.company_name}</span>
                                    <span className="company-dropdown-selected-code">{selectedCompany.company_code}</span>
                                </div>
                            </div>
                        ) : (
                            <span className="company-dropdown-placeholder">Choose a company…</span>
                        )}
                        <ChevronDown size={18} className={`company-dropdown-chevron ${dropdownOpen ? "rotated" : ""}`} />
                    </button>

                    {dropdownOpen && (
                        <div className="company-dropdown-menu" role="listbox">
                            <div className="company-dropdown-search-wrap">
                                <Search size={15} className="company-dropdown-search-icon" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    className="company-dropdown-search"
                                    placeholder="Search companies…"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setHighlightedIndex(0);
                                    }}
                                />
                            </div>
                            <div className="company-dropdown-list">
                                {filteredCompanies.length === 0 ? (
                                    <div className="company-dropdown-empty">No companies found</div>
                                ) : (
                                    filteredCompanies.map((company, index) => (
                                        <button
                                            key={company.company_code}
                                            type="button"
                                            role="option"
                                            aria-selected={selectedCompany?.company_code === company.company_code}
                                            className={`company-dropdown-item ${selectedCompany?.company_code === company.company_code ? "selected" : ""} ${highlightedIndex === index ? "highlighted" : ""}`}
                                            onClick={() => {
                                                setSelectedCompany(company);
                                                setDropdownOpen(false);
                                                setSearchQuery("");
                                                setHighlightedIndex(-1);
                                            }}
                                            onMouseEnter={() => setHighlightedIndex(index)}
                                        >
                                            <div className="company-dropdown-item-avatar">
                                                {company.company_name.charAt(0)}
                                            </div>
                                            <div className="company-dropdown-item-info">
                                                <span className="company-dropdown-item-name">{company.company_name}</span>
                                                <span className="company-dropdown-item-meta">
                                                    <span className="company-dropdown-item-code">{company.company_code}</span>
                                                    {company.Area && (
                                                        <span className="company-dropdown-item-area">
                                                            <MapPin size={11} />
                                                            {company.Area}
                                                        </span>
                                                    )}
                                                </span>
                                                {company.Description && (
                                                    <span className="company-dropdown-item-desc">{company.Description}</span>
                                                )}
                                            </div>
                                            {selectedCompany?.company_code === company.company_code && (
                                                <Check size={16} className="company-dropdown-item-check" />
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

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
