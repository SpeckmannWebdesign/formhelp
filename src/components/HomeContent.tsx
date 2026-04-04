"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { LandingPage } from "./LandingPage";
import type { LandingDict } from "./LandingPage";

type UploadStatus = "idle" | "uploading" | "analyzing" | "success" | "error";

interface HomeDict {
  heading: string;
  subheading: string;
  dropActive: string;
  dropLabel: string;
  dropHint: string;
  dropLimit: string;
  otherFile: string;
  upload: string;
  analyzing: string;
  uploadSuccess: string;
  errorPdfOnly: string;
  errorTooLarge: string;
  errorUploadFailed: string;
  errorNetwork: string;
  errorGeneric: string;
}

export function HomeContent({
  lang,
  dict,
  landingDict,
}: {
  lang: Locale;
  dict: HomeDict;
  landingDict: LandingDict;
}) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const openFileDialog = useCallback(() => {
    if (!selectedFile && status === "idle") {
      inputRef.current?.click();
    }
  }, [selectedFile, status]);

  const scrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth" });
    // Nach dem Scrollen den Datei-Dialog öffnen
    setTimeout(openFileDialog, 600);
  };

  const validateFile = (file: File): string | null => {
    if (file.type !== "application/pdf") {
      return dict.errorPdfOnly;
    }
    if (file.size > 10 * 1024 * 1024) {
      return dict.errorTooLarge;
    }
    return null;
  };

  const handleFile = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      setStatus("error");
      return;
    }
    setSelectedFile(file);
    setErrorMessage("");
    setStatus("idle");
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setStatus("uploading");
    setProgress(0);
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const xhr = new XMLHttpRequest();

      const result = await new Promise<{ id: string }>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgress(percent);
            if (percent >= 100) {
              setStatus("analyzing");
            }
          }
        });

        xhr.timeout = 120000; // 2 Minuten Timeout für große PDFs + KI-Analyse
        xhr.addEventListener("timeout", () => {
          reject(new Error(dict.errorNetwork));
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            const data = JSON.parse(xhr.responseText);
            reject(new Error(data.error || dict.errorUploadFailed));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error(dict.errorNetwork));
        });

        xhr.open("POST", "/api/forms/upload");
        xhr.send(formData);
      });

      setStatus("success");
      setTimeout(() => {
        router.push(`/${lang}/forms/${result.id}`);
      }, 1000);
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : dict.errorGeneric
      );
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files?.[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dict]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setStatus("idle");
    setErrorMessage("");
    setProgress(0);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center bg-bg-primary font-[family-name:var(--font-body)]">
      <LandingPage lang={lang} dict={landingDict} onCtaClick={scrollToUpload} />

      {/* Upload-Bereich */}
      <div
        ref={uploadRef}
        className="w-full bg-bg-primary scroll-mt-8"
      >
        <main className="flex w-full max-w-2xl flex-col items-center mx-auto px-5 py-12 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-dark mb-2 text-center font-[family-name:var(--font-heading)]">
            {dict.heading}
          </h2>
          <p className="text-text-muted mb-8 text-center max-w-md">
            {dict.subheading}
          </p>

          <div
            className={`w-full rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-colors cursor-pointer ${
              dragActive
                ? "border-primary bg-primary/5"
                : selectedFile
                  ? "border-success bg-success/5"
                  : "border-surface-warm bg-card-white hover:border-primary/30"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !selectedFile && inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleInputChange}
              className="hidden"
            />

            {!selectedFile ? (
              <>
                <div className="mb-4">
                  <svg
                    className="mx-auto h-12 w-12 text-text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                  </svg>
                </div>
                <p className="text-lg font-medium text-text-dark mb-1">
                  {dragActive ? dict.dropActive : dict.dropLabel}
                </p>
                <p className="text-sm text-text-muted">
                  {dict.dropHint}
                </p>
                <p className="text-xs text-text-muted mt-2">
                  {dict.dropLimit}
                </p>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <svg
                    className="h-8 w-8 text-success shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                  </svg>
                  <div className="text-left">
                    <p className="font-medium text-text-dark truncate max-w-xs">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-text-muted">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                {status === "uploading" && (
                  <div className="w-full bg-surface-warm rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                {status === "analyzing" && (
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-sm font-medium">{dict.analyzing}</span>
                  </div>
                )}

                {status === "success" && (
                  <p className="text-success font-medium">
                    {dict.uploadSuccess}
                  </p>
                )}

                <div className="flex gap-3 justify-center">
                  {status !== "uploading" && status !== "analyzing" && status !== "success" && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resetUpload();
                        }}
                        className="px-4 py-2 text-sm rounded-xl border-2 border-surface-warm text-text-body hover:bg-surface-warm transition-colors"
                      >
                        {dict.otherFile}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          uploadFile();
                        }}
                        className="px-6 py-2 text-sm rounded-xl bg-accent text-text-white hover:bg-accent-hover transition-colors font-semibold"
                      >
                        {dict.upload}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {status === "error" && errorMessage && (
            <div className="mt-4 w-full rounded-xl bg-error/5 border border-error/20 p-4">
              <p className="text-sm text-error">
                {errorMessage}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
