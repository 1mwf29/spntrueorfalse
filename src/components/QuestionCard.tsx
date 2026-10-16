/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RoomState } from '../types/game';
import { Timer, HelpCircle, Flame } from 'lucide-react';

interface QuestionCardProps {
  roomState: RoomState;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ roomState }) => {
  const currentQ = roomState.currentQuestion;
  const timeRemaining = roomState.timeRemaining;
  const totalDuration = currentQ?.duration || roomState.settings.timerSeconds || 10;
  const progressRatio = Math.max(0, Math.min(1, timeRemaining / totalDuration));

  // Determine urgency color
  const isUrgent = timeRemaining <= 3;
  const timerColor = isUrgent
    ? 'bg-rose-500 text-rose-200'
    : timeRemaining <= 5
    ? 'bg-amber-500 text-amber-100'
    : 'bg-emerald-500 text-emerald-100';

  return (
    <div className="w-full bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-white/10 p-4 sm:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col gap-3">
      {/* Dynamic Animated Progress Timer Bar at Top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            isUrgent
              ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-pulse'
              : 'bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]'
          }`}
          style={{ width: `${progressRatio * 100}%` }}
        />
      </div>

      {/* Header Meta: Category, Question Number, Timer */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        {/* Category Badge */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-emerald-300 shadow-sm">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>{currentQ?.category || 'Trivia Umum'}</span>
        </div>

        {/* Question Counter */}
        <div className="text-xs sm:text-sm font-extrabold text-slate-300">
          Soal <span className="text-emerald-400">{roomState.currentQuestionIndex + 1}</span> / {roomState.totalQuestions}
        </div>

        {/* Circular / Pill Timer */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-xs sm:text-sm shadow-md transition-all ${
            isUrgent ? 'scale-110 animate-bounce ring-2 ring-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.6)]' : ''
          } ${timerColor}`}
        >
          <Timer className="w-4 h-4" />
          <span className="tabular-nums tracking-wide">{timeRemaining}s</span>
        </div>
      </div>

      {/* Main Question Statement */}
      <div className="min-h-[64px] sm:min-h-[72px] flex items-center justify-center text-center px-2">
        <h2 className="text-lg sm:text-2xl font-black text-white leading-snug tracking-tight drop-shadow-sm">
          {currentQ?.statement || 'Memuat pertanyaan...'}
        </h2>
      </div>

      {/* Speed & Streak Bonus Hint */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/[0.06] pt-2 px-1">
        <span className="flex items-center gap-1 text-amber-400/90 font-medium">
          <Flame className="w-3.5 h-3.5 text-amber-400" /> Jawab cepat untuk bonus poin hingga +500!
        </span>
        <span className="text-slate-400 font-medium hidden sm:inline">Ketuk sisi Kiri (BENAR) atau Kanan (SALAH)</span>
      </div>
    </div>
  );
};
