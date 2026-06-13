import { useState, type KeyboardEvent } from 'react';
import { Sparkles, Loader2, Key, Send, Bot, MessageSquare } from 'lucide-react';
import { Alert } from '../ui/Alert';
import { PromptTemplates } from './PromptTemplates';
import { useAiInsights } from '../../hooks/useAiInsights';
import type { PromptTemplate } from '../../lib/promptTemplates';
import { buildFreeTextPrompt } from '../../lib/promptTemplates';

function ResponseSkeleton() {
  return (
    <div className="space-y-3 py-1">
      <div className="h-3 w-full animate-pulse rounded bg-slate-700" />
      <div className="h-3 w-11/12 animate-pulse rounded bg-slate-700" />
      <div className="h-3 w-4/5 animate-pulse rounded bg-slate-700" />
    </div>
  );
}

interface InsightsPanelProps {
  onRequestApiKey: () => void;
}

export function InsightsPanel({ onRequestApiKey }: InsightsPanelProps) {
  const {
    text,
    loading,
    error,
    selectedLabel,
    generateWithPrompt,
    hasApiKey,
    assets,
    mortgage,
    chartData,
    scenario,
  } = useAiInsights();

  const [freeText, setFreeText] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const ensureApiKey = (): boolean => {
    if (!hasApiKey) {
      onRequestApiKey();
      return false;
    }
    return true;
  };

  const handleTemplate = (template: PromptTemplate) => {
    if (!ensureApiKey()) return;
    setSelectedTemplateId(template.id);
    const prompt = template.buildPrompt(assets, mortgage, chartData, scenario);
    void generateWithPrompt(prompt, template.label);
  };

  const handleFreeTextSubmit = () => {
    if (!ensureApiKey() || !freeText.trim() || loading) return;
    setSelectedTemplateId(null);
    const prompt = buildFreeTextPrompt(freeText.trim(), assets, mortgage, chartData, scenario);
    void generateWithPrompt(prompt, `שאלה חופשית: ${freeText.trim()}`);
    setFreeText('');
  };

  const handleFreeTextKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleFreeTextSubmit();
    }
  };

  const showResponse = loading || !!text;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold text-white">תובנות AI</h2>
        </div>
        <button
          type="button"
          onClick={onRequestApiKey}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-card px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-accent hover:text-white"
        >
          <Key className="h-3.5 w-3.5" />
          מפתח API
        </button>
      </div>

      <div className="relative">
        <PromptTemplates
          onSelect={handleTemplate}
          loading={loading}
          selectedTemplateId={selectedTemplateId}
          disabled={!hasApiKey}
        />

        {!hasApiKey && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="flex max-w-xs flex-col items-center gap-4 rounded-xl border border-slate-700 bg-navy/90 p-6 text-center shadow-xl backdrop-blur-sm">
              <Bot className="h-12 w-12 text-slate-500" />
              <p className="text-sm text-slate-400">
                חבר את מפתח ה-API כדי לקבל תובנות חכמות
              </p>
              <button
                type="button"
                onClick={onRequestApiKey}
                className="flex items-center gap-2 rounded-lg bg-accent/15 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/25"
              >
                <Key className="h-4 w-4" />
                הוסף מפתח API
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <MessageSquare className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              onKeyDown={handleFreeTextKeyDown}
              rows={2}
              placeholder="שאל שאלה חופשית על המצב הפיננסי שלך..."
              disabled={loading}
              className="min-h-11 w-full resize-none rounded-xl border border-slate-700 bg-card py-2.5 pl-3 pr-10 text-sm leading-relaxed text-white outline-none transition-colors placeholder:text-slate-500 focus:border-accent disabled:opacity-50"
            />
          </div>
          <button
            type="button"
            onClick={handleFreeTextSubmit}
            disabled={loading || !freeText.trim()}
            aria-label="שלח שאלה"
            className="flex h-11 w-11 shrink-0 items-center justify-center self-center rounded-xl bg-accent text-white transition-colors hover:bg-accent/80 disabled:opacity-50"
          >
            {loading && !selectedTemplateId ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-slate-500">
          <kbd className="rounded border border-slate-600 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px]">
            Ctrl+Enter
          </kbd>{' '}
          לשליחה
        </p>
      </div>

      {error && (
        <Alert variant="error" title="שגיאה">
          {error}
        </Alert>
      )}

      {showResponse && (
        <div className="rounded-xl border border-accent/50 bg-card p-5">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-700 pb-3">
            {selectedLabel && (
              <p className="text-sm font-medium text-white">{selectedLabel}</p>
            )}
            <span className="shrink-0 rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-semibold text-accent">
              AI
            </span>
          </div>

          {loading && !text ? (
            <ResponseSkeleton />
          ) : (
            <div className="whitespace-pre-wrap text-sm leading-[1.8] text-slate-200">
              {text}
              {loading && (
                <span className="mr-1 inline-block h-4 w-1 animate-pulse bg-accent" />
              )}
            </div>
          )}

          <p className="mt-4 text-xs text-slate-500">
            נוצר על ידי Claude · המידע הוא לצורך עזר בלבד
          </p>
        </div>
      )}

    </section>
  );
}
