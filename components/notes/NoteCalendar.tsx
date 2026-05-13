"use client";

import React, { useState } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNoteCalendar } from "@/hooks/useNotes";

interface NoteCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export default function NoteCalendar({ selectedDate, onDateSelect }: NoteCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(dayjs().format("YYYY-MM"));
  const { notes, loading } = useNoteCalendar(currentMonth);

  const startOfMonth = dayjs(currentMonth).startOf("month");
  const endOfMonth = dayjs(currentMonth).endOf("month");
  const daysInMonth = endOfMonth.date();
  const startDay = startOfMonth.day(); // 0 for Sunday

  const prevMonth = () => setCurrentMonth(dayjs(currentMonth).subtract(1, "month").format("YYYY-MM"));
  const nextMonth = () => setCurrentMonth(dayjs(currentMonth).add(1, "month").format("YYYY-MM"));

  const calendarDays = [];
  // Padding for start of month
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }
  // Actual days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(startOfMonth.date(i).format("YYYY-MM-DD"));
  }

  const hasNote = (date: string) => {
    return notes.some((n) => n.date === date && n.has_content);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">{dayjs(currentMonth).format("MMMM YYYY")}</h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-1 hover:bg-white/5 rounded-md border border-white/10 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button onClick={nextMonth} className="p-1 hover:bg-white/5 rounded-md border border-white/10 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="text-[10px] uppercase font-bold text-gray-500 py-2">
            {day}
          </div>
        ))}

        {calendarDays.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} />;
          
          const isSelected = date === selectedDate;
          const isToday = date === dayjs().format("YYYY-MM-DD");
          const hasData = hasNote(date);

          return (
            <button
              key={date}
              onClick={() => onDateSelect(date)}
              className={`
                relative h-10 w-10 flex flex-col items-center justify-center rounded-lg text-sm transition-all
                ${isSelected ? "bg-green-500 text-black font-bold" : "hover:bg-white/5 text-gray-300"}
                ${isToday && !isSelected ? "border border-green-500/50 text-green-400" : ""}
              `}
            >
              {dayjs(date).date()}
              {hasData && !isSelected && (
                <div className="absolute bottom-1.5 w-1 h-1 bg-green-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
