"use client";

import React, { useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Edit3, Eye, GitCommit, ExternalLink, Save, CheckCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/dashboard/Sidebar";
import NoteCalendar from "@/components/notes/NoteCalendar";
import { useNote } from "@/hooks/useNotes";
import { marked } from "marked";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function NotesPage() {
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const { note, loading, saveNote, deleteNote } = useNote(selectedDate);
  
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Sync internal content with fetched note
  React.useEffect(() => {
    if (note) {
      setContent(note.content || "");
      setSaveStatus("saved");
    }
  }, [note]);

  // Autosave Logic
  React.useEffect(() => {
    if (saveStatus === "unsaved") {
      const timer = setTimeout(() => {
        handleSave(content);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [content, saveStatus]);

  const handleSave = async (text: string) => {
    setSaveStatus("saving");
    try {
      await saveNote(text);
      setSaveStatus("saved");
    } catch (err) {
      setSaveStatus("unsaved");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNote();
      setIsDeleteDialogOpen(false);
      setContent("");
    } catch (err) {
      console.error(err);
    }
  };

  const formattedDate = dayjs(selectedDate).locale("id").format("dddd, D MMMM YYYY");
  const isToday = selectedDate === dayjs().format("YYYY-MM-DD");

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      {/* PERSISTENT SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* NOTES SUB-SIDEBAR (Calendar) */}
        <aside className="w-80 border-r border-white/5 flex flex-col shrink-0 bg-[#0a0a0a]">
          <div className="p-8 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
                <CalendarIcon size={20} />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-none">Journal</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Dev Notes</p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <NoteCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
          </div>
        </aside>

        {/* MAIN EDITOR AREA */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden bg-transparent">
          {/* Editor Header */}
          <header className="px-10 py-6 border-b border-white/5 flex items-center justify-between bg-[#0a0a0a]/50 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold tracking-tight">{formattedDate}</h2>
              {isToday && (
                <span className="px-2 py-0.5 bg-green-500 text-black text-[10px] font-black uppercase tracking-widest rounded-sm shadow-[0_0_10px_rgba(74,222,128,0.3)]">
                  Today
                </span>
              )}
              <div className="flex items-center gap-2 ml-4">
                {saveStatus === "saving" ? (
                  <span className="text-[10px] text-yellow-500 animate-pulse font-bold uppercase tracking-widest">Saving...</span>
                ) : saveStatus === "saved" ? (
                  <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle size={10} /> Saved
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPreview(!isPreview)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                  isPreview 
                    ? "bg-white text-black border-white" 
                    : "bg-white/5 text-gray-400 border-white/5 hover:text-white hover:bg-white/10"
                }`}
              >
                {isPreview ? <Edit3 size={14} /> : <Eye size={14} />}
                {isPreview ? "Edit Note" : "Preview"}
              </button>

              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                    <Trash2 size={18} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#0d1117] border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle>Delete this note?</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      This action cannot be undone. Your note for {formattedDate} will be permanently removed.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-4 gap-2">
                    <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="text-gray-400">Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete} className="bg-red-500 hover:bg-red-600 font-bold">Yes, Delete</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          {/* Editor Content */}
          <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
            <div className="max-w-4xl mx-auto space-y-12">
              {loading && !content ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/3 bg-white/5" />
                  <Skeleton className="h-64 w-full bg-white/5 rounded-2xl" />
                </div>
              ) : (
                <div className="min-h-[500px]">
                  {isPreview ? (
                    <div 
                      className="prose prose-invert max-w-none prose-emerald"
                      dangerouslySetInnerHTML={{ __html: marked.parse(content || "_No content for this day._") }}
                    />
                  ) : (
                    <textarea
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value);
                        setSaveStatus("unsaved");
                      }}
                      placeholder="What did you build today? Supports Markdown..."
                      className="w-full h-full min-h-[500px] bg-transparent resize-none focus:outline-none font-mono text-gray-200 text-lg leading-relaxed placeholder:text-gray-700 border-none p-0"
                    />
                  )}
                </div>
              )}

              {/* Linked Commits Section */}
              <div className="pt-12 border-t border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <GitCommit size={14} className="text-green-500" /> Linked GitHub Activity
                  </h3>
                </div>

                <div className="grid gap-3">
                  {(note?.linked_commits || []).length > 0 ? (
                    note?.linked_commits.map((commit: any, idx: number) => (
                      <a
                        key={idx}
                        href={commit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-green-500/30 transition-all group"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-200 truncate group-hover:text-white transition-colors">{commit.message}</p>
                          <p className="text-[10px] text-gray-500 mt-1 font-mono uppercase">Repo: {commit.repo_name}</p>
                        </div>
                        <ExternalLink size={14} className="text-gray-700 group-hover:text-green-500 transition-colors" />
                      </a>
                    ))
                  ) : (
                    <div className="py-10 text-center border border-dashed border-white/5 rounded-2xl">
                      <p className="text-xs text-gray-600 font-medium tracking-wide">No commits found for this date.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
