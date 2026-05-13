"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { marked } from "marked";
import { Eye, Edit3, Save } from "lucide-react";
import { useNote } from "@/hooks/useNotes";

interface NoteEditorProps {
  date: string;
}

export default function NoteEditor({ date }: NoteEditorProps) {
  const { note, loading, saveNote, refresh } = useNote(date);
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize content when note is fetched
  useEffect(() => {
    if (note) {
      setContent(note.content || "");
      setSaveStatus("saved");
    }
  }, [note]);

  // Handle manual save (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave(content);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [content]);

  const handleSave = async (text: string) => {
    if (saveStatus === "saving") return;
    setSaveStatus("saving");
    try {
      await saveNote(text);
      setSaveStatus("saved");
    } catch (err) {
      setSaveStatus("unsaved");
      console.error("Autosave failed", err);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setSaveStatus("unsaved");

    // Debounced Autosave
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      handleSave(newContent);
    }, 1500);
  };

  if (loading && !content) {
    return (
      <div className="w-full h-96 bg-white/[0.02] rounded-xl animate-pulse flex items-center justify-center border border-white/5">
        <div className="text-gray-500 text-sm">Loading your notes...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Editor Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border ${
            saveStatus === "saved" ? "text-green-500 border-green-500/30" : 
            saveStatus === "saving" ? "text-yellow-500 border-yellow-500/30" : 
            "text-gray-500 border-white/10"
          }`}>
            {saveStatus === "saved" ? "Tersimpan" : saveStatus === "saving" ? "Menyimpan..." : "Belum disimpan"}
          </span>
        </div>

        <button
          onClick={() => setIsPreview(!isPreview)}
          className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
        >
          {isPreview ? (
            <><Edit3 size={14} /> Edit Mode</>
          ) : (
            <><Eye size={14} /> Preview Markdown</>
          )}
        </button>
      </div>

      {/* Editor / Preview Area */}
      <div className="flex-1 min-h-[400px]">
        {isPreview ? (
          <div 
            className="prose prose-invert max-w-none prose-sm p-4 bg-white/[0.02] rounded-xl border border-white/5 min-h-[400px]"
            dangerouslySetInnerHTML={{ __html: marked.parse(content || "_Tidak ada isi catatan_") }}
          />
        ) : (
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="Apa yang kamu kerjain hari ini?"
            className="w-full h-full min-h-[400px] bg-transparent resize-none focus:outline-none font-mono text-gray-300 leading-relaxed placeholder:text-gray-600 border-none p-0"
          />
        )}
      </div>
    </div>
  );
}
