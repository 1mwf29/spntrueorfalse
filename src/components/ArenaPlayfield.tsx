/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { Player, RoomState } from '../types/game';
import { ChibiAvatar } from './ChibiAvatar';
import confetti from 'canvas-confetti';
import {
  Check,
  X,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Trophy,
  Flame,
  Sparkles,
} from 'lucide-react';

interface ArenaPlayfieldProps {
  roomState: RoomState;
  myPlayerId: string;
  isHost: boolean;
  onSelectChoice: (choice: 'true' | 'false') => void;
  onNextQuestion: () => void;
}

export const ArenaPlayfield: React.FC<ArenaPlayfieldProps> = ({
  roomState,
  myPlayerId,
  isHost,
  onSelectChoice,
  onNextQuestion,
}) => {
  const [clickEffect, setClickEffect] = useState<{ x: number; y: number; side: string } | null>(null);

  const playersList = useMemo(() => {
    return Object.values(roomState.players);
  }, [roomState.players]);

  const myPlayer = roomState.players[myPlayerId];
  const myChoice = myPlayer?.currentChoice || null;

  // Group players by side
  const { trueSidePlayers, falseSidePlayers, centerPlayers } = useMemo(() => {
    const trueSide: Player[] = [];
    const falseSide: Player[] = [];
    const center: Player[] = [];

    playersList.forEach((p) => {
      if (p.currentChoice === 'true') {
        trueSide.push(p);
      } else if (p.currentChoice === 'false') {
        falseSide.push(p);
      } else {
        center.push(p);
      }
    });

    return { trueSidePlayers: trueSide, falseSidePlayers: falseSide, centerPlayers: center };
  }, [playersList]);

  const isReveal = roomState.status === 'reveal';
  const correctAnswer = roomState.roundResult?.correctAnswer;
  const isLastQuestion = roomState.currentQuestionIndex + 1 >= roomState.totalQuestions;

  // Haptic feedback helper
  const triggerHaptic = useCallback(() => {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      navigator.vibrate(30);
    }
  }, []);

  // Handle direct click on Left or Right arena sides
  const handleSideClick = (side: 'true' | 'false', e: React.MouseEvent<HTMLDivElement>) => {
    if (isReveal) return;
    triggerHaptic();

    // Spawn click pulse ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setClickEffect({ x, y, side });
    setTimeout(() => setClickEffect(null), 600);

    onSelectChoice(side);
  };

  // Keyboard shortcut listener: Left/A -> Benar, Right/D -> Salah
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isReveal) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === '1') {
        triggerHaptic();
        onSelectChoice('true');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === '2') {
        triggerHaptic();
        onSelectChoice('false');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReveal, onSelectChoice, triggerHaptic]);

  // Confetti celebration if user won this round
  useEffect(() => {
    if (isReveal && myPlayer && myPlayer.currentChoice !== null) {
      const isCorrect = (myPlayer.currentChoice === 'true') === correctAnswer;
      if (isCorrect) {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.65 },
        });
      }
    }
  }, [isReveal, myPlayer, correctAnswer]);

  const isMyAnswerCorrect =
    myPlayer && myPlayer.currentChoice !== null && isReveal
      ? (myPlayer.currentChoice === 'true') === correctAnswer
      : false;

  return (
    <div className="relative w-full h-[410px] sm:h-[470px] md:h-[510px] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 bg-[#070b14] flex flex-col select-none">
      {/* 2 GIANT INTERACTIVE ARENA SIDES */}
      <div className="absolute inset-0 grid grid-cols-2">
        {/* LEFT SIDE: TRUE / BENAR (GREEN ZONE) - DIRECT CLICKABLE AREA */}
        <div
          onClick={(e) => handleSideClick('true', e)}
          className={`relative flex flex-col items-center justify-between p-3 sm:p-4 transition-all duration-500 cursor-pointer group ${
            isReveal
              ? correctAnswer === true
                ? 'bg-gradient-to-br from-emerald-600/90 via-teal-700/80 to-emerald-950 ring-2 ring-emerald-400 shadow-[inset_0_0_60px_rgba(16,185,129,0.5)]'
                : 'bg-emerald-950/20 opacity-30 grayscale-[50%]'
              : myChoice === 'true'
              ? 'bg-gradient-to-b from-emerald-900/60 to-emerald-950/90 ring-2 ring-emerald-400 shadow-[inset_0_0_35px_rgba(16,185,129,0.35)]'
              : 'bg-gradient-to-b from-emerald-950/40 to-[#070b14] hover:from-emerald-950/60 active:brightness-110'
          }`}
        >
          {/* Subtle Grid Runway Floor Pattern */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1.5px,transparent_1.5px)] [background-size:20px_20px]" />

          {/* Click pulse ripple */}
          {clickEffect && clickEffect.side === 'true' && (
            <div
              className="absolute w-16 h-16 rounded-full bg-emerald-400/40 animate-ping pointer-events-none"
              style={{ left: clickEffect.x - 32, top: clickEffect.y - 32 }}
            />
          )}

          {/* Side Header Watermark & Click Hint */}
          <div className="relative z-10 flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-emerald-300 font-black tracking-widest text-lg sm:text-2xl drop-shadow">
              <span className="w-8 h-8 rounded-full bg-emerald-500/30 border-2 border-emerald-400 flex items-center justify-center text-emerald-200 font-black shadow-md">
                ✓
              </span>
              <span>BENAR</span>
            </div>

            {!isReveal && (
              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full transition-all ${
                myChoice === 'true'
                  ? 'bg-yellow-400 text-slate-950 shadow-md ring-2 ring-yellow-200'
                  : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 group-hover:bg-emerald-500/20'
              }`}>
                {myChoice === 'true' ? 'BIDAKMU DI SINI ✓' : 'KLIK UNTUK MEMILIH 👆'}
              </span>
            )}
          </div>

          {/* Giant Background Watermark Symbol */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-[140px] sm:text-[180px] font-black text-emerald-500/10 transition-transform">
              ✓
            </span>
          </div>

          {/* Bottom Player Count Badge */}
          <div className="relative z-10 self-start bg-emerald-950/90 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-black text-emerald-300 flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{trueSidePlayers.length} Pemain</span>
          </div>
        </div>

        {/* RIGHT SIDE: FALSE / SALAH (RED ZONE) - DIRECT CLICKABLE AREA */}
        <div
          onClick={(e) => handleSideClick('false', e)}
          className={`relative flex flex-col items-center justify-between p-3 sm:p-4 transition-all duration-500 border-l border-white/10 cursor-pointer group ${
            isReveal
              ? correctAnswer === false
                ? 'bg-gradient-to-br from-rose-600/90 via-red-700/80 to-rose-950 ring-2 ring-rose-400 shadow-[inset_0_0_60px_rgba(244,63,94,0.5)]'
                : 'bg-rose-950/20 opacity-30 grayscale-[50%]'
              : myChoice === 'false'
              ? 'bg-gradient-to-b from-rose-900/60 to-rose-950/90 ring-2 ring-rose-400 shadow-[inset_0_0_35px_rgba(244,63,94,0.35)]'
              : 'bg-gradient-to-b from-rose-950/40 to-[#070b14] hover:from-rose-900/60 active:brightness-110'
          }`}
        >
          {/* Subtle Grid Runway Floor Pattern */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f43f5e_1.5px,transparent_1.5px)] [background-size:20px_20px]" />

          {/* Click pulse ripple */}
          {clickEffect && clickEffect.side === 'false' && (
            <div
              className="absolute w-16 h-16 rounded-full bg-rose-400/40 animate-ping pointer-events-none"
              style={{ left: clickEffect.x - 32, top: clickEffect.y - 32 }}
            />
          )}

          {/* Side Header Watermark & Click Hint */}
          <div className="relative z-10 flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-rose-300 font-black tracking-widest text-lg sm:text-2xl drop-shadow">
              <span>SALAH</span>
              <span className="w-8 h-8 rounded-full bg-rose-500/30 border-2 border-rose-400 flex items-center justify-center text-rose-200 font-black shadow-md">
                ✗
              </span>
            </div>

            {!isReveal && (
              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full transition-all ${
                myChoice === 'false'
                  ? 'bg-yellow-400 text-slate-950 shadow-md ring-2 ring-yellow-200'
                  : 'bg-rose-950/90 text-rose-300 border border-rose-500/40 group-hover:bg-rose-500/20'
              }`}>
                {myChoice === 'false' ? 'BIDAKMU DI SINI ✗' : 'KLIK UNTUK MEMILIH 👆'}
              </span>
            )}
          </div>

          {/* Giant Background Watermark Symbol */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-[140px] sm:text-[180px] font-black text-rose-500/10">
              ✗
            </span>
          </div>

          {/* Bottom Player Count Badge */}
          <div className="relative z-10 self-end bg-rose-950/90 border border-rose-500/40 px-3 py-1 rounded-full text-xs font-black text-rose-300 flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span>{falseSidePlayers.length} Pemain</span>
          </div>
        </div>
      </div>

      {/* CENTER DIVIDER & STARTING RUNWAY (Classic HAGO arena barrier) */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-slate-900/70 z-10 flex flex-col items-center justify-between border-x border-dashed border-amber-400/50 pointer-events-none">
        <div className="flex-1 w-full flex flex-col items-center justify-around py-4 opacity-40">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-1.5 h-6 bg-yellow-400 rounded-full" />
          ))}
        </div>
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-slate-950 shadow-lg flex items-center justify-center text-[10px] font-black text-slate-950 my-auto">
          VS
        </div>
        <div className="flex-1 w-full flex flex-col items-center justify-around py-4 opacity-40">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-1.5 h-6 bg-yellow-400 rounded-full" />
          ))}
        </div>
      </div>

      {/* UNDECIDED PROMPT IN CENTER */}
      {centerPlayers.length > 0 && !isReveal && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 backdrop-blur-sm border border-yellow-400/60 px-3.5 py-1 rounded-full text-[11px] font-black text-yellow-300 shadow-xl flex items-center gap-1.5 animate-bounce pointer-events-none">
          <span>🏃 {centerPlayers.length} pemain belum memilih sisi!</span>
        </div>
      )}

      {/* AVATAR LAYER: Render all players positioned on arena */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden p-6">
        {playersList.map((player) => {
          let leftPercent = 50;
          let facingDirection: 'left' | 'right' | 'center' = 'center';

          if (player.currentChoice === 'true') {
            leftPercent = 25 + (player.posX + 0.65) * 25;
            leftPercent = Math.max(8, Math.min(42, leftPercent));
            facingDirection = 'left';
          } else if (player.currentChoice === 'false') {
            leftPercent = 75 + (player.posX - 0.65) * 25;
            leftPercent = Math.max(58, Math.min(92, leftPercent));
            facingDirection = 'right';
          } else {
            leftPercent = 50 + (player.posX || 0) * 6;
            facingDirection = 'center';
          }

          const topPercent = Math.max(16, Math.min(78, (player.posY || 0.5) * 100));

          // Continuous lively movement state!
          let avatarState: 'idle' | 'walking' | 'jumping' | 'correct' | 'wrong' = 'idle';
          if (isReveal) {
            if (player.currentChoice !== null) {
              const isCorrect = (player.currentChoice === 'true') === correctAnswer;
              avatarState = isCorrect ? 'correct' : 'wrong';
            } else {
              avatarState = 'wrong';
            }
          } else {
            // Continually stepping / waddling in the arena!
            avatarState = 'walking';
          }

          const isMe = player.id === myPlayerId;

          return (
            <div
              key={player.id}
              className="absolute transition-all duration-700 cubic-bezier(0.25, 1, 0.5, 1) flex flex-col items-center"
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isMe ? 40 : 25,
              }}
            >
              {/* Earned points popup animation on reveal */}
              {isReveal && player.lastPointsEarned > 0 && (
                <div className="absolute -top-12 z-30 font-black text-xs text-amber-300 bg-slate-900 px-2 py-0.5 rounded-full border border-amber-400 shadow-lg animate-bounce">
                  +{player.lastPointsEarned}
                </div>
              )}

              {/* Bidak Ground Shadow */}
              <div className="absolute bottom-4 w-8 h-2.5 bg-black/40 rounded-full blur-[1px] -z-10" />

              <ChibiAvatar
                avatarId={player.avatarId}
                color={player.color}
                name={player.name}
                size={isMe ? 'md' : 'sm'}
                state={avatarState}
                facing={facingDirection}
                showName={true}
                score={player.score}
                streak={player.streak}
                choice={player.currentChoice}
                isMe={isMe}
              />
            </div>
          );
        })}
      </div>

      {/* SIMPLE CENTERED REVEAL NOTIFICATION (POSISI TEPAT DI TENGAH-TENGAH ARENA) */}
      {isReveal && roomState.roundResult && (
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[92%] max-w-sm sm:max-w-md bg-slate-950/95 rounded-3xl p-4 sm:p-5 shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl flex flex-col items-center text-center gap-3 animate-in zoom-in-95 fade-in duration-300 select-none border-2 ${
          correctAnswer === true
            ? 'border-emerald-500/60 shadow-[0_0_45px_rgba(16,185,129,0.35)]'
            : 'border-rose-500/60 shadow-[0_0_45px_rgba(244,63,94,0.35)]'
        }`}>
          {/* Top Result Tag */}
          <div className="flex items-center gap-2">
            {myPlayer && myPlayer.currentChoice !== null ? (
              isMyAnswerCorrect ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>KAMU BENAR! 🎉</span>
                  {myPlayer.lastPointsEarned > 0 && (
                    <span className="ml-1 bg-yellow-400 text-slate-950 text-xs px-2 py-0.2 rounded-full font-black">
                      +{myPlayer.lastPointsEarned}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 font-black text-sm">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>KAMU SALAH! 💥</span>
                </div>
              )
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-xs">
                <span>⏱️ WAKTU HABIS</span>
              </div>
            )}
          </div>

          {/* Central Authoritative Answer Badge */}
          <div className="flex items-center gap-2.5 my-0.5">
            <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
              Jawaban Benar:
            </span>
            <span className={`px-3.5 py-1 rounded-xl text-sm font-black tracking-wide shadow-lg flex items-center gap-1.5 ${
              correctAnswer
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                : 'bg-rose-500 text-white shadow-rose-500/30'
            }`}>
              {correctAnswer ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>BENAR</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4 stroke-[3]" />
                  <span>SALAH</span>
                </>
              )}
            </span>
          </div>

          {/* Explanation Text */}
          {roomState.roundResult.explanation && (
            <p className="text-xs text-slate-200 leading-relaxed font-medium bg-slate-900/90 p-2.5 rounded-xl border border-white/10 max-h-24 overflow-y-auto w-full">
              {roomState.roundResult.explanation}
            </p>
          )}

          {/* 5-Second Automatic Countdown Timer & Host Action */}
          <div className="w-full flex flex-col items-center gap-2 pt-1 border-t border-white/10">
            {/* Auto countdown indicator */}
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping" />
              <span>
                {isLastQuestion
                  ? 'Menuju Podium Pemenang dalam'
                  : 'Soal berikutnya otomatis dalam'}{' '}
                <strong className="text-yellow-400 font-black text-sm font-mono">
                  {Math.max(1, roomState.timeRemaining)}s
                </strong>
              </span>
            </div>

            {/* Countdown progress bar (5s) */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-1000 ease-linear rounded-full"
                style={{
                  width: `${Math.min(100, Math.max(0, (roomState.timeRemaining / 5) * 100))}%`,
                }}
              />
            </div>

            {/* Host Optional Skip Button */}
            {isHost && (
              <button
                type="button"
                onClick={onNextQuestion}
                className="mt-1 px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Lewati (Lanjut Sekarang)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
