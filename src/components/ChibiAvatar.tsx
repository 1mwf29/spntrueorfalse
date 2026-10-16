/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AvatarId } from '../types/game';

interface ChibiAvatarProps {
  avatarId: AvatarId;
  color?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  state?: 'idle' | 'walking' | 'jumping' | 'correct' | 'wrong' | 'eliminated';
  facing?: 'left' | 'right' | 'center';
  showName?: boolean;
  score?: number;
  streak?: number;
  choice?: 'true' | 'false' | null;
  isMe?: boolean;
}

export const ChibiAvatar: React.FC<ChibiAvatarProps> = ({
  avatarId,
  color = '#38bdf8',
  name,
  size = 'md',
  state = 'idle',
  facing = 'center',
  showName = true,
  score,
  streak = 0,
  choice,
  isMe = false,
}) => {
  // Dimensions
  const pixelSize = {
    sm: 36,
    md: 52,
    lg: 72,
    xl: 96,
  }[size];

  // Specific features per character
  const renderCharacterFeatures = () => {
    switch (avatarId) {
      case 'cat':
        return (
          <>
            {/* Cat Ears */}
            <polygon points="12,18 22,2 28,18" fill={color} />
            <polygon points="15,16 22,6 26,16" fill="#fbcfe8" />
            <polygon points="36,18 42,2 52,18" fill={color} />
            <polygon points="38,16 42,6 49,16" fill="#fbcfe8" />
            {/* Whiskers */}
            <line x1="8" y1="36" x2="18" y2="35" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="41" x2="18" y2="41" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            <line x1="46" y1="35" x2="56" y2="36" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            <line x1="46" y1="41" x2="56" y2="41" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case 'panda':
        return (
          <>
            {/* Panda Ears */}
            <circle cx="16" cy="14" r="8" fill="#1e293b" />
            <circle cx="48" cy="14" r="8" fill="#1e293b" />
            {/* Panda Eye Patches */}
            <ellipse cx="23" cy="34" rx="7" ry="5" fill="#1e293b" transform="rotate(-15 23 34)" />
            <ellipse cx="41" cy="34" rx="7" ry="5" fill="#1e293b" transform="rotate(15 41 34)" />
          </>
        );
      case 'bunny':
        return (
          <>
            {/* Long Bunny Ears */}
            <ellipse cx="22" cy="10" rx="5" ry="12" fill={color} />
            <ellipse cx="22" cy="10" rx="3" ry="8" fill="#fbcfe8" />
            <ellipse cx="42" cy="10" rx="5" ry="12" fill={color} />
            <ellipse cx="42" cy="10" rx="3" ry="8" fill="#fbcfe8" />
          </>
        );
      case 'bear':
        return (
          <>
            {/* Round Bear Ears */}
            <circle cx="15" cy="15" r="9" fill={color} />
            <circle cx="15" cy="15" r="5" fill="#fed7aa" />
            <circle cx="49" cy="15" r="9" fill={color} />
            <circle cx="49" cy="15" r="5" fill="#fed7aa" />
          </>
        );
      case 'dino':
        return (
          <>
            {/* Dino Crest / Spikes */}
            <polygon points="26,6 32,0 38,6" fill="#16a34a" />
            <polygon points="18,12 24,6 30,12" fill="#16a34a" />
            <polygon points="34,12 40,6 46,12" fill="#16a34a" />
          </>
        );
      case 'fox':
        return (
          <>
            {/* Fox Ears */}
            <polygon points="12,18 20,4 28,18" fill="#ea580c" />
            <polygon points="15,16 20,7 26,16" fill="#ffedd5" />
            <polygon points="36,18 44,4 52,18" fill="#ea580c" />
            <polygon points="38,16 44,7 49,16" fill="#ffedd5" />
          </>
        );
      case 'penguin':
        return (
          <>
            {/* Penguin white belly oval inside body */}
            <ellipse cx="32" cy="36" rx="14" ry="16" fill="#ffffff" />
            {/* Orange beak */}
            <polygon points="28,34 36,34 32,40" fill="#f97316" />
          </>
        );
      case 'chick':
        return (
          <>
            {/* Little Chick Tuft */}
            <path d="M 30 14 Q 32 4 36 8 Q 33 12 34 16" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            {/* Orange beak */}
            <polygon points="28,33 36,33 32,39" fill="#f97316" />
          </>
        );
      case 'alien':
        return (
          <>
            {/* Alien Antenna */}
            <line x1="32" y1="18" x2="32" y2="4" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <circle cx="32" cy="4" r="5" fill="#a855f7" />
          </>
        );
      case 'robot':
        return (
          <>
            {/* Robot Bolts */}
            <rect x="6" y="28" width="6" height="8" rx="2" fill="#64748b" />
            <rect x="52" y="28" width="6" height="8" rx="2" fill="#64748b" />
            <rect x="29" y="4" width="6" height="12" rx="2" fill="#64748b" />
            <circle cx="32" cy="4" r="4" fill="#ef4444" />
          </>
        );
      default:
        return (
          <>
            {/* Default Cute Animal Ears */}
            <circle cx="16" cy="16" r="7" fill={color} />
            <circle cx="48" cy="16" r="7" fill={color} />
          </>
        );
    }
  };

  return (
    <div className={`relative flex flex-col items-center group select-none transition-all duration-300 ${
      state === 'jumping' ? '-translate-y-4 scale-110' : ''
    } ${state === 'walking' ? 'animate-chibi-walk scale-105' : ''} ${
      state === 'correct' ? 'animate-bounce' : ''
    } ${state === 'wrong' ? 'rotate-12 opacity-75' : ''}`}>
      {/* "ME" Indicator Arrow */}
      {isMe && (
        <div className="absolute -top-7 z-20 flex flex-col items-center animate-bounce">
          <span className="bg-yellow-400 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-full shadow-md uppercase tracking-wider">
            KAMU
          </span>
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-yellow-400" />
        </div>
      )}

      {/* Choice Badge on top of head */}
      {choice && (
        <div className={`absolute -top-3 z-10 font-black text-[10px] px-1.5 py-0.5 rounded-full shadow-lg border border-white/50 text-white flex items-center gap-0.5 ${
          choice === 'true' ? 'bg-emerald-500' : 'bg-rose-500'
        }`}>
          {choice === 'true' ? '✓ BENAR' : '✗ SALAH'}
        </div>
      )}

      {/* Main Chibi Character SVG */}
      <div
        className="relative transition-transform duration-200"
        style={{
          width: pixelSize,
          height: pixelSize,
          transform: facing === 'left' ? 'scaleX(-1)' : 'none',
        }}
      >
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full drop-shadow-md overflow-visible"
        >
          {/* Character Ears/Accessories */}
          {renderCharacterFeatures()}

          {/* Main Head / Body (Chibi Round Shape) */}
          <ellipse
            cx="32"
            cy="36"
            rx="20"
            ry="18"
            fill={avatarId === 'penguin' ? '#0f172a' : color}
            stroke="#1e293b"
            strokeWidth="2.5"
          />

          {/* Blushing Cheeks */}
          <circle cx="19" cy="38" r="3" fill="#f43f5e" opacity="0.6" />
          <circle cx="45" cy="38" r="3" fill="#f43f5e" opacity="0.6" />

          {/* Eyes based on state */}
          {state === 'wrong' || state === 'eliminated' ? (
            // Dizzy X Eyes
            <>
              <line x1="20" y1="28" x2="26" y2="34" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="26" y1="28" x2="20" y2="34" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="38" y1="28" x2="44" y2="34" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="44" y1="28" x2="38" y2="34" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : state === 'correct' ? (
            // Joyful Happy Curved Eyes ^ ^
            <>
              <path d="M 19 32 Q 23 27 27 32" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 37 32 Q 41 27 45 32" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : (
            // Normal Big Anime Chibi Eyes with sparkles
            <>
              <circle cx="23" cy="31" r="3.5" fill="#0f172a" />
              <circle cx="22" cy="29.5" r="1.3" fill="#ffffff" />
              <circle cx="41" cy="31" r="3.5" fill="#0f172a" />
              <circle cx="40" cy="29.5" r="1.3" fill="#ffffff" />
            </>
          )}

          {/* Cute Mouth */}
          {state === 'correct' ? (
            // Open Happy Smile :D
            <path d="M 28 37 Q 32 44 36 37 Z" fill="#ef4444" stroke="#1e293b" strokeWidth="1.5" />
          ) : state === 'wrong' ? (
            // Wavy Sad Mouth ~
            <path d="M 27 41 Q 32 37 37 41" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
          ) : (
            // Cute Cat Mouth :3
            <path d="M 28 37 Q 30 39 32 37 Q 34 39 36 37" fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
          )}

          {/* Little Hands/Paws */}
          <circle cx="16" cy="46" r="3.5" fill="#fed7aa" stroke="#1e293b" strokeWidth="1.5" />
          <circle cx="48" cy="46" r="3.5" fill="#fed7aa" stroke="#1e293b" strokeWidth="1.5" />

          {/* Feet with walking trot */}
          <ellipse
            cx={state === 'walking' ? '24' : '26'}
            cy={state === 'walking' ? '51' : '53'}
            rx="4"
            ry="2.5"
            fill="#fed7aa"
            stroke="#1e293b"
            strokeWidth="1.5"
          />
          <ellipse
            cx={state === 'walking' ? '40' : '38'}
            cy={state === 'walking' ? '54' : '53'}
            rx="4"
            ry="2.5"
            fill="#fed7aa"
            stroke="#1e293b"
            strokeWidth="1.5"
          />
        </svg>

        {/* Footstep dust puffs when running/walking */}
        {state === 'walking' && (
          <div className="absolute -bottom-2 -left-1 text-[11px] animate-ping opacity-75 pointer-events-none">
            💨
          </div>
        )}

        {/* Status Particle on Correct */}
        {state === 'correct' && (
          <div className="absolute -top-2 -right-1 text-sm animate-ping">
            ⭐
          </div>
        )}
        {state === 'wrong' && (
          <div className="absolute -top-2 -right-1 text-sm animate-pulse">
            💥
          </div>
        )}
      </div>

      {/* Name and Streak info */}
      {showName && name && (
        <div className="mt-1 flex flex-col items-center max-w-[85px]">
          <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold truncate max-w-full shadow text-center border ${
            isMe
              ? 'bg-yellow-400 text-slate-900 border-yellow-200 ring-2 ring-yellow-400/50'
              : 'bg-slate-900/90 text-white border-white/20'
          }`}>
            {name}
          </div>
          {typeof score === 'number' && (
            <span className="text-[9px] font-black text-amber-300 drop-shadow">
              {score.toLocaleString()}
            </span>
          )}
          {streak >= 2 && (
            <span className="text-[8px] font-black bg-orange-600/90 text-white px-1 rounded-sm mt-0.5 flex items-center gap-0.5">
              🔥 x{streak}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
