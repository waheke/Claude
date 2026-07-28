import { useState } from 'react';
import { Header } from './components/Header';
import { ImportPanel } from './components/ImportPanel';
import { Toolbar } from './components/Toolbar';
import { Board } from './components/Board';
import type { ParseResult, Priority, Requirement } from './types';
import { detectPriority, rewritePriorityWord } from './lib/priority';
import { downloadCsv } from './lib/exportCsv';
import { exportNodeToPdf } from './lib/exportPdf';

function uniqueInOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }
  return result;
}

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 1.5;
const ZOOM_STEP = 0.1;

export default function App() {
  const [requirements, setRequirements] = useState<Requirement[] | null>(null);
  const [epics, setEpics] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [zoom, setZoom] = useState(1);

  function handleImport(result: ParseResult) {
    setRequirements(result.requirements);
    setEpics(uniqueInOrder(result.requirements.map((r) => r.epic)));
    setWarnings(result.warnings);
  }

  function handleMove(requirementId: string, targetEpic: string, targetPriority: Priority) {
    setRequirements((prev) => {
      if (!prev) return prev;
      return prev.map((req) => {
        if (req.id !== requirementId) return req;
        const priorityChanged = req.priority !== targetPriority;
        return {
          ...req,
          epic: targetEpic,
          priority: targetPriority,
          requirementText: priorityChanged
            ? rewritePriorityWord(req.requirementText, targetPriority)
            : req.requirementText,
          priorityInferred: false,
        };
      });
    });
  }

  function handleEditRequirement(requirementId: string, featureName: string, requirementText: string) {
    setRequirements((prev) => {
      if (!prev) return prev;
      return prev.map((req) => {
        if (req.id !== requirementId) return req;
        const detected = detectPriority(requirementText);
        return {
          ...req,
          featureName,
          requirementText,
          priority: detected ?? req.priority,
          priorityInferred: !detected,
        };
      });
    });
  }

  function handleAddRequirement(epic: string, priority: Priority, featureName: string, requirementText: string) {
    const detected = detectPriority(requirementText);
    const newRequirement: Requirement = {
      id: crypto.randomUUID(),
      epic,
      featureName,
      requirementText,
      priority: detected ?? priority,
      priorityInferred: !detected,
    };
    setRequirements((prev) => (prev ? [...prev, newRequirement] : [newRequirement]));
  }

  function handleZoomIn() {
    setZoom((z) => Math.min(MAX_ZOOM, Math.round((z + ZOOM_STEP) * 100) / 100));
  }

  function handleZoomOut() {
    setZoom((z) => Math.max(MIN_ZOOM, Math.round((z - ZOOM_STEP) * 100) / 100));
  }

  function handleZoomReset() {
    setZoom(1);
  }

  function handleStartOver() {
    setRequirements(null);
    setEpics([]);
    setWarnings([]);
  }

  function handleExportCsv() {
    if (!requirements) return;
    downloadCsv(requirements);
  }

  async function handleExportPdf() {
    const node = document.getElementById('board-capture');
    if (!node) return;
    setIsExportingPdf(true);
    const previousZoom = zoom;
    setZoom(1);
    try {
      // Let the zoom reset reflow and paint before capturing.
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await exportNodeToPdf(node);
    } finally {
      setZoom(previousZoom);
      setIsExportingPdf(false);
    }
  }

  return (
    <div className="app">
      <Header />
      {!requirements ? (
        <ImportPanel onImport={handleImport} />
      ) : (
        <main className="app-main">
          <Toolbar
            count={requirements.length}
            warnings={warnings}
            onExportCsv={handleExportCsv}
            onExportPdf={handleExportPdf}
            onStartOver={handleStartOver}
            isExportingPdf={isExportingPdf}
            zoom={zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
          />
          <Board
            requirements={requirements}
            epics={epics}
            onMove={handleMove}
            onEdit={handleEditRequirement}
            onAdd={handleAddRequirement}
            zoom={zoom}
          />
        </main>
      )}
    </div>
  );
}
