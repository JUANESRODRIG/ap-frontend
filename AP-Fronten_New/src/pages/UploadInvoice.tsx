import { useState, useRef, useCallback, useEffect, type DragEvent, type ChangeEvent } from "react";
import { CloudUpload, Upload, Building2, ChevronDown, Search, MapPin, Check } from "lucide-react";
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

                {/* Custom company dropdown */}
                <div className="company-dropdown-wrapper" ref={dropdownRef} onKeyDown={handleKeyDown}>
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
