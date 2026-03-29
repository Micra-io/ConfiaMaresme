import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Check, X, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

type EditMode = 'text' | 'textarea' | 'select' | 'multi-select';

interface InlineEditCellProps {
  value: string | string[] | null;
  field: string;
  mode: EditMode;
  options?: { value: string; label: string }[];
  onSave: (field: string, value: string | string[] | null) => Promise<void>;
  placeholder?: string;
  className?: string;
}

const InlineEditCell = ({ value, field, mode, options, onSave, placeholder = '—', className }: InlineEditCellProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string | string[]>(value ?? (mode === 'multi-select' ? [] : ''));
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const saveValue = mode === 'multi-select'
        ? (draft as string[])
        : (draft as string).trim() || null;
      await onSave(field, saveValue);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(value ?? (mode === 'multi-select' ? [] : ''));
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && mode !== 'textarea') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') handleCancel();
  };

  if (!editing) {
    const displayValue = mode === 'multi-select'
      ? (value as string[] | null)?.length
        ? (value as string[]).map(v => {
            const opt = options?.find(o => o.value === v);
            return opt?.label ?? v;
          }).join(', ')
        : null
      : mode === 'select'
        ? options?.find(o => o.value === (value as string))?.label ?? value
        : value;

    return (
      <div
        className={cn(
          'group flex items-center gap-1 cursor-pointer rounded px-1.5 py-1 -mx-1.5 hover:bg-muted/50 transition-colors min-h-[28px]',
          className
        )}
        onClick={() => {
          setDraft(value ?? (mode === 'multi-select' ? [] : ''));
          setEditing(true);
        }}
      >
        <span className={cn('text-sm truncate', !displayValue && 'text-muted-foreground/50 italic')}>
          {displayValue || placeholder}
        </span>
        <Pencil className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>
    );
  }

  if (mode === 'select') {
    return (
      <div className="flex items-center gap-1">
        <Select
          value={draft as string}
          onValueChange={(v) => {
            setDraft(v);
          }}
        >
          <SelectTrigger className="h-7 text-xs w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options?.map(o => (
              <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button onClick={handleSave} disabled={saving} className="text-emerald-600 hover:text-emerald-700">
          <Check className="h-3.5 w-3.5" />
        </button>
        <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  if (mode === 'multi-select') {
    const selected = draft as string[];
    return (
      <div className="space-y-1">
        <div className="flex flex-wrap gap-1">
          {options?.map(o => (
            <Badge
              key={o.value}
              variant={selected.includes(o.value) ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer text-[10px] px-1.5 py-0',
                selected.includes(o.value) ? 'bg-primary' : 'opacity-50 hover:opacity-100'
              )}
              onClick={() => {
                setDraft(
                  selected.includes(o.value)
                    ? selected.filter(v => v !== o.value)
                    : [...selected, o.value]
                );
              }}
            >
              {o.label}
            </Badge>
          ))}
        </div>
        <div className="flex gap-1">
          <button onClick={handleSave} disabled={saving} className="text-emerald-600 hover:text-emerald-700">
            <Check className="h-3.5 w-3.5" />
          </button>
          <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'textarea') {
    return (
      <div className="space-y-1">
        <Textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={draft as string}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-16 text-xs resize-none"
          disabled={saving}
        />
        <div className="flex gap-1">
          <button onClick={handleSave} disabled={saving} className="text-emerald-600 hover:text-emerald-700">
            <Check className="h-3.5 w-3.5" />
          </button>
          <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // text mode
  return (
    <div className="flex items-center gap-1">
      <Input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        value={draft as string}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-7 text-xs"
        disabled={saving}
      />
      <button onClick={handleSave} disabled={saving} className="text-emerald-600 hover:text-emerald-700">
        <Check className="h-3.5 w-3.5" />
      </button>
      <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default InlineEditCell;
