import { Loader2 } from 'lucide-react';
import type { PromptTemplate } from '../../lib/promptTemplates';
import { PROMPT_CATEGORY_GROUPS, PROMPT_TEMPLATES } from '../../lib/promptTemplates';

interface PromptTemplatesProps {
  onSelect: (template: PromptTemplate) => void;
  loading: boolean;
  selectedTemplateId: string | null;
  disabled?: boolean;
}

function CategoryDivider({ label, emoji }: { label: string; emoji: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="shrink-0 text-xs font-semibold text-slate-500">
        {emoji} {label}
      </span>
      <div className="h-px flex-1 bg-slate-700" />
    </div>
  );
}

function TemplateCard({
  template,
  loading,
  selected,
  disabled,
  onSelect,
}: {
  template: PromptTemplate;
  loading: boolean;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const Icon = template.icon;
  const showLoader = loading && selected;

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onSelect}
      className={`group flex flex-col items-start gap-2 rounded-xl border p-4 text-right transition-all ${
        selected
          ? 'border-accent bg-accent/10'
          : 'border-slate-700 bg-card hover:border-accent'
      } ${disabled || loading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
    >
      {showLoader ? (
        <Loader2 className="h-7 w-7 animate-spin text-accent" />
      ) : (
        <Icon className="h-7 w-7 text-accent" />
      )}
      <span className="text-sm font-medium text-white">{template.label}</span>
      <span className="text-xs leading-relaxed text-slate-500">{template.description}</span>
    </button>
  );
}

export function PromptTemplates({
  onSelect,
  loading,
  selectedTemplateId,
  disabled = false,
}: PromptTemplatesProps) {
  return (
    <div className={`space-y-5 ${disabled ? 'pointer-events-none blur-sm' : ''}`}>
      {PROMPT_CATEGORY_GROUPS.map((group) => {
        const templates = PROMPT_TEMPLATES.filter((t) => t.category === group.id);
        if (templates.length === 0) return null;

        return (
          <div key={group.id} className="space-y-3">
            <CategoryDivider label={group.label} emoji={group.emoji} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  loading={loading}
                  selected={selectedTemplateId === template.id}
                  disabled={disabled}
                  onSelect={() => onSelect(template)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
