export interface EpicCapture {
  epic: string;
  canvas: HTMLCanvasElement;
}

/**
 * Captures each `.epic-column` within the board individually, rather than
 * the board as a whole. html2canvas clips a captured element to whatever is
 * currently scrolled into view, so capturing the (horizontally scrollable)
 * board in one shot silently drops any epics scrolled off-screen. Capturing
 * each column directly sidesteps that entirely.
 */
export async function captureEpicCanvases(boardNode: HTMLElement): Promise<EpicCapture[]> {
  const { default: html2canvas } = await import('html2canvas');
  const epicNodes = Array.from(boardNode.querySelectorAll<HTMLElement>('.epic-column'));
  const nodesToCapture = epicNodes.length > 0 ? epicNodes : [boardNode];

  const captures: EpicCapture[] = [];
  for (const epicNode of nodesToCapture) {
    const canvas = await html2canvas(epicNode, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    });
    const heading = epicNode.querySelector('.epic-column__heading');
    captures.push({ epic: heading?.textContent ?? '', canvas });
  }
  return captures;
}
