import { useEffect, useState } from 'react';
import { Key, Shield, ExternalLink } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Alert } from '../ui/Alert';
import { useSettingsStore } from '../../store/useSettingsStore';
import { OPENROUTER_MODEL, OPENROUTER_MODEL_URL } from '../../lib/aiInsights';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const apiKey = useSettingsStore((s) => s.openRouterApiKey);
  const setApiKey = useSettingsStore((s) => s.setApiKey);
  const clearApiKey = useSettingsStore((s) => s.clearApiKey);
  const [input, setInput] = useState(apiKey ?? '');

  useEffect(() => {
    if (isOpen) {
      setInput(apiKey ?? '');
    }
  }, [isOpen, apiKey]);

  const handleSave = () => {
    if (input.trim()) {
      setApiKey(input.trim());
      onClose();
    }
  };

  const handleClear = () => {
    clearApiKey();
    setInput('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="הגדרת מפתח OpenRouter" size="sm">
      <div className="space-y-4">
        <Alert variant="info" title="פרטיות">
          <p>
            מפתח ה-API נשמר רק בדפדפן שלך (localStorage) ונשלח ישירות ל-OpenRouter בלבד.
          </p>
        </Alert>

        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 text-xs text-slate-400">
          <p className="mb-1 font-medium text-slate-300">מודל בשימוש:</p>
          <a
            href={OPENROUTER_MODEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-accent hover:underline"
          >
            {OPENROUTER_MODEL}
            <ExternalLink className="h-3 w-3" />
          </a>
          <p className="mt-1">חינמי — נדרש חשבון ב-OpenRouter</p>
        </div>

        <label className="block space-y-2">
          <span className="flex items-center gap-1.5 text-sm text-slate-300">
            <Key className="h-4 w-4" />
            מפתח OpenRouter API
          </span>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="sk-or-v1-..."
            className="no-spinner w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 font-mono text-sm text-white outline-none focus:border-accent"
          />
        </label>

        <p className="flex items-start gap-1.5 text-xs text-slate-500">
          <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            צור מפתח ב-{' '}
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              openrouter.ai/keys
            </a>
          </span>
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!input.trim()}
            className="flex-1 rounded-lg bg-accent py-2 text-sm font-medium text-white transition-colors hover:bg-accent/80 disabled:opacity-50"
          >
            שמור
          </button>
          {apiKey && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg border border-danger/30 px-4 py-2 text-sm text-danger transition-colors hover:bg-danger/10"
            >
              מחק
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
