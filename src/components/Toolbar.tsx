interface ToolbarProps {
  count: number;
  warnings: string[];
  onExportCsv: () => void;
  onExportPdf: () => void;
  onStartOver: () => void;
  isExportingPdf: boolean;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export function Toolbar({
  count,
  warnings,
  onExportCsv,
  onExportPdf,
  onStartOver,
  isExportingPdf,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar__row">
        <p className="toolbar__summary">{count} requirement{count === 1 ? '' : 's'} loaded</p>
        <div className="toolbar__actions">
          <div className="zoom-control" role="group" aria-label="Board zoom">
            <button type="button" className="zoom-control__button" onClick={onZoomOut} aria-label="Zoom out">
              −
            </button>
            <button
              type="button"
              className="zoom-control__level"
              onClick={onZoomReset}
              title="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button type="button" className="zoom-control__button" onClick={onZoomIn} aria-label="Zoom in">
              +
            </button>
          </div>
          <button type="button" className="nhsuk-button nhsuk-button--secondary" onClick={onStartOver}>
            Import new file
          </button>
          <button type="button" className="nhsuk-button nhsuk-button--secondary" onClick={onExportCsv}>
            Export CSV
          </button>
          <button type="button" className="nhsuk-button" onClick={onExportPdf} disabled={isExportingPdf}>
            {isExportingPdf ? 'Generating PDF…' : 'Export PDF'}
          </button>
        </div>
      </div>
      {warnings.length > 0 && (
        <div className="nhsuk-warning-callout" role="status">
          {warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      )}
    </div>
  );
}
