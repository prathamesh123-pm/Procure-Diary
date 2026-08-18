import jsPDF from 'jspdf';
import { NOTO_SANS_DEVANAGARI_REGULAR, NOTO_SANS_DEVANAGARI_BOLD } from './devanagariFont';

export const UNICODE_FONT_FAMILY = 'NotoSansDevanagari';

/**
 * Initializes and embeds the full Noto Sans Devanagari Unicode TrueType font
 * into the jsPDF instance.
 *
 * This provides 100% full UTF-8 Unicode Devanagari script support for Marathi
 * and Latin characters without falling back to standard ASCII/WinAnsi fonts
 * (which cause question marks, random symbols, or unreadable codes).
 */
export function setupPdfUnicodeFont(doc: jsPDF): void {
  try {
    // 1. Add Regular TrueType font to Virtual File System
    doc.addFileToVFS('NotoSansDevanagari-Regular.ttf', NOTO_SANS_DEVANAGARI_REGULAR);
    doc.addFont('NotoSansDevanagari-Regular.ttf', UNICODE_FONT_FAMILY, 'normal');

    // 2. Add Bold TrueType font to Virtual File System
    doc.addFileToVFS('NotoSansDevanagari-Bold.ttf', NOTO_SANS_DEVANAGARI_BOLD);
    doc.addFont('NotoSansDevanagari-Bold.ttf', UNICODE_FONT_FAMILY, 'bold');

    // 3. Set default font to Devanagari Unicode font
    doc.setFont(UNICODE_FONT_FAMILY, 'normal');
  } catch (err) {
    console.error('Failed to embed Unicode Devanagari font in jsPDF:', err);
  }
}

/**
 * Common AutoTable style preset that guarantees Marathi/Unicode support across all tables.
 */
export const UNICODE_AUTOTABLE_STYLES = {
  font: UNICODE_FONT_FAMILY,
  fontStyle: 'normal' as const,
};

export const UNICODE_AUTOTABLE_HEAD_STYLES = {
  font: UNICODE_FONT_FAMILY,
  fontStyle: 'bold' as const,
};
