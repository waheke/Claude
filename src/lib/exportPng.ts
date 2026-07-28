import { triggerDownload } from './exportCsv';

const GAP_PX = 40; // matches the on-screen board gap, scaled up with the 2x capture

/**
 * Captures each epic column independently and composes them side by side
 * into a single PNG, matching the on-screen board layout. Compositing from
 * independent per-epic captures (rather than one shot of the whole board)
 * ensures epics scrolled off-screen still make it into the image.
 */
export async function exportNodeToPng(node: HTMLElement, filename = 'feature-map.png'): Promise<void> {
  const { captureEpicCanvases } = await import('./captureBoard');
  const epicCaptures = await captureEpicCanvases(node);

  const totalWidth = epicCaptures.reduce((sum, { canvas }) => sum + canvas.width, 0) + GAP_PX * (epicCaptures.length - 1);
  const maxHeight = Math.max(...epicCaptures.map(({ canvas }) => canvas.height));

  const combined = document.createElement('canvas');
  combined.width = totalWidth;
  combined.height = maxHeight;
  const ctx = combined.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas context');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, totalWidth, maxHeight);

  let x = 0;
  for (const { canvas } of epicCaptures) {
    ctx.drawImage(canvas, x, 0);
    x += canvas.width + GAP_PX;
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    combined.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Failed to generate PNG'));
    }, 'image/png');
  });

  triggerDownload(blob, filename);
}
