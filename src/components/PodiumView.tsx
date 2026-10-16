/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo } from 'react';
import { RoomState, Player } from '../types/game';
import { ChibiAvatar } from './ChibiAvatar';
import confetti from 'canvas-confetti';
import { Trophy, Medal, RotateCcw, Check, X, Award, Crown } from 'lucide-react';

interface PodiumViewProps {
  roomState: RoomState;
  myPlayerId: string;
  isHost: boolean;
  onPlayAgain: () => void;
}

export const PodiumView: React.FC<PodiumViewProps> = ({
  roomState,
  myPlayerId,
  isHost,
  onPlayAgain,
}) => {
  // Sort players descending by score
  const rankedPlayers = useMemo(() => {
    return Object.values(roomState.players).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.correctAnswers - a.correctAnswers;
    });
  }, [roomState.players]);

  const firstPlace = rankedPlayers[0];
  const secondPlace = rankedPlayers[1];
  const thirdPlace = rankedPlayers[2];

  // Glorious fireworks/confetti celebration on mount
  useEffect(() => {
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#f59e0b', '#10b981', '#ec4899', '#3b82f6'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-4 px-3 sm:px-6 animate-in fade-in zoom-in-95 duration-500">
      {/* HEADER BANNER */}
      <div className="text-center flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-300 border border-yellow-400/40 px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase">
          <Trophy className="w-4 h-4 text-yellow-400" />
          HASIL AKHIR PERMAINAN
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-lg">
          PODIUM JUARA! 👑
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Selamat kepada para pemenang yang paling cepat dan tepat menjawab kuis!
        </p>
      </div>

      {/* 3D PODIUM SECTION */}
      <div className="relative pt-8 pb-4 flex items-end justify-center gap-2 sm:gap-4 min-h-[300px]">
        {/* 2nd Place (Silver) */}
        {secondPlace && (
          <div className="flex flex-col items-center z-10 w-28 sm:w-36 animate-in slide-in-from-bottom-8 duration-700">
            <div className="mb-2 flex flex-col items-center">
              <ChibiAvatar
                avatarId={secondPlace.avatarId}
                color={secondPlace.color}
                name={secondPlace.name}
                size="md"
                state="jumping"
                isMe={secondPlace.id === myPlayerId}
                showName={false}
              />
              <span className="font-black text-xs sm:text-sm text-white truncate max-w-[100px] text-center mt-1">
                {secondPlace.name}
              </span>
              <span className="font-black text-xs text-slate-300">
                {secondPlace.score.toLocaleString()} pts
              </span>
            </div>
            {/* Podium Step */}
            <div className="w-full h-28 sm:h-36 bg-gradient-to-t from-slate-700 to-slate-500 rounded-t-2xl border-t-4 border-slate-300 shadow-xl flex flex-col items-center justify-start pt-3">
              <span className="text-3xl sm:text-4xl font-black text-slate-200 drop-shadow">
                2
              </span>
              <Medal className="w-6 h-6 text-slate-300 mt-1" />
            </div>
          </div>
        )}

        {/* 1st Place (Gold / Champion) */}
        {firstPlace && (
          <div className="flex flex-col items-center z-20 w-32 sm:w-44 -mt-6 animate-in slide-in-from-bottom-12 duration-500">
            {/* Crown icon on top */}
            <div className="mb-2 flex flex-col items-center">
              <div className="animate-bounce">
                <Crown className="w-8 h-8 text-yellow-400 fill-yellow-400 drop-shadow-lg" />
              </div>
              <ChibiAvatar
                avatarId={firstPlace.avatarId}
                color={firstPlace.color}
                name={firstPlace.name}
                size="lg"
                state="correct"
                isMe={firstPlace.id === myPlayerId}
                showName={false}
              />
              <span className="font-black text-sm sm:text-base text-yellow-300 truncate max-w-[120px] text-center mt-1">
                {firstPlace.name}
              </span>
              <span className="font-black text-sm text-yellow-400">
                {firstPlace.score.toLocaleString()} pts
              </span>
            </div>
            {/* Podium Step */}
            <div className="w-full h-36 sm:h-48 bg-gradient-to-t from-amber-600 via-yellow-500 to-yellow-400 rounded-t-2xl border-t-4 border-yellow-200 shadow-2xl flex flex-col items-center justify-start pt-3">
              <span className="text-4xl sm:text-5xl font-black text-slate-950 drop-shadow">
                1
              </span>
              <Trophy className="w-8 h-8 text-slate-950 fill-slate-950 mt-1" />
            </div>
          </div>
        )}

        {/* 3rd Place (Bronze) */}
        {thirdPlace && (
          <div className="flex flex-col items-center z-10 w-28 sm:w-36 animate-in slide-in-from-bottom-6 duration-700">
            <div className="mb-2 flex flex-col items-center">
              <ChibiAvatar
                avatarId={thirdPlace.avatarId}
                color={thirdPlace.color}
                name={thirdPlace.name}
                size="md"
                state="jumping"
                isMe={thirdPlace.id === myPlayerId}
                showName={false}
              />
              <span className="font-black text-xs sm:text-sm text-white truncate max-w-[100px] text-center mt-1">
                {thirdPlace.name}
              </span>
              <span className="font-black text-xs text-amber-500">
                {thirdPlace.score.toLocaleString()} pts
              </span>
            </div>
            {/* Podium Step */}
            <div className="w-full h-20 sm:h-28 bg-gradient-to-t from-amber-900 to-amber-700 rounded-t-2xl border-t-4 border-amber-600 shadow-xl flex flex-col items-center justify-start pt-3">
              <span className="text-2xl sm:text-3xl font-black text-amber-200 drop-shadow">
                3
              </span>
              <Medal className="w-5 h-5 text-amber-300 mt-1" />
            </div>
          </div>
        )}
      </div>

      {/* FULL RANKINGS & STATS TABLE */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-black text-base text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Peringkat Keseluruhan ({rankedPlayers.length} Pemain)
          </h3>
          <span className="text-xs text-slate-400">Total {roomState.totalQuestions} Soal</span>
        </div>

        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
          {rankedPlayers.map((player, idx) => {
            const isMe = player.id === myPlayerId;
            const accuracy =
              roomState.totalQuestions > 0
                ? Math.round((player.correctAnswers / roomState.totalQuestions) * 100)
                : 0;

            return (
              <div
                key={player.id}
                className={`p-3 rounded-2xl flex items-center justify-between gap-3 border transition-colors ${
                  isMe
                    ? 'bg-yellow-500/15 border-yellow-400/50 shadow'
                    : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800'
                }`}
              >
                {/* Rank & Avatar & Name */}
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                      idx === 0
                        ? 'bg-yellow-400 text-slate-950'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-950'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </span>

                  <ChibiAvatar
                    avatarId={player.avatarId}
                    color={player.color}
                    size="sm"
                    showName={false}
                  />

                  <div className="flex flex-col">
                    <span className="font-black text-sm text-white flex items-center gap-1.5">
                      {player.name}
                      {isMe && (
                        <span className="text-[10px] bg-yellow-400 text-slate-950 px-1.5 rounded-full font-black">
                          KAMU
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-0.5 text-emerald-400">
                        <Check className="w-3 h-3" /> {player.correctAnswers} Benar
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-rose-400">
                        <X className="w-3 h-3" /> {player.wrongAnswers} Salah
                      </span>
                    </div>
                  </div>
                </div>

                {/* Accuracy & Score */}
                <div className="flex items-center gap-4 text-right">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-300">{accuracy}%</span>
                    <span className="text-[10px] text-slate-500">Akurasi</span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-base sm:text-lg font-black text-yellow-400 tabular-nums">
                      {player.score.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                      Poin
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-center gap-3 pt-2">
        {isHost ? (
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-base shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Main Lagi (Kembali ke Lobby)</span>
          </button>
        ) : (
          <div className="text-xs font-semibold text-slate-400 bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-slate-800">
            Menunggu Host untuk memulai game baru...
          </div>
        )}
      </div>
    </div>
  );
};
