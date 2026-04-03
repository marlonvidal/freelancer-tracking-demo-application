import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PRESET_COLORS = [
  '#6366f1', // indigo
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#ef4444', // red
  '#8b5cf6', // violet
  '#14b8a6', // teal
];

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated: (clientId: string) => void;
}

const AddClientDialog: React.FC<AddClientDialogProps> = ({
  open,
  onOpenChange,
  onClientCreated,
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
      payload: {
        id: newId,
        name: name.trim(),
        hourlyRate: rate,
        color,
      },
    });
    onClientCreated(newId);
    handleReset();
    setSaving(false);
  };

  const handleReset = () => {
    setName('');
    setHourlyRate('');
    setColor(PRESET_COLORS[0]);
    setSaving(false);
  };

  const handleCancel = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleCancel(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t.newClient}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="client-name">{t.clientName}</Label>
            <Input
              id="client-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.clientName}
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="client-rate">{t.hourlyRate}</Label>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground">$</span>
              <Input
                id="client-rate"
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

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={handleCancel}>
              {t.cancel}
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleSave}
              disabled={!name.trim() || saving}
            >
              {t.saveClient}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddClientDialog;
