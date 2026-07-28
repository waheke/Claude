interface ToolbarProps {
  count: number;
  warnings: string[];
  onExportCsv: () => void;
  onExportPdf: () => void;
  onStartOver: () => void;
  isExportingPdf: boolean;
}

export function Toolbar({ count, warnings, onExportCsv, onExportPdf, onStartOver, isExportingPdf }: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar__row">
        <p className="toolbar__summary">{count} requirement{count === 1 ? '' : 's'} loaded</p>
        <div className="toolbar__actions">
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
