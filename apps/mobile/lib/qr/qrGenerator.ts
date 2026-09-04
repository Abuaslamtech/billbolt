/**
 * Billbolt QR Code Engine & Smart SKU Generator
 * 
 * Provides:
 * 1. `generateProductSku(name)`: Generates smart, human-readable SKU (e.g. `BB-SG-4821`).
 * 2. `createQrMatrix(text)`: Pure TypeScript, dependency-free ISO/IEC 18004 QR matrix generator.
 */

// ─── 1. Smart SKU Generator ───────────────────────────────────────────────────

export function getProductInitials(productName: string): string {
  const cleaned = (productName || '').trim();
  const words = cleaned
    .split(/[\s_\-]+/)
    .map((w) => w.replace(/[^a-zA-Z]/g, ''))
    .filter((w) => w.length > 0);
  let initials = '';

  if (words.length >= 2) {
    initials = words.slice(0, 3).map((w) => w[0].toUpperCase()).join('');
  } else if (words.length === 1) {
    const word = words[0].toUpperCase();
    initials = word.length <= 3 ? word : word.slice(0, 3);
  }

  if (!initials) {
    initials = 'PRD';
  }
  
  return initials;
}

export function generateProductSku(productName: string): string {
  const initials = getProductInitials(productName);

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `BB-${initials}-${randomDigits}`;
}

// ─── 2. Pure TypeScript QR Code Matrix Generator ──────────────────────────────

export type QRMatrix = boolean[][];

/** Galois Field log & exp tables for Reed-Solomon Error Correction */
const EXP_TABLE = new Uint8Array(256);
const LOG_TABLE = new Uint8Array(256);

(function initGaloisField() {
  let val = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = val;
    LOG_TABLE[val] = i;
    val <<= 1;
    if (val & 0x100) {
      val ^= 0x11d; // generator polynomial x^8 + x^4 + x^3 + x^2 + 1
    }
  }
  EXP_TABLE[255] = EXP_TABLE[0];
})();

function gmult(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP_TABLE[(LOG_TABLE[a] + LOG_TABLE[b]) % 255];
}

/** Error Correction polynomials for Level M */
const RS_POLYNOMIALS: Record<number, number[]> = {
  10: [1, 216, 194, 159, 111, 199, 94, 95, 113, 157, 193],
  16: [1, 59, 13, 233, 101, 12, 121, 231, 80, 240, 107, 100, 234, 162, 17, 143, 85],
  26: [1, 173, 125, 158, 2, 103, 182, 118, 17, 145, 201, 111, 28, 165, 53, 161, 21, 245, 142, 13, 102, 48, 227, 153, 145, 218, 70],
};

function calculateErrorCorrection(data: Uint8Array, ecLength: number): Uint8Array {
  const poly = RS_POLYNOMIALS[ecLength] || RS_POLYNOMIALS[10];
  const result = new Uint8Array(data.length + poly.length - 1);
  result.set(data);

  for (let i = 0; i < data.length; i++) {
    const coef = result[i];
    if (coef !== 0) {
      for (let j = 0; j < poly.length; j++) {
        result[i + j] ^= gmult(poly[j], coef);
      }
    }
  }

  return result.slice(data.length);
}

/** Supported QR capacities for Level M */
const QR_SPECS = [
  { version: 1, size: 21, dataBytes: 16, ecBytes: 10, totalBytes: 26 },
  { version: 2, size: 25, dataBytes: 28, ecBytes: 16, totalBytes: 44 },
  { version: 3, size: 29, dataBytes: 44, ecBytes: 26, totalBytes: 70 },
  { version: 4, size: 33, dataBytes: 64, ecBytes: 18 * 2, totalBytes: 100 },
];

/**
 * Generates an ISO/IEC 18004 2D boolean bitmatrix for the given text.
 * `true` = dark module, `false` = light module.
 */
