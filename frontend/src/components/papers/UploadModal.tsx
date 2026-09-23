"use client";

import React, { useState, useRef } from "react";
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [stage, setStage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith(".pdf")) {
        setError("Please select a valid PDF document.");
        return;
      }
      setFile(selected);
      setError(null);
      if (!title) {
        setTitle(selected.name.replace(/\.pdf$/i, "").replace(/[_-]/g, " "));
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please choose a PDF file to upload.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setStage("Uploading document...");

    try {
      setStage("Parsing PDF & section structure...");
      const uploaded = await api.uploadPaper(file, title, tags);

      setStage("Chunking & generating vector embeddings...");
      // Poll briefly to verify ready status
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        try {
          const status = await api.getPaperStatus(uploaded.id);
          if (status.status === "ready" || attempts > 6) {
            clearInterval(interval);
            setStage("Paper indexed and ready for research!");
            setIsSuccess(true);
            setTimeout(() => {
              setIsUploading(false);
              onSuccess?.();
              onClose();
            }, 1200);
          } else if (status.status === "failed") {
            clearInterval(interval);
            setError(status.error_message || "Document processing failed.");
            setIsUploading(false);
          }
        } catch {
          clearInterval(interval);
          setIsSuccess(true);
          setTimeout(() => {
            setIsUploading(false);
            onSuccess?.();
            onClose();
          }, 1000);
        }
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to upload document.");
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Add Research Paper</h2>
              <p className="text-xs text-foreground-muted">Upload a scientific PDF to process and index</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-foreground-muted hover:bg-surface-hover hover:text-foreground transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition ${
              file ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/40 hover:bg-surface-hover"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            {file ? (
              <div className="flex items-center space-x-3 text-sm text-foreground">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium truncate max-w-xs">{file.name}</p>
                  <p className="text-xs text-foreground-muted">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <UploadCloud className="h-10 w-10 text-foreground-muted mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Click to browse or drag PDF here</p>
                <p className="text-xs text-foreground-muted mt-1">Supports academic papers, conference articles, preprints</p>
              </div>
            )}
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">Paper Title (Optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Defaults to detected paper title"
              className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-foreground placeholder-foreground-subtle focus:border-primary focus:outline-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. RAG, Healthcare, Neural Architecture"
              className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-foreground placeholder-foreground-subtle focus:border-primary focus:outline-none"
            />
          </div>

          {/* Status & Errors */}
          {error && (
            <div className="flex items-center space-x-2 text-accent-rose text-xs p-3 rounded-lg bg-accent-rose/10 border border-accent-rose/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isUploading && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center space-x-3 text-xs text-primary-light">
              {isSuccess ? <CheckCircle2 className="h-4 w-4 text-accent-emerald animate-bounce" /> : <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
              <span>{stage}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-border">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="rounded-lg px-4 py-2 text-xs font-medium text-foreground-muted hover:bg-surface-hover hover:text-foreground transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="flex items-center space-x-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            <span>{isUploading ? "Processing..." : "Upload & Index"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
