import { Building2, Key } from 'lucide-react';

interface HeaderProps {
  onApiKeyClick: () => void;
}

export function Header({ onApiKeyClick }: HeaderProps) {
  return (
    <header className="border-b border-slate-700/50 bg-card/50 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
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
        <button
          type="button"
          onClick={onApiKeyClick}
          className="flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-accent hover:text-accent"
        >
          <Key className="h-4 w-4" />
          <span className="hidden sm:inline">מפתח API</span>
        </button>
      </div>
    </header>
  );
}