export function createQrMatrix(text: string): { matrix: QRMatrix; size: number } {
  const encoder = new TextEncoder();
  const rawBytes = encoder.encode(text);

  // Pick smallest version that fits (text + 4-bit mode + 8-bit length indicator)
  const requiredDataBytes = rawBytes.length + 2;
  const spec = QR_SPECS.find((s) => s.dataBytes >= requiredDataBytes) || QR_SPECS[QR_SPECS.length - 1];
  const { size, dataBytes, ecBytes } = spec;

  // 1. Bitstream encoding: Byte Mode (0100) + 8-bit length + data + terminator + padding
  const bitStream: number[] = [];
  function pushBits(val: number, bits: number) {
    for (let i = bits - 1; i >= 0; i--) {
      bitStream.push((val >> i) & 1);
    }
  }

  pushBits(0b0100, 4); // Byte Mode
  pushBits(rawBytes.length, 8); // Character count
  for (const byte of rawBytes) {
    pushBits(byte, 8);
  }

  // Terminator
  const maxBits = dataBytes * 8;
  const termBits = Math.min(4, maxBits - bitStream.length);
  for (let i = 0; i < termBits; i++) bitStream.push(0);

  // Byte alignment
  while (bitStream.length % 8 !== 0) {
    bitStream.push(0);
  }

  // Convert to bytes & add pad bytes 0xEC and 0x11
  const data = new Uint8Array(dataBytes);
  for (let i = 0; i < bitStream.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | bitStream[i + j];
    }
    data[i / 8] = b;
  }

  let padIdx = bitStream.length / 8;
  const padPatterns = [0xec, 0x11];
  let p = 0;
  while (padIdx < dataBytes) {
    data[padIdx++] = padPatterns[p % 2];
    p++;
  }

  // 2. Error Correction Codewords
  const ec = calculateErrorCorrection(data, ecBytes);
  const finalCodewords = new Uint8Array(data.length + ec.length);
  finalCodewords.set(data);
  finalCodewords.set(ec, data.length);

  // 3. Matrix Placement
  const matrix: QRMatrix = Array.from({ length: size }, () => Array(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  function setModule(r: number, c: number, val: boolean, isFunc = true) {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      matrix[r][c] = val;
      if (isFunc) isFunction[r][c] = true;
    }
  }

  // Finder Patterns (7x7) + Separators
  function addFinderPattern(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
        if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
          const isBlack =
            r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
          setModule(nr, nc, isBlack, true);
        } else {
          setModule(nr, nc, false, true); // White separator
        }
      }
    }
  }

  addFinderPattern(0, 0); // Top-left
  addFinderPattern(0, size - 7); // Top-right
  addFinderPattern(size - 7, 0); // Bottom-left

  // Timing Patterns
  for (let i = 8; i < size - 8; i++) {
    setModule(6, i, i % 2 === 0, true);
    setModule(i, 6, i % 2 === 0, true);
  }

  // Dark module
  setModule(size - 8, 8, true, true);

  // Alignment Pattern for Version >= 2
  if (spec.version >= 2) {
    const alignPos = spec.version === 2 ? 18 : spec.version === 3 ? 22 : 26;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const isBlack = r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0);
        setModule(alignPos + r, alignPos + c, isBlack, true);
      }
    }
  }

  // Reserve format information areas
  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      setModule(8, i, false, true);
      setModule(i, 8, false, true);
    }
  }
  for (let i = size - 8; i < size; i++) {
    setModule(8, i, false, true);
    setModule(i, 8, false, true);
  }

  // 4. Data Placement (Up and down 2-column zig-zag)
  let bitIdx = 0;
  const totalBits = finalCodewords.length * 8;
  let upward = true;

  for (let c = size - 1; c > 0; c -= 2) {
    if (c === 6) c--; // Skip vertical timing pattern
    const rows = upward ? Array.from({ length: size }, (_, i) => size - 1 - i) : Array.from({ length: size }, (_, i) => i);

    for (const r of rows) {
      for (const colOffset of [0, -1]) {
        const col = c + colOffset;
        if (!isFunction[r][col]) {
          let bit = false;
          if (bitIdx < totalBits) {
            const byte = finalCodewords[Math.floor(bitIdx / 8)];
            const bitOffset = 7 - (bitIdx % 8);
            bit = ((byte >> bitOffset) & 1) === 1;
            bitIdx++;
          }
          // Mask 0: (row + col) % 2 == 0
          const mask = (r + col) % 2 === 0;
          matrix[r][col] = bit !== mask;
        }
      }
    }
    upward = !upward;
  }

  // 5. Format Info: Level M (00) + Mask 0 (000) => 15-bit BCH codeword with mask 0x5412 => 101010000010010
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  // Top-left
  setModule(8, 0, formatBits[0] === 1, true);
  setModule(8, 1, formatBits[1] === 1, true);
  setModule(8, 2, formatBits[2] === 1, true);
  setModule(8, 3, formatBits[3] === 1, true);
  setModule(8, 4, formatBits[4] === 1, true);
  setModule(8, 5, formatBits[5] === 1, true);
  setModule(8, 7, formatBits[6] === 1, true);
  setModule(8, 8, formatBits[7] === 1, true);
  setModule(7, 8, formatBits[8] === 1, true);
  setModule(5, 8, formatBits[9] === 1, true);
  setModule(4, 8, formatBits[10] === 1, true);
  setModule(3, 8, formatBits[11] === 1, true);
  setModule(2, 8, formatBits[12] === 1, true);
  setModule(1, 8, formatBits[13] === 1, true);
  setModule(0, 8, formatBits[14] === 1, true);

  // Split copies around other corners
  for (let i = 0; i < 7; i++) {
    setModule(size - 1 - i, 8, formatBits[i] === 1, true);
  }
  for (let i = 0; i < 8; i++) {
    setModule(8, size - 8 + i, formatBits[7 + i] === 1, true);
  }

  return { matrix, size };
}
