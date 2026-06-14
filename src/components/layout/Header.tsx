import { Building2, Key, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';

interface HeaderProps {
  onApiKeyClick: () => void;
  onExportXlsx: () => void;
  onExportPdf: () => void;
  exporting: boolean;
}

export function Header({ onApiKeyClick, onExportXlsx, onExportPdf, exporting }: HeaderProps) {
  return (
    <header className="border-b border-slate-700/50 bg-card/50 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
            <Building2 className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white sm:text-xl">
              סימולטור נכסים ומשכנתא
            </h1>
            <p className="text-xs text-slate-500">תכנון פיננסי אישי</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportXlsx}
            disabled={exporting}
            title="ייצוא לאקסל"
            aria-label="ייצוא לאקסל"
            className="flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">לאקסל</span>
          </button>
          <button
            type="button"
            onClick={() => void onExportPdf()}
            disabled={exporting}
            title="ייצוא לקובץ PDF"
            aria-label="ייצוא לקובץ PDF"
            className="flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">לקובץ PDF</span>
          </button>
          <button
            type="button"
            onClick={onApiKeyClick}
            aria-label="הגדרת מפתח ממשק"
            className="flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-accent hover:text-accent"
          >
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">מפתח ממשק</span>
          </button>
        </div>
      </div>
    </header>
  );
}
