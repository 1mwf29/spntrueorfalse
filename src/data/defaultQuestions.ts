/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question } from '../types/game';

// Bank soal default dikosongkan agar guru/host dapat menginput soal sendiri secara mandiri
export const DEFAULT_QUESTIONS: Question[] = [];

// Contoh bank soal Pendidikan Pancasila & Kewarganegaraan (Civic) opsional jika guru ingin memuat contoh
export const SAMPLE_CIVIC_QUESTIONS: Question[] = [
  {
    id: 'civic-1',
    statement: 'Pancasila disahkan secara resmi sebagai dasar negara Indonesia pada tanggal 18 Agustus 1945.',
    answer: true,
    explanation: 'BENAR! PPKI mengesahkan UUD 1945 beserta Pembukaannya yang memuat rumusan Pancasila pada 18 Agustus 1945.',
    category: 'Pendidikan Pancasila',
    duration: 10,
  },
  {
    id: 'civic-2',
    statement: 'Semboyan Bhinneka Tunggal Ika berasal dari kitab Sutasoma karangan Mpu Prapanca.',
    answer: false,
    explanation: 'SALAH! Semboyan Bhinneka Tunggal Ika berasal dari kitab Sutasoma karangan Mpu Tantular, bukan Mpu Prapanca (pengarang Nagarakretagama).',
    category: 'Sejarah & Kebangsaan',
    duration: 10,
  },
  {
    id: 'civic-3',
    statement: 'Lembaga yang berwenang menguji undang-undang terhadap UUD 1945 di Indonesia adalah Mahkamah Konstitusi (MK).',
    answer: true,
    explanation: 'BENAR! Mahkamah Konstitusi (MK) berwenang melakukan uji materi (judicial review) undang-undang terhadap UUD 1945.',
    category: 'Ketatanegaraan',
    duration: 10,
  },
  {
    id: 'civic-4',
    statement: 'Hak Asasi Manusia (HAM) diatur secara eksplisit dalam Pasal 28A hingga 28J UUD NRI Tahun 1945.',
    answer: true,
    explanation: 'BENAR! Perubahan kedua UUD 1945 menambahkan Bab XA Pasal 28A-28J yang secara khusus memuat jaminan HAM warga negara.',
    category: 'Hak Asasi Manusia',
    duration: 10,
  },
  {
    id: 'civic-5',
    statement: 'Pemilihan Umum pertama di Indonesia diselenggarakan pada tahun 1945 setelah proklamasi.',
    answer: false,
    explanation: 'SALAH! Pemilu pertama di Indonesia diselenggarakan pada tahun 1955 untuk memilih anggota DPR dan Konstituante.',
    category: 'Demokrasi & Pemilu',
    duration: 10,
  },
  {
    id: 'civic-6',
    statement: 'Bentuk negara Indonesia adalah Negara Kesatuan yang berbentuk Republik (Pasal 1 Ayat 1 UUD 1945).',
    answer: true,
    explanation: 'BENAR! Pasal 1 ayat (1) UUD 1945 berbunyi: "Negara Indonesia ialah Negara Kesatuan, yang berbentuk Republik".',
    category: 'UUD 1945',
    duration: 10,
  },
];
