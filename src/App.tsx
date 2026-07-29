import { useState } from 'react';
import { Header } from './components/Header';
import { ImportPanel } from './components/ImportPanel';
import { Toolbar } from './components/Toolbar';
import { Board } from './components/Board';
import type { ParseResult, Priority, Requirement } from './types';
import { detectPriority, rewritePriorityWord } from './lib/priority';
import { downloadCsv } from './lib/exportCsv';
import { exportNodeToPdf } from './lib/exportPdf';
import { exportNodeToPng } from './lib/exportPng';

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

function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(zoom * 100) / 100));
}

export default function App() {
  const [requirements, setRequirements] = useState<Requirement[] | null>(null);
  const [epics, setEpics] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
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
      owner: '',
    };
    setRequirements((prev) => (prev ? [...prev, newRequirement] : [newRequirement]));
  }

  function handleChangeOwner(requirementId: string, owner: string) {
    setRequirements((prev) => {
      if (!prev) return prev;
      return prev.map((req) => (req.id === requirementId ? { ...req, owner } : req));
    });
  }

  function handleZoomBy(delta: number) {
    setZoom((z) => clampZoom(z + delta));
  }

  function handleZoomScale(factor: number) {
    setZoom((z) => clampZoom(z * factor));
  }

  function handleZoomIn() {
    handleZoomBy(ZOOM_STEP);
  }

  function handleZoomOut() {
    handleZoomBy(-ZOOM_STEP);
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

  /** Runs a board capture at 100% zoom regardless of the current on-screen zoom, restoring it after. */
  async function captureBoardAtFullZoom(capture: (node: HTMLElement) => Promise<void>) {
    const node = document.getElementById('board-capture');
    if (!node) return;
    const previousZoom = zoom;
    setZoom(1);
    try {
      // Let the zoom reset reflow and paint before capturing.
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await capture(node);
    } finally {
      setZoom(previousZoom);
    }
  }

  async function handleExportPdf() {
    setIsExportingPdf(true);
    try {
      await captureBoardAtFullZoom(exportNodeToPdf);
    } finally {
      setIsExportingPdf(false);
    }
  }

  async function handleExportPng() {
    setIsExportingPng(true);
    try {
      await captureBoardAtFullZoom(exportNodeToPng);
    } finally {
      setIsExportingPng(false);
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
            onExportPng={handleExportPng}
            onStartOver={handleStartOver}
            isExportingPdf={isExportingPdf}
            isExportingPng={isExportingPng}
            zoom={zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
          />
          <Board
            requirements={requirements}
            epics={epics}
            owners={uniqueInOrder(requirements.map((r) => r.owner).filter(Boolean))}
            onMove={handleMove}
            onEdit={handleEditRequirement}
            onAdd={handleAddRequirement}
            onChangeOwner={handleChangeOwner}
            zoom={zoom}
            onZoomBy={handleZoomBy}
            onZoomScale={handleZoomScale}
          />
        </main>
      )}
    </div>
  );
}
