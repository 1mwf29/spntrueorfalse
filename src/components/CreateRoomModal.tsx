/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AvatarId, Question } from '../types/game';
import { ChibiAvatar } from './ChibiAvatar';
import { SAMPLE_CIVIC_QUESTIONS } from '../data/defaultQuestions';
import { sound } from '../utils/audio';
import {
  ArrowLeft,
  Clock,
  Zap,
  Flame,
  BookOpen,
  Sparkles,
  RefreshCw,
  Check,
  X,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  PenTool,
  Star,
  Plus,
  Trash2,
  HelpCircle,
  ListChecks,
} from 'lucide-react';

interface CreateRoomModalProps {
  initialHostName: string;
  avatarId: AvatarId;
  avatarColor: string;
  onClose: () => void;
  onCreateRoom: (params: {
    roomCode: string;
    hostName: string;
    timerSeconds: number;
    speedBonus: boolean;
    streakBonus: boolean;
    questions: Question[];
  }) => void;
}

function generateRandomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  initialHostName,
  avatarId,
  avatarColor,
  onClose,
  onCreateRoom,
}) => {
  const [hostName, setHostName] = useState(initialHostName || 'Guru PKn');
  const [roomCode, setRoomCode] = useState(() => generateRandomCode());

  // Section 1: Waktu Menjawab (5, 10, 15, 20, 30 detik)
  const [timerSeconds, setTimerSeconds] = useState<number>(15);

  // Section 2: Bonus Jawaban Cepat & Streak
  const [speedThresholdSec, setSpeedThresholdSec] = useState<number>(5);
  const [bonusPoints, setBonusPoints] = useState<number>(50);
  const [streakBonus, setStreakBonus] = useState<boolean>(true);
  const [speedBonus, setSpeedBonus] = useState<boolean>(true);

  // Section 3: Fitur Input Soal & Bank Soal (Di Halaman Kedua)
  const [questionSource, setQuestionSource] = useState<'manual' | 'sample'>('manual');
  const [questions, setQuestions] = useState<Question[]>([]);

  // Form Input Soal Mandiri
  const [newStatement, setNewStatement] = useState('');
  const [newAnswer, setNewAnswer] = useState<boolean>(true);
  const [newExplanation, setNewExplanation] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const handleRefreshCode = () => {
    sound.playBoing();
    setRoomCode(generateRandomCode());
  };

  const handleSelectSource = (src: 'manual' | 'sample') => {
    sound.playBoing();
    setQuestionSource(src);
    setErrorMsg(null);
    if (src === 'sample') {
      setQuestions([...SAMPLE_CIVIC_QUESTIONS]);
      setSuccessInfo('10 Paket Soal PKn standar berhasil dimuat ke dalam room!');
      setTimeout(() => setSuccessInfo(null), 3000);
    }
  };

  const handleAddQuestion = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!newStatement.trim()) {
      setErrorMsg('Pernyataan soal tidak boleh kosong!');
      sound.playWrong();
      return;
    }

    const createdQuestion: Question = {
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      statement: newStatement.trim(),
      answer: newAnswer,
      explanation:
        newExplanation.trim() ||
        (newAnswer ? 'Pernyataan ini BENAR.' : 'Pernyataan ini SALAH.'),
      category: 'Pendidikan Kewarganegaraan',
      duration: timerSeconds,
    };

    sound.playCorrect();
    setQuestions((prev) => [...prev, createdQuestion]);
    setNewStatement('');
    setNewExplanation('');
    setErrorMsg(null);
    setSuccessInfo(`Soal #${questions.length + 1} berhasil ditambahkan!`);
    setTimeout(() => setSuccessInfo(null), 2500);
  };

  const handleDeleteQuestion = (index: number) => {
    sound.playBoing();
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAllQuestions = () => {
    sound.playBoing();
    setQuestions([]);
  };

  const handleLoadSampleToManual = () => {
    sound.playCorrect();
    setQuestions([...SAMPLE_CIVIC_QUESTIONS]);
    setSuccessInfo('10 Contoh Soal PKn berhasil dimuat ke daftar!');
    setTimeout(() => setSuccessInfo(null), 2500);
  };

  const handleCreate = () => {
    if (!hostName.trim()) {
      setErrorMsg('Nama Guru / Host tidak boleh kosong!');
      sound.playWrong();
      return;
    }

    if (questions.length === 0) {
      setErrorMsg('Harap tambahkan minimal 1 soal sebelum membuat room!');
      sound.playWrong();
      return;
    }

    sound.playCorrect();
    onCreateRoom({
      roomCode: roomCode.trim().toUpperCase(),
      hostName: hostName.trim(),
      timerSeconds,
      speedBonus,
      streakBonus,
      questions,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0e1628] via-[#090d18] to-[#060810] border-2 border-emerald-500/30 rounded-3xl shadow-[0_0_60px_rgba(16,185,129,0.2)] flex flex-col text-slate-100 max-h-[96vh] overflow-hidden my-auto">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-44 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none -z-10" />

        {/* TOP BAR / HEADER (Matching User Mockup) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 bg-slate-950/70 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-2 -ml-1 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95 cursor-pointer flex items-center justify-center shadow"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>BUAT ROOM BARU</span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Guru Terverifikasi</span>
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Atur konfigurasi kuis & input soal sebelum mulai bermain bersama siswa
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar">
          {errorMsg && (
            <div className="bg-rose-500/20 border-2 border-rose-500/50 text-rose-200 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-lg animate-in fade-in duration-200">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successInfo && (
            <div className="bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-lg animate-in fade-in duration-200">
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successInfo}</span>
            </div>
          )}

          {/* SECTION 1: WAKTU MENJAWAB (Circle Badge 1) */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                  1
                </span>
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  WAKTU MENJAWAB
                </h3>
              </div>
              <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                {timerSeconds} Detik
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-1 pl-8">
              Batas waktu berpikir dan berlari siswa untuk setiap nomor soal kuis
            </p>

            {/* Durations 5, 10, 15, 20, 30 Detik */}
            <div className="grid grid-cols-5 gap-2 pt-1">
              {[5, 10, 15, 20, 30].map((sec) => {
                const isSelected = timerSeconds === sec;
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => {
                      sound.playBoing();
                      setTimerSeconds(sec);
                    }}
                    className={`py-2.5 rounded-2xl font-black text-xs sm:text-sm border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.35)] scale-102'
                        : 'border-white/10 bg-slate-900/60 text-slate-400 hover:text-white hover:border-white/25'
                    }`}
                  >
                    <span>{sec}</span>
                    <span className="text-[9px] uppercase font-bold text-slate-400">Detik</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: BONUS JAWABAN CEPAT (Circle Badge 2) */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                  2
                </span>
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  BONUS JAWABAN CEPAT
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-950/50 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>+Bonus Kecepatan</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-1 pl-8">
              Pemain yang masuk ke zona Benar/Salah lebih cepat akan memperoleh poin ekstra
            </p>

            {/* Threshold Box */}
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ambang Waktu Cepat:</span>
                </span>
                <span className="font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                  Di bawah {speedThresholdSec} Detik
                </span>
              </div>

              {/* Quick Choice Buttons for Speed Threshold */}
              <div className="grid grid-cols-4 gap-2">
                {[3, 5, 7, 10].map((s) => {
                  const active = speedThresholdSec === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        sound.playBoing();
                        setSpeedThresholdSec(s);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold border-2 transition cursor-pointer ${
                        active
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                          : 'border-white/10 bg-[#060911] text-slate-400 hover:text-white'
                      }`}
                    >
                      {s} Detik
                    </button>
                  );
                })}
              </div>

              {/* Sub-section: Bonus Poin */}
              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-white/5">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Bonus Poin:</span>
                </span>
                <div className="flex items-center gap-1.5">
                  {[20, 50, 100].map((pts) => {
                    const active = bonusPoints === pts;
                    return (
                      <button
                        key={pts}
                        type="button"
                        onClick={() => {
                          sound.playBoing();
                          setBonusPoints(pts);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-black border transition cursor-pointer ${
                          active
                            ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                            : 'bg-black/40 border-white/10 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        +{pts} Poin
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Streak Bonus Switch */}
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/50 border border-white/10 hover:border-white/20 transition cursor-pointer">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Bonus Streak Beruntun</span>
                  <span className="text-[10px] text-slate-400">+100 poin bertingkat bila menjawab benar berturut-turut</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={streakBonus}
                onChange={(e) => {
                  sound.playBoing();
                  setStreakBonus(e.target.checked);
                }}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* SECTION 3: FITUR INPUT SOAL & BANK SOAL (Halaman Kedua) */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                  3
                </span>
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  FITUR INPUT SOAL & BANK SOAL
                </h3>
              </div>
              <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                {questions.length} Soal Tersedia
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-1 pl-8">
              Input pertanyaan kuis secara langsung di sini sebelum memulai room
            </p>

            {/* Pilihan Sumber: Input Soal Sendiri vs Bank Soal Tersimpan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Opsi 1: Input Sendiri */}
              <button
                type="button"
                onClick={() => handleSelectSource('manual')}
                className={`p-4 rounded-2xl border-2 flex flex-col justify-between text-left gap-3 transition-all cursor-pointer relative overflow-hidden group ${
                  questionSource === 'manual'
                    ? 'bg-emerald-950/40 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                    : 'bg-slate-900/60 border-white/10 hover:border-emerald-500/30'
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
                    <PenTool className="w-5 h-5" />
                  </div>
                  {questionSource === 'manual' ? (
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs shadow">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                      Pilih
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-white">Input Soal Sendiri</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Ketik langsung materi soal kuis Bapak/Ibu Guru pada formulir di bawah ini.
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between w-full">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    ✏️ Ketik Mandiri
                  </span>
                  <span className="text-[10px] text-slate-400">{questions.length} Soal</span>
                </div>
              </button>

              {/* Opsi 2: Bank Soal Tersimpan */}
              <button
                type="button"
                onClick={() => handleSelectSource('sample')}
                className={`p-4 rounded-2xl border-2 flex flex-col justify-between text-left gap-3 transition-all cursor-pointer relative overflow-hidden group ${
                  questionSource === 'sample'
                    ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                    : 'bg-slate-900/60 border-white/10 hover:border-purple-500/30'
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-inner">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  {questionSource === 'sample' ? (
                    <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center font-black text-xs shadow">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                      Pilih
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-white">Paket 10 Soal PKn</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Paket 10 soal standar Pendidikan Kewarganegaraan (UUD 1945 & Pancasila).
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between w-full">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">
                    ⚡ Siap Pakai
                  </span>
                  <span className="text-[10px] text-purple-300 font-bold">10 Soal</span>
                </div>
              </button>
            </div>

            {/* FORM INPUT SOAL (Langsung di halaman kedua ini) */}
            <div className="bg-[#050811] border-2 border-emerald-500/30 rounded-2xl p-4 flex flex-col gap-3 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Tambah Soal Baru</span>
                </span>
                {questions.length === 0 && (
                  <button
                    type="button"
                    onClick={handleLoadSampleToManual}
                    className="text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg transition cursor-pointer"
                  >
                    + Muat Contoh Soal Cepat
                  </button>
                )}
              </div>

              {/* Textarea Pernyataan Soal */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">
                  Pernyataan Soal (True or False)
                </label>
                <textarea
                  rows={2}
                  value={newStatement}
                  onChange={(e) => {
                    setNewStatement(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Contoh: Pancasila disahkan sebagai dasar negara pada tanggal 18 Agustus 1945."
                  className="w-full bg-[#090d18] border border-white/10 focus:border-emerald-400 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition resize-none"
                />
              </div>

              {/* Kunci Jawaban (BENAR atau SALAH) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400">
                  Kunci Jawaban yang Benar
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playBoing();
                      setNewAnswer(true);
                    }}
                    className={`py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 border-2 transition cursor-pointer ${
                      newAnswer === true
                        ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>BENAR (TRUE)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playBoing();
                      setNewAnswer(false);
                    }}
                    className={`py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 border-2 transition cursor-pointer ${
                      newAnswer === false
                        ? 'bg-rose-500 text-white border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                        : 'bg-rose-950/20 text-rose-400 border-rose-500/20 hover:border-rose-500/40'
                    }`}
                  >
                    <X className="w-4 h-4 stroke-[3]" />
                    <span>SALAH (FALSE)</span>
                  </button>
                </div>
              </div>

              {/* Penjelasan / Pembahasan (Opsional) */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center justify-between">
                  <span>Penjelasan / Pembahasan</span>
                  <span className="text-slate-500 text-[10px]">(Opsional - tampil setelah ronde selesai)</span>
                </label>
                <input
                  type="text"
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  placeholder="Contoh: Disahkan oleh PPKI sehari setelah proklamasi kemerdekaan."
                  className="w-full bg-[#090d18] border border-white/10 focus:border-emerald-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                />
              </div>

              {/* Tombol Simpan Soal */}
              <button
                type="button"
                onClick={handleAddQuestion}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition transform active:scale-98 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ TAMBAHKAN SOAL INI KE ROOM</span>
              </button>
            </div>

            {/* DAFTAR SOAL YANG SUDAH DITAMBAHKAN */}
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-black text-white">
                    Daftar Soal Room ({questions.length})
                  </span>
                </div>
                {questions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllQuestions}
                    className="text-[10px] font-bold text-rose-400 hover:text-rose-300 transition cursor-pointer"
                  >
                    Kosongkan Semua
                  </button>
                )}
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-6 px-4 flex flex-col items-center justify-center gap-1.5 border border-dashed border-white/10 rounded-xl">
                  <HelpCircle className="w-7 h-7 text-slate-500" />
                  <p className="text-xs font-bold text-slate-300">Belum ada soal yang ditambahkan</p>
                  <p className="text-[11px] text-slate-500 max-w-sm">
                    Ketik soal di atas lalu klik Tambahkan Soal, atau pilih paket 10 Soal PKn untuk siap pakai.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className="p-2.5 rounded-xl bg-[#060911] border border-white/10 flex items-center justify-between gap-3 text-xs group hover:border-white/20 transition"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <p className="font-semibold text-slate-200 line-clamp-2 leading-relaxed text-[11px]">
                            {q.statement}
                          </p>
                          {q.explanation && (
                            <p className="text-[10px] text-slate-400 line-clamp-1 italic mt-0.5">
                              {q.explanation}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-md font-black text-[10px] uppercase ${
                            q.answer
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                          }`}
                        >
                          {q.answer ? 'BENAR' : 'SALAH'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(idx)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Hapus soal ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: PROFIL HOST & KODE ROOM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Host Name Field */}
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-3 flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>Nama Guru / Host</span>
                <span className="text-emerald-400 text-[10px]">Tampil di Layar</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="shrink-0 scale-90">
                  <ChibiAvatar
                    avatarId={avatarId}
                    color={avatarColor}
                    size="sm"
                    showName={false}
                  />
                </div>
                <input
                  type="text"
                  maxLength={20}
                  value={hostName}
                  onChange={(e) => {
                    setHostName(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Nama Bapak/Ibu Guru..."
                  className="w-full bg-[#060911] border border-white/10 focus:border-emerald-400 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
                />
              </div>
            </div>

            {/* Room Code Box */}
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-3 flex flex-col justify-between gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
                  Kode Room (6 Digit)
                </label>
                <button
                  type="button"
                  onClick={handleRefreshCode}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition cursor-pointer"
                  title="Acak kode room baru"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Acak Baru</span>
                </button>
              </div>
              <div className="flex items-center justify-between bg-[#060911] border border-emerald-500/30 rounded-xl px-3 py-1.5">
                <span className="text-xl font-black font-mono tracking-widest text-emerald-300">
                  {roomCode}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5 bg-white/5 rounded-md">
                  Otomatis
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM FIXED ACTION BAR */}
        <div className="flex items-center gap-3 p-4 sm:p-5 border-t border-white/10 bg-slate-950/80 backdrop-blur-md shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs sm:text-sm border border-white/10 transition cursor-pointer active:scale-95"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleCreate}
            className="flex-1 py-3.5 px-5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition transform active:scale-98 cursor-pointer shadow-lg bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
          >
            <span>BUAT ROOM SEKARANG</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-950/20 text-slate-950">
              {questions.length} Soal
            </span>
            <ArrowRight className="w-5 h-5 text-slate-950" />
          </button>
        </div>
      </div>
    </div>
  );
};
