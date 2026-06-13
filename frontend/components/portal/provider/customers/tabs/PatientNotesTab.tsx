"use client";

import { useState } from "react";
import { usePatients } from "@/context/PatientsProvider";
import type { PatientNote } from "@/lib/patients/types";
import { toast } from "@/lib/toast";

type PatientNotesTabProps = {
  patientId: string;
  notes: PatientNote[];
};

export function PatientNotesTab({ patientId, notes }: PatientNotesTabProps) {
  const { addNote, deleteNote } = usePatients();
  const [draft, setDraft] = useState("");

  function handleSave() {
    const content = draft.trim();
    if (!content) return;
    addNote(patientId, content);
    setDraft("");
    toast.success("Note saved.");
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-deep-teal/10 p-4">
        <label htmlFor="patient-note" className="mb-2 block text-sm font-light text-deep-teal">
          Add Note
        </label>
        <textarea
          id="patient-note"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          placeholder="Write a clinical or administrative note…"
          className="w-full resize-none rounded-xl border border-deep-teal/15 px-3 py-2 text-sm text-deep-teal outline-none focus:border-pacific-teal"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={!draft.trim()}
          className="mt-3 rounded-full bg-deep-teal px-4 py-2 text-sm font-light text-pure-white hover:bg-pacific-teal disabled:opacity-40"
        >
          Save
        </button>
      </div>

      <div className="space-y-3">
        {[...notes]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((note) => (
            <article key={note.id} className="rounded-xl border border-deep-teal/10 bg-deep-teal/[0.02] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-deep-teal">{note.content}</p>
                  <p className="mt-2 text-xs text-deep-teal/45">
                    {note.author} · {new Date(note.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    deleteNote(patientId, note.id);
                    toast.success("Note deleted.");
                  }}
                  className="shrink-0 text-xs text-deep-teal/45 hover:text-coral-blush"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        {notes.length === 0 ? (
          <p className="text-sm text-deep-teal/50">No notes recorded yet.</p>
        ) : null}
      </div>
    </div>
  );
}
