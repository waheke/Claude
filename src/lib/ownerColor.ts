// Reuses the NHS palette already defined in index.css, so owner tags stay
// on-brand rather than introducing arbitrary hues.
const OWNER_PALETTE = [
  '#005eb8', // blue
  '#007f3b', // green
  '#330072', // purple
  '#ae2573', // pink
  '#d5281b', // red
  '#ed8b00', // orange
  '#41b6e6', // light blue
  '#7c2855', // dark pink
  '#78bd91', // light green
  '#425563', // grey-1
  '#ffb81c', // warm yellow
  '#003087', // dark blue
];

/** Deterministically maps an owner's name to a colour, so it stays stable across sessions. */
export function colorForOwner(owner: string): string {
  let hash = 0;
  for (let i = 0; i < owner.length; i += 1) {
    hash = (hash * 31 + owner.charCodeAt(i)) >>> 0;
  }
  return OWNER_PALETTE[hash % OWNER_PALETTE.length];
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
