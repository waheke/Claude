import { useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { fileToRows, parseDelimitedText, rowsToRequirements } from '../lib/parse';
import type { ParseResult } from '../types';

interface ImportPanelProps {
  onImport: (result: ParseResult) => void;
}

export function ImportPanel({ onImport }: ImportPanelProps) {
  const [pasteText, setPasteText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    try {
      const rows = await fileToRows(file);
      const result = rowsToRequirements(rows);
      if (result.requirements.length === 0) {
        setError(result.warnings[0] ?? 'No requirements could be read from that file.');
        return;
      }
      onImport(result);
    } catch {
      setError('Could not read that file. Please upload a valid .xlsx or .csv file.');
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  function handlePasteSubmit() {
    setError(null);
    if (!pasteText.trim()) {
      setError('Paste a table into the box first.');
      return;
    }
    const rows = parseDelimitedText(pasteText);
    const result = rowsToRequirements(rows);
    if (result.requirements.length === 0) {
      setError(result.warnings[0] ?? 'No requirements could be read from the pasted table.');
      return;
    }
    onImport(result);
  }

  return (
    <main className="app-main import-screen">
      <div className="nhsuk-width-container">
        <h1>Import your requirements</h1>
        <p className="import-screen__intro">
          Upload a spreadsheet, or copy a table from Excel and paste it in below. Each row needs
          an <strong>Epic</strong>, a <strong>Feature Name</strong> and a{' '}
          <strong>High Level Requirement</strong> column, plus an optional <strong>Owner</strong>{' '}
          column.
        </p>

        {error && (
          <div className="nhsuk-error-summary" role="alert">
            <p>{error}</p>
          </div>
        )}

        <div className="import-screen__grid">
          <section className="card import-panel" aria-labelledby="upload-heading">
            <h2 id="upload-heading">Upload a file</h2>
            <div
              className={`dropzone${isDragOver ? ' dropzone--active' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              <p>Drag and drop an .xlsx or .csv file here</p>
              <p>or</p>
              <button
                type="button"
                className="nhsuk-button nhsuk-button--secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose file
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="visually-hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                  e.target.value = '';
                }}
              />
            </div>
          </section>

          <section className="card import-panel" aria-labelledby="paste-heading">
            <h2 id="paste-heading">Paste a table</h2>
            <label htmlFor="paste-area" className="visually-hidden">
              Pasted table data
            </label>
            <textarea
              id="paste-area"
              className="paste-area"
              placeholder="Copy a table from Excel (including the header row) and paste it here"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
            />
            <button type="button" className="nhsuk-button" onClick={handlePasteSubmit}>
              Load pasted table
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
