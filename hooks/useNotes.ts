"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";

export interface Note {
  id: string;
  date: string;
  content: string;
  linked_commits: any[];
  updated_at: string;
}

export interface NotePreview {
  id: string;
  date: string;
  content_preview: string;
  has_content: boolean;
}

export function useNote(date: string) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNote = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notes/${date}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch note");
      setNote(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async (content: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notes/${date}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save note");
      setNote(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notes/${date}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete note");
      }
      setNote({ date, content: "", linked_commits: [], id: "", updated_at: "" });
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (date) fetchNote();
  }, [date]);

  return { note, loading, error, saveNote, deleteNote, refresh: fetchNote };
}

export function useNoteCalendar(month: string) {
  const [notes, setNotes] = useState<NotePreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notes?month=${month}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch calendar");
      setNotes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (month) fetchCalendar();
  }, [month]);

  return { notes, loading, error, refresh: fetchCalendar };
}
