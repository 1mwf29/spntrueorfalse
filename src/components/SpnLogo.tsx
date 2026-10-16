/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SpnLogoProps {
  className?: string;
  size?: number;
}

export const SpnLogo: React.FC<SpnLogoProps> = ({ className = 'w-10 h-10', size }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Arc Path for SEPUTAR (Top Arc) */}
        <path id="spn-arc-top" d="M 27 100 A 73 73 0 0 1 173 100" fill="none" />

        {/* Arc Path for PPKN (Bottom Arc) - oriented so letters are upright along bottom */}
        <path id="spn-arc-bottom" d="M 173 100 A 73 73 0 0 1 27 100" fill="none" />

        {/* Drop shadow filter for crisp outline */}
        <filter id="spn-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Background Circle */}
      <circle cx="100" cy="100" r="98" fill="#1f2d37" />

      {/* Outer White Ring */}
      <circle cx="100" cy="100" r="88" stroke="#ffffff" strokeWidth="3" />

      {/* Inner White Ring */}
      <circle cx="100" cy="100" r="56" stroke="#ffffff" strokeWidth="3" />

      {/* TOP TEXT: "S E P U T A R" */}
      <text
        fill="#ffffff"
        fontSize="17.5"
        fontWeight="800"
        fontFamily="'Arial Black', 'Trebuchet MS', 'Impact', sans-serif"
        letterSpacing="4"
      >
        <textPath href="#spn-arc-top" startOffset="50%" textAnchor="middle">
          SEPUTAR
        </textPath>
      </text>

      {/* BOTTOM TEXT: "P P K N" */}
      <text
        fill="#ffffff"
        fontSize="17.5"
        fontWeight="800"
        fontFamily="'Arial Black', 'Trebuchet MS', 'Impact', sans-serif"
        letterSpacing="7"
      >
        <textPath href="#spn-arc-bottom" startOffset="50%" textAnchor="middle">
          PPKN
        </textPath>
      </text>

      {/* Left Star (5-Pointed White Outline Star) */}
      <g transform="translate(37, 116) scale(0.65)">
        <polygon
          points="0,-16 4.7,-4.9 16.8,-4.9 7.4,2.5 11,14.6 0,7.2 -11,14.6 -7.4,2.5 -16.8,-4.9 -4.7,-4.9"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
      </g>

      {/* Right Star (5-Pointed White Outline Star) */}
      <g transform="translate(163, 116) scale(0.65)">
        <polygon
          points="0,-16 4.7,-4.9 16.8,-4.9 7.4,2.5 11,14.6 0,7.2 -11,14.6 -7.4,2.5 -16.8,-4.9 -4.7,-4.9"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
      </g>

      {/* CENTER MONOGRAM "SPN" IN VARSITY / ATHLETIC ARCHED BLOCK STYLE */}
      <g fill="#ffffff" filter="url(#spn-glow)">
        {/* Letter S (Arched Left) */}
        <path d="M 64 74 L 81 72 L 81 83 L 73 84 C 71 85 70 87 70 89 C 70 91 71 92 73 93 L 78 95 C 83 97 86 100 86 106 C 86 114 79 119 70 120 C 62 121 54 118 52 113 L 64 107 C 65 110 67 111 70 111 C 72 111 74 110 74 108 C 74 106 73 105 70 104 L 66 102 C 60 100 57 96 57 90 C 57 82 64 76 71 75 Z" />

        {/* Letter P (Center Dominant) */}
        <path d="M 87 68 L 109 68 C 117 68 122 73 122 81 C 122 89 117 94 109 94 L 99 94 L 99 122 L 87 122 Z M 99 77 L 99 85 L 108 85 C 110 85 112 83 112 81 C 112 79 110 77 108 77 Z" />

        {/* Letter N (Arched Right) */}
        <path d="M 125 72 L 136 74 L 136 97 L 149 76 L 159 79 L 159 120 L 148 118 L 148 95 L 135 116 L 125 114 Z" />
      </g>
    </svg>
  );
};
