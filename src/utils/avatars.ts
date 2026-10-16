/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AvatarId } from '../types/game';

export interface AvatarOption {
  id: AvatarId;
  name: string;
  emoji: string;
  defaultColor: string;
}

export const AVATAR_LIST: AvatarOption[] = [
  { id: 'cat', name: 'Kucing Mochi', emoji: '🐱', defaultColor: '#fbbf24' },
  { id: 'panda', name: 'Panda Boba', emoji: '🐼', defaultColor: '#38bdf8' },
  { id: 'bunny', name: 'Kelinci Usagi', emoji: '🐰', defaultColor: '#f472b6' },
  { id: 'bear', name: 'Beruang Kuma', emoji: '🐻', defaultColor: '#f97316' },
  { id: 'dino', name: 'Dino Rexy', emoji: '🦖', defaultColor: '#4ade80' },
  { id: 'fox', name: 'Rubah Kitsune', emoji: '🦊', defaultColor: '#fb923c' },
  { id: 'penguin', name: 'Pinguin Pipi', emoji: '🐧', defaultColor: '#60a5fa' },
  { id: 'chick', name: 'Anak Ayam Piyo', emoji: '🐥', defaultColor: '#facc15' },
  { id: 'monkey', name: 'Monyet Saru', emoji: '🐵', defaultColor: '#a78bfa' },
  { id: 'alien', name: 'Alien Cosmo', emoji: '👽', defaultColor: '#2dd4bf' },
  { id: 'robot', name: 'Robot Beep', emoji: '🤖', defaultColor: '#94a3b8' },
  { id: 'lion', name: 'Singa Simba', emoji: '🦁', defaultColor: '#eab308' },
  { id: 'frog', name: 'Katak Kero', emoji: '🐸', defaultColor: '#10b981' },
  { id: 'dog', name: 'Anjing Shiba', emoji: '🐶', defaultColor: '#f59e0b' },
  { id: 'koala', name: 'Koala Nono', emoji: '🐨', defaultColor: '#a8a29e' },
  { id: 'tiger', name: 'Harimau Tora', emoji: '🐯', defaultColor: '#ea580c' },
];

export const COLOR_PALETTE = [
  '#f43f5e', // Rose
  '#ec4899', // Pink
  '#a855f7', // Purple
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#84cc16', // Lime
  '#eab308', // Yellow
  '#f97316', // Orange
];
