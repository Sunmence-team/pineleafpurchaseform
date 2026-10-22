import React, { useState, useEffect, useMemo, useCallback } from "react";
import { BiSearch } from "react-icons/bi";
import {
  BsFileEarmarkPdf,
  BsDownload,
  BsCheckCircle,
  BsXCircle,
  BsClockHistory,
  BsChatSquareText,
} from "react-icons/bs";
import { FaFilePdf } from "react-icons/fa6";
import { toast } from "sonner";
import OverviewCards from "../../components/cards/OverviewCards";
import ActionButton from "../../components/ui/ActionButton";
import SubmitFeedbackModal from "../../components/modals/SubmitFeedbackModal";
import { formatISODateToCustom } from "../../helpers/formatterUtility";
import { api } from "../../helpers/api";

export interface BatchFeedbackRecord {
  document_id: string | number;
  barrister_name: string;
  total_sent: number;
  signed_count: number;
  unsigned_count: number;
  date_returned: string;
  remarks?: string;
  updated_at: string;
}

export interface DownloadBatchDocument {
  id: string | number;
  title: string;
  filename: string;
  download_type: "last_download" | "all_times" | "site_specific" | "branch";
  site_location?: string;
  branch?: string;
  total_entries: number;
  created_at: string;
  download_url?: string;
  feedback?: BatchFeedbackRecord;
}

const STORAGE_DOCS_KEY = "pineleaf_downloaded_documents_library";
const STORAGE_FEEDBACK_KEY = "pineleaf_document_feedback_records";

