"use client";

import { useRef, useState } from "react";
import { Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadState = "idle" | "uploading" | "success" | "error";

interface LicenseUploadProps {
  docType?: string;
  onSuccess?: (path: string) => void;
}

export function LicenseUpload({ docType = "professional_license", onSuccess }: LicenseUploadProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setFileName(file.name);
    setState("uploading");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", docType);

    try {
      const res = await fetch("/api/provider/identity-documents/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Upload failed.");
      setState("success");
      onSuccess?.(data.path);
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Upload failed. Please try again.");
    }
  }

  if (state === "success") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
        <div>
          <p className="font-medium text-emerald-800">Document received</p>
          <p className="text-emerald-600">{fileName} · under review (24-48 h)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onDragOver={(e) => e.preventDefault()}
        disabled={state === "uploading"}
        className={cn(
          "relative flex w-full flex-col items-center gap-3 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors",
          state === "error"
            ? "border-rose-300 bg-rose-50"
            : "border-slate-200 bg-slate-50 hover:border-slate-400 hover:bg-white",
          state === "uploading" && "cursor-not-allowed opacity-60",
        )}
      >
        {state === "uploading" ? (
          <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
        ) : state === "error" ? (
          <AlertCircle className="h-7 w-7 text-rose-400" />
        ) : (
          <Upload className="h-7 w-7 text-slate-400" />
        )}
        <div>
          <p className="font-sans text-sm font-medium text-slate-700">
            {state === "uploading"
              ? "Uploading…"
              : state === "error"
              ? "Upload failed"
              : "Upload License or Certificate"}
          </p>
          <p className="mt-0.5 font-sans text-xs text-slate-400">
            {state === "error" ? errorMsg : "JPEG, PNG, WebP, or PDF · max 10 MB"}
          </p>
        </div>
        {state !== "uploading" && (
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-xs uppercase tracking-wider text-slate-600">
            {state === "error" ? "Try again" : "Choose file"}
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />
    </div>
  );
}
