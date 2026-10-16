/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Question, RoomSettings, Player } from '../types/game';
import { SAMPLE_CIVIC_QUESTIONS } from '../data/defaultQuestions';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Zap,
  Users,
  UserX,
  FileDown,
  RotateCcw,
  Check,
  X,
} from 'lucide-react';

interface HostDashboardProps {
  questions: Question[];
  settings: RoomSettings;
  players: Record<string, Player>;
  onClose: () => void;
  onUpdateQuestions: (questions: Question[]) => void;
  onUpdateSettings: (settings: { timerSeconds?: number; speedBonus?: boolean; streakBonus?: boolean }) => void;
  onKickPlayer: (targetId: string) => void;
}

export const HostDashboard: React.FC<HostDashboardProps> = ({
  questions,
  settings,
  players,
  onClose,
  onUpdateQuestions,
  onUpdateSettings,
  onKickPlayer,
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'settings' | 'players'>('questions');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(questions.length === 0);

  // New question form state
  const [statement, setStatement] = useState('');
  const [answer, setAnswer] = useState<boolean>(true);
  const [explanation, setExplanation] = useState('');
  const [category, setCategory] = useState('Pendidikan Kewarganegaraan');
  const [duration, setDuration] = useState<number>(settings.timerSeconds || 10);

  // Import JSON Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const handleSaveQuestion = () => {
    if (!statement.trim()) return;

    if (editingQuestion) {
      const updated = questions.map((q) =>
        q.id === editingQuestion.id
          ? {
              ...q,
              statement: statement.trim(),
              answer,
              explanation: explanation.trim() || (answer ? 'Pernyataan ini BENAR.' : 'Pernyataan ini SALAH.'),
              category: category.trim() || 'Pendidikan Kewarganegaraan',
              duration,
            }
          : q
      );
      onUpdateQuestions(updated);
      setEditingQuestion(null);
    } else {
      const newQ: Question = {
        id: 'q_' + Date.now(),
        statement: statement.trim(),
        answer,
        explanation: explanation.trim() || (answer ? 'Pernyataan ini BENAR.' : 'Pernyataan ini SALAH.'),
        category: category.trim() || 'Pendidikan Kewarganegaraan',
        duration,
      };
      onUpdateQuestions([...questions, newQ]);
      setIsAddingNew(false);
    }

    setStatement('');
    setExplanation('');
    setCategory('Pendidikan Kewarganegaraan');
  };

  const handleDeleteQuestion = (id: string) => {
    const filtered = questions.filter((q) => q.id !== id);
    onUpdateQuestions(filtered);
  };

  const handleClearAllQuestions = () => {
    if (confirm('Kosongkan semua soal dalam room ini?')) {
      onUpdateQuestions([]);
      setIsAddingNew(true);
    }
  };

  const handleLoadSample = () => {
    if (confirm('Muat contoh paket soal Civic / PKn (6 soal)?')) {
      onUpdateQuestions([...SAMPLE_CIVIC_QUESTIONS]);
    }
  };

  const handleImportJson = () => {
    try {
      setImportError(null);
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setImportError('Format JSON harus berupa array pertanyaan [ { statement, answer, ... } ]');
        return;
      }
      const validQuestions: Question[] = parsed.map((item, i) => ({
        id: item.id || `imported_${Date.now()}_${i}`,
        statement: String(item.statement || 'Soal Tanpa Judul'),
        answer: Boolean(item.answer),
        explanation: String(item.explanation || (item.answer ? 'BENAR' : 'SALAH')),
        category: String(item.category || 'Trivia'),
        duration: Number(item.duration) || 10,
      }));

      onUpdateQuestions(validQuestions);
      setShowImportModal(false);
      setImportJsonText('');
    } catch {
      setImportError('JSON tidak valid. Pastikan format tanda kutip dan kurung siku sudah benar.');
    }
  };

  const startEdit = (q: Question) => {
    setEditingQuestion(q);
    setIsAddingNew(false);
    setStatement(q.statement);
    setAnswer(q.answer);
    setExplanation(q.explanation);
    setCategory(q.category);
    setDuration(q.duration || 10);
  };

  const startNew = () => {
    setEditingQuestion(null);
    setIsAddingNew(true);
    setStatement('');
    setAnswer(true);
    setExplanation('');
    setCategory('Trivia Umum');
    setDuration(settings.timerSeconds || 10);
  };

  const playersList = Object.values(players);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border-2 border-indigo-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Dashboard Host Kuis</h2>
              <p className="text-xs text-slate-400">Kelola soal, durasi waktu, dan moderasi pemain</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-4 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'questions'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Bank Soal ({questions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Aturan & Timer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('players')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'players'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar Pemain ({playersList.length})</span>
          </button>
        </div>

        {/* BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* TAB 1: BANK SOAL */}
          {activeTab === 'questions' && (
            <div className="flex flex-col gap-4">
              {/* Top Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={startNew}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Soal Baru</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowImportModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <FileDown className="w-4 h-4 text-emerald-400" />
                    <span>Impor JSON</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer border border-white/10"
                    title="Muat contoh soal bawaan jika diperlukan"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Muat Contoh Soal (Opsional)</span>
                  </button>
                  {questions.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllQuestions}
                      className="px-3 py-1.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Kosongkan Semua</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Empty state when no questions exist */}
              {questions.length === 0 && !isAddingNew && (
                <div className="bg-slate-950/60 border border-dashed border-white/20 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1 max-w-sm">
                    <h4 className="font-extrabold text-white text-base">Bank Soal Masih Kosong</h4>
                    <p className="text-xs text-slate-400">
                      Guru / Host dapat menginput soal sendiri secara manual atau mengimpor JSON.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={startNew}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Input Soal Baru</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadSample}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-white/10 transition cursor-pointer"
                    >
                      Muat Contoh Soal
                    </button>
                  </div>
                </div>
              )}

              {/* Add/Edit Form Box */}
              {(isAddingNew || editingQuestion) && (
                <div className="bg-slate-950/80 border-2 border-indigo-500/50 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                      {editingQuestion ? 'Edit Soal' : 'Tambah Soal Baru'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNew(false);
                        setEditingQuestion(null);
                      }}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Batal
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Pernyataan Kuis:
                    </label>
                    <textarea
                      value={statement}
                      onChange={(e) => setStatement(e.target.value)}
                      placeholder="Contoh: Madu alami tidak pernah membusuk jika disimpan dengan benar."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Kunci Jawaban:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setAnswer(true)}
                          className={`py-2 rounded-xl text-xs font-black transition border flex items-center justify-center gap-1 cursor-pointer ${
                            answer === true
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" /> BENAR
                        </button>
                        <button
                          type="button"
                          onClick={() => setAnswer(false)}
                          className={`py-2 rounded-xl text-xs font-black transition border flex items-center justify-center gap-1 cursor-pointer ${
                            answer === false
                              ? 'bg-rose-500 text-white border-rose-400'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" /> SALAH
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Kategori:
                      </label>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Sains, Hewan, dll."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Durasi Menjawab:
                      </label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white cursor-pointer"
                      >
                        <option value={5}>5 Detik (Super Cepat)</option>
                        <option value={10}>10 Detik (Standar)</option>
                        <option value={15}>15 Detik (Santai)</option>
                        <option value={20}>20 Detik (Panjang)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Penjelasan Edukatif (Muncul saat pembahasan):
                    </label>
                    <input
                      type="text"
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      placeholder="Jelaskan alasan mengapa jawaban tersebut benar atau salah..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white placeholder-slate-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveQuestion}
                    className="self-end px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer shadow"
                  >
                    Simpan Pertanyaan
                  </button>
                </div>
              )}

              {/* Questions List */}
              <div className="flex flex-col gap-2">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-800 transition"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-black text-slate-400 shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              q.answer
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                            }`}
                          >
                            {q.answer ? '✓ BENAR' : '✗ SALAH'}
                          </span>
                          <span className="text-[10px] font-bold text-amber-300 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-700">
                            {q.category}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ⏱️ {q.duration || 10}s
                          </span>
                        </div>
                        <p className="text-sm font-bold text-white leading-tight">
                          {q.statement}
                        </p>
                        <p className="text-xs text-slate-400 font-normal line-clamp-1">
                          {q.explanation}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => startEdit(q)}
                        className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition cursor-pointer"
                        title="Edit Soal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 transition cursor-pointer"
                        title="Hapus Soal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ATURAN & TIMER */}
          {activeTab === 'settings' && (
            <div className="flex flex-col gap-5 max-w-xl">
              <div>
                <label className="text-sm font-black text-white block mb-1">
                  Durasi Standar Hitung Mundur per Soal:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2">
                  {[5, 10, 15, 20].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => onUpdateSettings({ timerSeconds: sec })}
                      className={`p-3 rounded-2xl text-center font-black text-sm border transition cursor-pointer ${
                        settings.timerSeconds === sec
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      {sec} Detik
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-3 border-t border-slate-800">
                <label className="text-sm font-black text-white block">
                  Aturan Penilaian & Bonus:
                </label>

                {/* Speed Bonus Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      Bonus Kecepatan Menjawab (Speed Bonus)
                    </span>
                    <span className="text-xs text-slate-400">
                      Pemain yang menjawab lebih cepat mendapatkan hingga +500 poin ekstra
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.speedBonus}
                    onChange={(e) => onUpdateSettings({ speedBonus: e.target.checked })}
                    className="w-5 h-5 accent-indigo-500 rounded cursor-pointer"
                  />
                </div>

                {/* Streak Bonus Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      🔥 Bonus Runtun Benar (Streak Bonus)
                    </span>
                    <span className="text-xs text-slate-400">
                      Jawaban berturut-turut yang benar melipatgandakan poin bonus
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.streakBonus}
                    onChange={(e) => onUpdateSettings({ streakBonus: e.target.checked })}
                    className="w-5 h-5 accent-indigo-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DAFTAR PEMAIN & MODERASI */}
          {activeTab === 'players' && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-400">
                Sebagai Host, Anda dapat melihat seluruh peserta yang terhubung (maks. 40 orang) dan mengeluarkan pemain yang tidak diinginkan.
              </p>

              <div className="flex flex-col gap-2">
                {playersList.map((player) => (
                  <div
                    key={player.id}
                    className="bg-slate-800/60 border border-slate-700/80 p-3 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <div className="flex flex-col">
                        <span className="font-black text-sm text-white flex items-center gap-2">
                          {player.name}
                          {player.isHost && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/40">
                              Host
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-slate-400">
                          Skor Saat Ini: {player.score} Pts • {player.correctAnswers} Benar
                        </span>
                      </div>
                    </div>

                    {!player.isHost && (
                      <button
                        type="button"
                        onClick={() => onKickPlayer(player.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Keluarkan</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* IMPORT JSON MODAL */}
        {showImportModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-5 flex flex-col gap-3 shadow-2xl">
              <h3 className="text-base font-black text-white">Impor Bank Soal (Format JSON)</h3>
              <p className="text-xs text-slate-400">
                Tempelkan array JSON berisi daftar soal:
              </p>
              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder={`[\n  {\n    "statement": "Bumi berbentuk bulat pepat.",\n    "answer": true,\n    "explanation": "BENAR, bumi tidak bulat sempurna...",\n    "category": "Sains"\n  }\n]`}
                rows={8}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-xs text-emerald-400 focus:outline-none"
              />
              {importError && (
                <span className="text-xs text-rose-400 font-bold">{importError}</span>
              )}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleImportJson}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer"
                >
                  Impor Sekarang
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
