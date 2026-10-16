/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, CheckCircle2, XCircle, X, Sparkles, Download } from 'lucide-react';
import { Question } from '../types/game';
import { SAMPLE_CIVIC_QUESTIONS } from '../data/defaultQuestions';
import { sound } from '../utils/audio';

interface QuestionBankModalProps {
  onClose: () => void;
  onSelectForRoom?: (questions: Question[]) => void;
}

const STORAGE_KEY = 'civic_custom_bank';

export function QuestionBankModal({ onClose, onSelectForRoom }: QuestionBankModalProps) {
  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // New question form state
  const [statement, setStatement] = useState('');
  const [answer, setAnswer] = useState<boolean>(true);
  const [explanation, setExplanation] = useState('');
  const [category, setCategory] = useState('Pendidikan Pancasila');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
    } catch (e) {
      console.error(e);
    }
  }, [questions]);

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statement.trim()) return;

    const newQ: Question = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      statement: statement.trim(),
      answer,
      explanation: explanation.trim() || (answer ? 'Pernyataan ini BENAR.' : 'Pernyataan ini SALAH.'),
      category: category.trim() || 'Umum',
      duration: 15,
    };

    setQuestions((prev) => [...prev, newQ]);
    setStatement('');
    setExplanation('');
    sound.playCorrect();
  };

  const handleDelete = (id: string) => {
    sound.playBoing();
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleLoadSamples = () => {
    sound.playBoing();
    setQuestions(SAMPLE_CIVIC_QUESTIONS);
  };

  const handleClearAll = () => {
    if (confirm('Kosongkan semua soal di Bank Soal?')) {
      sound.playBoing();
      setQuestions([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#0d1322] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col gap-4 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>BANK SOAL GURU</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  {questions.length} Soal
                </span>
              </h2>
              <p className="text-xs text-slate-400">Siapkan & kelola soal kuis True/False mandiri</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Tools */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleLoadSamples}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-yellow-300 border border-yellow-400/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Muat Contoh 10 Soal PKn</span>
          </button>
          {questions.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-bold transition cursor-pointer"
            >
              Kosongkan Semua
            </button>
          )}
        </div>

        {/* Question List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[220px]">
          {questions.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-2xl border-2 border-dashed border-white/10 text-slate-400 flex flex-col items-center gap-2">
              <BookOpen className="w-8 h-8 text-slate-500" />
              <p className="text-sm font-bold">Belum ada soal di Bank Soal</p>
              <p className="text-xs text-slate-500 max-w-sm">
                Tambahkan pernyataan kuis di bawah ini atau klik "Muat Contoh 10 Soal PKn" untuk latihan instan.
              </p>
            </div>
          ) : (
            questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 flex items-start justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      #{idx + 1}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 ${
                        q.answer ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {q.answer ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {q.answer ? 'BENAR' : 'SALAH'}
                    </span>
                    <span className="text-[10px] text-slate-400">{q.category}</span>
                  </div>
                  <p className="text-xs font-bold text-white">{q.statement}</p>
                  {q.explanation && (
                    <p className="text-[11px] text-slate-400 mt-1 italic">
                      Penjelasan: {q.explanation}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(q.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                  title="Hapus Soal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Question Form */}
        <form onSubmit={handleAddQuestion} className="bg-slate-950/70 border border-white/10 rounded-2xl p-3.5 flex flex-col gap-2.5">
          <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1">
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tambah Soal Baru</span>
          </span>

          <input
            type="text"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder="Ketik pernyataan soal (contoh: Pancasila lahir tanggal 1 Juni 1945)..."
            className="w-full bg-[#070b14] border border-white/10 focus:border-emerald-400 rounded-xl px-3 py-2 text-xs font-bold text-white placeholder-slate-500 focus:outline-none"
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block mb-1">Kunci Jawaban:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAnswer(true)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-black border transition cursor-pointer ${
                    answer === true
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-slate-900 border-white/10 text-slate-400'
                  }`}
                >
                  BENAR ✓
                </button>
                <button
                  type="button"
                  onClick={() => setAnswer(false)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-black border transition cursor-pointer ${
                    answer === false
                      ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                      : 'bg-slate-900 border-white/10 text-slate-400'
                  }`}
                >
                  SALAH ✗
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 block mb-1">Topik/Kategori:</span>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Pancasila / UUD 1945"
                className="w-full bg-[#070b14] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <input
            type="text"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Penjelasan jawaban untuk siswa (opsional)..."
            className="w-full bg-[#070b14] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!statement.trim()}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow flex items-center justify-center gap-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Simpan Soal ke Bank</span>
          </button>
        </form>
      </div>
    </div>
  );
}
