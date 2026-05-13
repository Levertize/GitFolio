"use client";

import React from "react";
import { GitCommit, ExternalLink } from "lucide-react";
import { useNote } from "@/hooks/useNotes";

interface LinkedCommitsProps {
  date: string;
}

export default function LinkedCommits({ date }: LinkedCommitsProps) {
  const { note, loading } = useNote(date);

  const commits = note?.linked_commits || [];

  if (loading && !note) {
    return (
      <div className="space-y-3 mt-8">
        <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
        <div className="h-12 w-full bg-white/5 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-12 pt-8 border-t border-white/5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <GitCommit size={16} className="text-green-500" /> Commits hari ini
        </h3>
        <span className="text-[10px] font-bold text-gray-600 bg-white/5 px-2 py-0.5 rounded">
          {commits.length} commits
        </span>
      </div>

      <div className="space-y-2">
        {commits.length > 0 ? (
          commits.map((commit: any, index: number) => (
            <a
              key={commit.sha || index}
              href={commit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 truncate font-medium group-hover:text-white transition-colors">
                  {commit.message}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  In repo: <span className="text-green-500/60 font-mono">{commit.repo_name}</span>
                </p>
              </div>
              <ExternalLink size={12} className="text-gray-600 group-hover:text-gray-400" />
            </a>
          ))
        ) : (
          <div className="py-6 text-center border-2 border-dashed border-white/5 rounded-xl">
            <p className="text-xs text-gray-600 italic font-medium">Tidak ada commit pada hari ini</p>
          </div>
        )}
      </div>
    </div>
  );
}
