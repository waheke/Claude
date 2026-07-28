const PAGE_WIDTH_MM = 297; // A4 landscape
const PAGE_HEIGHT_MM = 210;
const MARGIN_MM = 8;

/**
 * Exports the board with one epic per PDF page (scaled to fill the page
 * width), tiling onto extra pages only if a single epic's content is too
 * tall to fit one page. Each epic is captured independently so epics
 * scrolled off-screen on a wide board still get exported in full.
 */
export async function exportNodeToPdf(node: HTMLElement, filename = 'feature-map.pdf'): Promise<void> {
  const [{ jsPDF }, { captureEpicCanvases }] = await Promise.all([
    import('jspdf'),
    import('./captureBoard'),
  ]);

  const epicCaptures = await captureEpicCanvases(node);

  const usableWidthMm = PAGE_WIDTH_MM - MARGIN_MM * 2;
  const usableHeightMm = PAGE_HEIGHT_MM - MARGIN_MM * 2;

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  let firstPageOverall = true;

  for (const { epic, canvas } of epicCaptures) {
    const pxPerMm = canvas.width / usableWidthMm;
    const tileHeightPx = Math.floor(usableHeightMm * pxPerMm);
    const pagesY = Math.max(1, Math.ceil(canvas.height / tileHeightPx));

    for (let py = 0; py < pagesY; py += 1) {
      const sy = py * tileHeightPx;
      const sh = Math.min(tileHeightPx, canvas.height - sy);
      if (sh <= 0) continue;

      const tileCanvas = document.createElement('canvas');
      tileCanvas.width = canvas.width;
      tileCanvas.height = sh;
      const ctx = tileCanvas.getContext('2d');
      if (!ctx) continue;
      ctx.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);

      const imgData = tileCanvas.toDataURL('image/jpeg', 0.92);
      if (!firstPageOverall) pdf.addPage();
      firstPageOverall = false;

      if (py > 0) {
        pdf.setFontSize(9);
        pdf.setTextColor(90);
        pdf.text(`${epic} (continued)`, MARGIN_MM, 5.5);
      }

      const wMm = canvas.width / pxPerMm;
      const hMm = sh / pxPerMm;
      pdf.addImage(imgData, 'JPEG', MARGIN_MM, MARGIN_MM, wMm, hMm);
    }
  }

  pdf.save(filename);
}
