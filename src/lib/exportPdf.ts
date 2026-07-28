const PAGE_WIDTH_MM = 297; // A4 landscape
const PAGE_HEIGHT_MM = 210;
const MARGIN_MM = 8;

/**
 * Captures a DOM node and tiles it across as many A4 landscape pages as
 * needed (both horizontally and vertically) so wide boards don't get
 * squashed or cropped.
 */
export async function exportNodeToPdf(node: HTMLElement, filename = 'feature-map.pdf'): Promise<void> {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);
  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
  });

  const usableWidthMm = PAGE_WIDTH_MM - MARGIN_MM * 2;
  const usableHeightMm = PAGE_HEIGHT_MM - MARGIN_MM * 2;

  const pxPerMm = canvas.width / usableWidthMm;
  const tileWidthPx = Math.floor(usableWidthMm * pxPerMm);
  const tileHeightPx = Math.floor(usableHeightMm * pxPerMm);

  const pagesX = Math.ceil(canvas.width / tileWidthPx);
  const pagesY = Math.ceil(canvas.height / tileHeightPx);

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  let firstPage = true;
  for (let py = 0; py < pagesY; py += 1) {
    for (let px = 0; px < pagesX; px += 1) {
      const sx = px * tileWidthPx;
      const sy = py * tileHeightPx;
      const sw = Math.min(tileWidthPx, canvas.width - sx);
      const sh = Math.min(tileHeightPx, canvas.height - sy);
      if (sw <= 0 || sh <= 0) continue;

      const tileCanvas = document.createElement('canvas');
      tileCanvas.width = sw;
      tileCanvas.height = sh;
      const ctx = tileCanvas.getContext('2d');
      if (!ctx) continue;
      ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);

      const imgData = tileCanvas.toDataURL('image/jpeg', 0.92);
      if (!firstPage) pdf.addPage();
      firstPage = false;

      const wMm = sw / pxPerMm;
      const hMm = sh / pxPerMm;
      pdf.addImage(imgData, 'JPEG', MARGIN_MM, MARGIN_MM, wMm, hMm);
    }
  }

  pdf.save(filename);
}
