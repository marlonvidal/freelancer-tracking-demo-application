import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PRESET_COLORS = [
  '#6366f1',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#ef4444',
  '#8b5cf6',
  '#14b8a6',
];

interface AddClientInlineFormProps {
  onClientCreated: (clientId: string) => void;
  onCancel: () => void;
}

/**
 * Inline form for creating a new client, rendered directly inside the
 * parent dialog/panel — no nested Radix Dialog, no dismiss-layer conflicts.
 */
const AddClientInlineForm: React.FC<AddClientInlineFormProps> = ({
  onClientCreated,
  onCancel,
}) => {
  const { dispatch } = useApp();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    const parsed = parseFloat(hourlyRate);
    const rate = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    const newId = uuidv4();
    dispatch({
      type: 'ADD_CLIENT',
      payload: { id: newId, name: name.trim(), hourlyRate: rate, color },
    });
    onClientCreated(newId);
  };

  const handleCancel = () => {
    setName('');
    setHourlyRate('');
    setColor(PRESET_COLORS[0]);
    setSaving(false);
    onCancel();
  };

  return (
    <div
      className="rounded-md border border-border bg-muted/40 p-4 space-y-3"
      data-testid="add-client-form"
    >
      <p className="text-sm font-medium">{t.newClient}</p>

      <div>
        <Label htmlFor="new-client-name">{t.clientName}</Label>
        <Input
          id="new-client-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.clientName}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
            if (e.key === 'Escape') { e.preventDefault(); handleCancel(); }
          }}
        />
      </div>

      <div>
        <Label htmlFor="new-client-rate">{t.hourlyRate}</Label>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-muted-foreground">$</span>
          <Input
            id="new-client-rate"
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            placeholder="0"
            min="0"
          />
          <span className="text-muted-foreground">/hr</span>
        </div>
      </div>

      <div>
        <Label>{t.clientColor}</Label>
        <div className="flex gap-2 mt-2 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-7 h-7 rounded-full border-2 transition-all"
              style={{
                backgroundColor: c,
                borderColor: color === c ? 'hsl(var(--foreground))' : 'transparent',
                transform: color === c ? 'scale(1.2)' : 'scale(1)',
              }}
              aria-label={c}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleCancel}
        >
          {t.cancel}
        </Button>
        <Button
          type="button"
          size="sm"
          className="flex-1"
          onClick={handleSave}
          disabled={!name.trim() || saving}
        >
          {t.saveClient}
        </Button>
      </div>
    </div>
  );
};

export default AddClientInlineForm;
