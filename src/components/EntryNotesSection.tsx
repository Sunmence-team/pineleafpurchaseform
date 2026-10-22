import React, { useState, useEffect, useCallback } from "react";
import { FaRegCommentDots, FaUserCircle, FaPaperPlane } from "react-icons/fa";
import { toast } from "sonner";
import { format } from "date-fns";
import { api, getErrorMessage } from "../helpers/api";
import { useUser } from "../hooks/useUser";
import ActionButton from "./ui/ActionButton";

export interface EntryNote {
  id: string | number;
  entry_id?: string | number;
  note: string;
  author_name: string;
  author_email?: string;
  author_role?: string;
  created_at: string;
}

const NOTES_STORAGE_PREFIX = "pineleaf_entry_notes_";

export const getStoredEntryNotes = (entryId: string | number): EntryNote[] => {
  try {
    const raw = localStorage.getItem(`${NOTES_STORAGE_PREFIX}${entryId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredEntryNotes = (
  entryId: string | number,
  notes: EntryNote[]
) => {
  try {
    localStorage.setItem(
      `${NOTES_STORAGE_PREFIX}${entryId}`,
      JSON.stringify(notes)
    );
  } catch (e) {
    console.error("Failed to save entry notes:", e);
  }
};

interface EntryNotesSectionProps {
  entryId: string | number;
}

const EntryNotesSection: React.FC<EntryNotesSectionProps> = ({ entryId }) => {
  const { user, role } = useUser();
  const [notes, setNotes] = useState<EntryNote[]>(() =>
    getStoredEntryNotes(entryId)
  );
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Attempt API fetch if endpoint is provided by backend
      const response = await api.get(`/api/applications/${entryId}/notes`);
      const apiNotes = response.data?.data || response.data || [];
      if (Array.isArray(apiNotes) && apiNotes.length > 0) {
        setNotes(apiNotes);
        saveStoredEntryNotes(entryId, apiNotes);
      }
    } catch {
      // Endpoint may not be ready on backend yet; fall back safely to stored notes
      const local = getStoredEntryNotes(entryId);
      setNotes(local);
    } finally {
      setIsLoading(false);
    }
  }, [entryId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newNote.trim();
    if (!trimmed) {
      toast.error("Please enter note text");
      return;
    }

    setIsSubmitting(true);

    const authorName =
      user?.full_name ||
      (user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : null) ||
      user?.username ||
      user?.email ||
      "System User";

    const notePayload: EntryNote = {
      id: Date.now(),
      entry_id: entryId,
      note: trimmed,
      author_name: authorName,
      author_email: user?.email,
      author_role: role || undefined,
      created_at: new Date().toISOString(),
    };

    try {
      // 1. Try sending to backend
      try {
        const res = await api.post(`/api/applications/${entryId}/notes`, {
          note: trimmed,
        });
        if (res.data?.data) {
          notePayload.id = res.data.data.id || notePayload.id;
        }
      } catch (err) {
        console.warn("Backend notes endpoint fallback to local:", err);
      }

      // 2. Persist in local storage
      const currentStored = getStoredEntryNotes(entryId);
      const updated = [notePayload, ...currentStored];
      saveStoredEntryNotes(entryId, updated);
      setNotes(updated);

      toast.success("Note added successfully");
      setNewNote("");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to add note"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FaRegCommentDots className="text-primary size-5" />
          <h3 className="text-lg md:text-xl font-bold text-gray-900">
            Entry Notes & Activity
          </h3>
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-secondary text-primary border border-primary/20">
            {notes.length}
          </span>
        </div>
      </div>

      {/* Add Note Form */}
      <form onSubmit={handleAddNote} className="mb-6">
        <div className="bg-secondary p-4 rounded-xl border border-primary/10">
          <label
            htmlFor="new-entry-note"
            className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2"
          >
            Add a Note / Remark
          </label>
          <textarea
            id="new-entry-note"
            rows={3}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write a note regarding this purchase entry (status changes, barrister follow-up, client remarks)..."
            className="w-full p-3 rounded-lg border border-gray-300 bg-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition resize-y"
          />
          <div className="flex justify-between items-center mt-3 pt-2 border-t border-primary/10">
            <span className="text-xs text-gray-400">
              Posting as:{" "}
              <strong className="text-gray-700">
                {user?.full_name || user?.email || "Current User"}
              </strong>
            </span>
            <ActionButton
              text="Post Note"
              loadingText="Posting..."
              icon={<FaPaperPlane size={12} />}
              loading={isSubmitting}
              disabled={isSubmitting || !newNote.trim()}
            />
          </div>
        </div>
      </form>

      {/* Notes List / Timeline */}
      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-primary"></div>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
          <FaRegCommentDots className="mx-auto text-gray-300 size-8 mb-2" />
          <p className="text-sm font-medium text-gray-500">
            No notes added to this entry yet.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Use the box above to record internal notes or progress updates.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs hover:border-primary/30 transition"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <FaUserCircle className="text-gray-400 size-5 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-gray-900">
                      {item.author_name}
                    </span>
                    {item.author_role && (
                      <span className="ml-2 px-2 py-0.5 text-[10px] uppercase font-semibold rounded bg-gray-100 text-gray-600">
                        {item.author_role}
                      </span>
                    )}
                  </div>
                </div>
                <time className="text-xs text-gray-400 whitespace-nowrap">
                  {item.created_at
                    ? format(new Date(item.created_at), "dd MMM yyyy, hh:mm a")
                    : ""}
                </time>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap pl-7">
                {item.note}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EntryNotesSection;