export const getStoredDocuments = (): DownloadBatchDocument[] => {
  try {
    const raw = localStorage.getItem(STORAGE_DOCS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredDocuments = (docs: DownloadBatchDocument[]) => {
  try {
    localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(docs));
  } catch (e) {
    console.error("Failed to save documents library:", e);
  }
};

export const getStoredBatchFeedback = (
  docId: string | number
): BatchFeedbackRecord | undefined => {
  try {
    const raw = localStorage.getItem(STORAGE_FEEDBACK_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return map[String(docId)];
  } catch {
    return undefined;
  }
};

export const saveStoredBatchFeedback = (
  docId: string | number,
  record: BatchFeedbackRecord
) => {
  try {
    const raw = localStorage.getItem(STORAGE_FEEDBACK_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[String(docId)] = record;
    localStorage.setItem(STORAGE_FEEDBACK_KEY, JSON.stringify(map));
  } catch (e) {
    console.error("Failed to save batch feedback:", e);
  }
};

// Seed initial mock/demo documents if empty so user has realistic PDFs right away
const SEED_DOCUMENTS: DownloadBatchDocument[] = [
  {
    id: "batch-101",
    title: "Batch Download - Awka Sites",
    filename: "Client_Records_Awka_20261015.pdf",
    download_type: "site_specific",
    site_location: "Obodo-Oma Pineleaf Estate Awka",
    branch: "Awka",
    total_entries: 14,
    created_at: "2026-10-15T11:20:00Z",
    feedback: {
      document_id: "batch-101",
      barrister_name: "Barr. Chukwuemeka Eze",
      total_sent: 14,
      signed_count: 12,
      unsigned_count: 2,
      date_returned: "2026-10-19",
      remarks: "2 entries unsigned due to missing signature specimen on Section 4",
      updated_at: "2026-10-19T14:30:00Z",
    },
  },
  {
    id: "batch-102",
    title: "Batch Download - Lekki Sites",
    filename: "Client_Records_Lekki_20261018.pdf",
    download_type: "site_specific",
    site_location: "Pineleaf Palms Lekki Phase 1",
    branch: "Lagos Ajah",
    total_entries: 8,
    created_at: "2026-10-18T09:45:00Z",
  },
  {
    id: "batch-103",
    title: "All Times Client Records Export",
    filename: "All_Client_Records_20261020.pdf",
    download_type: "all_times",
    branch: "All Branches",
    total_entries: 26,
    created_at: "2026-10-20T16:10:00Z",
  },
];

const DocumentLibrary: React.FC = () => {
  const [documents, setDocuments] = useState<DownloadBatchDocument[]>(() => {
    const existing = getStoredDocuments();
    if (existing.length === 0) {
      saveStoredDocuments(SEED_DOCUMENTS);
      return SEED_DOCUMENTS;
    }
    return existing;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFeedbackModalDoc, setActiveFeedbackModalDoc] =
    useState<DownloadBatchDocument | null>(null);

  // Sync feedback into state
  const refreshDocumentsWithFeedback = useCallback(() => {
    setDocuments((prev) =>
      prev.map((doc) => {
        const fb = getStoredBatchFeedback(doc.id);
        return fb ? { ...doc, feedback: fb } : doc;
      })
    );
  }, []);

  useEffect(() => {
    refreshDocumentsWithFeedback();
  }, [refreshDocumentsWithFeedback]);

  // Search filter
  const filteredDocuments = useMemo(() => {
    if (!searchTerm.trim()) return documents;
    const lower = searchTerm.toLowerCase();
    return documents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(lower) ||
        doc.filename.toLowerCase().includes(lower) ||
        (doc.site_location && doc.site_location.toLowerCase().includes(lower)) ||
        (doc.feedback?.barrister_name &&
          doc.feedback.barrister_name.toLowerCase().includes(lower))
    );
  }, [documents, searchTerm]);

  // Overall metric totals
  const totalSent = useMemo(
    () =>
      documents.reduce(
        (sum, doc) => sum + (doc.feedback?.total_sent || doc.total_entries || 0),
        0
      ),
    [documents]
  );
  const totalSigned = useMemo(
    () =>
      documents.reduce(
        (sum, doc) => sum + (doc.feedback?.signed_count || 0),
        0
      ),
    [documents]
  );
  const totalUnsigned = useMemo(
    () =>
      documents.reduce(
        (sum, doc) => sum + (doc.feedback?.unsigned_count || 0),
        0
      ),
    [documents]
  );

  const handleFeedbackSaved = (savedFeedback: BatchFeedbackRecord) => {
    setDocuments((prev) => {
      const updated = prev.map((doc) =>
        String(doc.id) === String(savedFeedback.document_id)
          ? { ...doc, feedback: savedFeedback }
          : doc
      );
      saveStoredDocuments(updated);
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCards
          title="Downloaded Batches"
          value={documents.length}
          icon={BsFileEarmarkPdf}
          subtitle="Document library records"
        />
        <OverviewCards
          title="Total Entries Sent"
          value={totalSent}
          icon={BsDownload}
          subtitle="Dispatched for legal signing"
        />
        <OverviewCards
          title="Total Signed / Approved"
          value={totalSigned}
          icon={BsCheckCircle}
          subtitle="Returned signed by barristers"
        />
        <OverviewCards
          title="Total Unsigned / Rejected"
          value={totalUnsigned}
          icon={BsXCircle}
          subtitle="Returned unsigned or queried"
        />
      </div>

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Downloaded Documents Library
          </h1>
          <p className="text-sm text-gray-500">
            Manage exported PDF batches and track barrister return feedback
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-sm w-full">
          <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search batches by title, barrister, or site..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
          />
        </div>
      </div>

      {/* Grid of PDF Documents */}
      {filteredDocuments.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-gray-200 bg-secondary">
          <FaFilePdf className="mx-auto text-gray-300 size-12 mb-3" />
          <h4 className="text-base font-semibold text-gray-700">
            No downloaded batch documents found
          </h4>
          <p className="text-xs text-gray-400 mt-1">
            Documents exported from the dashboard will be automatically tracked in this library.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocuments.map((doc) => {
            const hasFeedback = Boolean(doc.feedback);
            return (
              <div
                key={doc.id}
                className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-2xs hover:shadow-md hover:border-primary/30 transition duration-200 p-5 justify-between"
              >
                <div>
                  {/* Top Header Card */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-red-50 text-red-600 border border-red-100 shrink-0">
                        <FaFilePdf className="size-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                          {doc.title}
                        </h3>
                        <p className="text-[11px] text-gray-400 font-mono truncate max-w-[200px]">
                          {doc.filename}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full shrink-0 ${
                        hasFeedback
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {hasFeedback ? "Feedback Recorded" : "Awaiting Return"}
                    </span>
                  </div>

                  {/* Batch Details */}
                  <div className="bg-secondary p-3 rounded-lg border border-primary/10 text-xs space-y-1.5 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Export Type:</span>
                      <span className="font-semibold text-gray-800 capitalize">
                        {doc.download_type.replace(/_/g, " ")}
                      </span>
                    </div>
                    {doc.site_location && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">Site / Estate:</span>
                        <span className="font-semibold text-gray-800 truncate max-w-[150px]">
                          {doc.site_location}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Total Entries:</span>
                      <span className="font-semibold text-primary">
                        {doc.total_entries} {doc.total_entries === 1 ? "entry" : "entries"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Export Date:</span>
                      <span className="text-gray-700">
                        {formatISODateToCustom(doc.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Feedback Details (if recorded) */}
                  {hasFeedback && doc.feedback && (
                    <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/70 mb-4 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-800 font-semibold border-b border-gray-200 pb-1.5">
                        <BsChatSquareText className="text-primary size-3.5" />
                        <span>Barrister Feedback Record</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Returned by:</span>
                        <span className="font-medium text-gray-900">
                          {doc.feedback.barrister_name}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 pt-1 text-center">
                        <div className="bg-white p-1.5 rounded border border-gray-200">
                          <p className="text-[10px] text-gray-400 uppercase">Sent</p>
                          <p className="font-bold text-gray-800">
                            {doc.feedback.total_sent}
                          </p>
                        </div>
                        <div className="bg-emerald-50/60 p-1.5 rounded border border-emerald-200">
                          <p className="text-[10px] text-emerald-600 uppercase">Signed</p>
                          <p className="font-bold text-emerald-700">
                            {doc.feedback.signed_count}
                          </p>
                        </div>
                        <div className="bg-red-50/60 p-1.5 rounded border border-red-200">
                          <p className="text-[10px] text-red-600 uppercase">Unsigned</p>
                          <p className="font-bold text-red-700">
                            {doc.feedback.unsigned_count}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-gray-400">Date Returned:</span>
                        <span className="text-gray-700">{doc.feedback.date_returned}</span>
                      </div>
                      {doc.feedback.remarks && (
                        <p className="text-gray-600 italic pt-1 border-t border-gray-200">
                          "{doc.feedback.remarks}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveFeedbackModalDoc(doc)}
                    className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
                      hasFeedback
                        ? "bg-secondary text-primary border border-primary/20 hover:bg-secondary/70"
                        : "bg-primary text-white hover:bg-primary/90 shadow-2xs"
                    }`}
                  >
                    <BsChatSquareText size={13} />
                    <span>
                      {hasFeedback ? "Update Feedback" : "Submit Feedback"}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Feedback Modal */}
      {activeFeedbackModalDoc && (
        <SubmitFeedbackModal
          document={activeFeedbackModalDoc}
          onClose={() => setActiveFeedbackModalDoc(null)}
          onSuccess={handleFeedbackSaved}
        />
      )}
    </div>
  );
};

export default DocumentLibrary;
