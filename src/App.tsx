import { useState } from 'react';
import { Header } from './components/Header';
import { ImportPanel } from './components/ImportPanel';
import { Toolbar } from './components/Toolbar';
import { Board } from './components/Board';
import type { ParseResult, Priority, Requirement } from './types';
import { rewritePriorityWord } from './lib/priority';
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

export default function App() {
  const [requirements, setRequirements] = useState<Requirement[] | null>(null);
  const [epics, setEpics] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

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
    try {
      await exportNodeToPdf(node);
    } finally {
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
          />
          <Board requirements={requirements} epics={epics} onMove={handleMove} />
        </main>
      )}
    </div>
  );
}
