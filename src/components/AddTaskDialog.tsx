import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Priority } from '@/types';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AddClientInlineForm from '@/components/AddClientDialog';

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultColumnId: string | null;
}

const AddTaskDialog: React.FC<AddTaskDialogProps> = ({
  open,
  onOpenChange,
  defaultColumnId,
}) => {
  const { state, dispatch } = useApp();
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState<string>('none');
  const [priority, setPriority] = useState<Priority>('medium');
  const [isBillable, setIsBillable] = useState(true);
  const [hourlyRate, setHourlyRate] = useState<string>('');
  const [timeEstimate, setTimeEstimate] = useState<string>('');
  const [columnId, setColumnId] = useState<string>(defaultColumnId || state.columns[0]?.id || '');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  React.useEffect(() => {
    if (defaultColumnId) setColumnId(defaultColumnId);
  }, [defaultColumnId]);

  React.useEffect(() => {
    if (!open) setShowNewClientForm(false);
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const pendingTag = tagInput.trim().replace(/,$/, '').trim();
    const finalTags = pendingTag && !tags.includes(pendingTag)
      ? [...tags, pendingTag]
      : tags;

    dispatch({
      type: 'ADD_TASK',
      payload: {
        title: title.trim(),
        description: description.trim(),
        columnId,
        clientId: clientId === 'none' ? null : clientId,
        priority,
        isBillable,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        timeEstimate: timeEstimate ? parseFloat(timeEstimate) * 3600 : null,
        timeSpent: 0,
        dueDate: null,
        tags: finalTags,
      },
    });

    setTitle('');
    setDescription('');
    setClientId('none');
    setPriority('medium');
    setIsBillable(true);
    setHourlyRate('');
    setTimeEstimate('');
    setTags([]);
    setTagInput('');
    onOpenChange(false);
  };

  const handleClientCreated = (newClientId: string) => {
    setClientId(newClientId);
    setShowNewClientForm(false);
  };

  const addTag = (value: string) => {
    const trimmed = value.trim().replace(/,$/, '').trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const selectedClient = state.clients.find(c => c.id === clientId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.createNewTask}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">{t.title}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.enterTaskTitle}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">{t.description}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.addDescription}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Column */}
          <div>
            <Label>Column</Label>
            <Select value={columnId} onValueChange={setColumnId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {state.columns.map((col) => (
                  <SelectItem key={col.id} value={col.id}>
                    {col.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Client */}
          <div>
            <Label>{t.client}</Label>
            {showNewClientForm ? (
              <div className="mt-1">
                <AddClientInlineForm
                  onClientCreated={handleClientCreated}
                  onCancel={() => setShowNewClientForm(false)}
                />
              </div>
            ) : (
              <Select
                value={clientId}
                onValueChange={(value) => {
                  if (value === '__add_new__') {
                    setShowNewClientForm(true);
                  } else {
                    setClientId(value);
                  }
                }}
              >
                <SelectTrigger data-testid="client-select">
                  <SelectValue placeholder={t.selectClient} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t.noClient}</SelectItem>
                  {state.clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                  <SelectItem value="__add_new__" className="text-primary font-medium">
                    {t.addNewClient}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Priority */}
          <div>
            <Label>{t.priority}</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-priority-high" />
                    {t.high}
                  </span>
                </SelectItem>
                <SelectItem value="medium">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-priority-medium" />
                    {t.medium}
                  </span>
                </SelectItem>
                <SelectItem value="low">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-priority-low" />
                    {t.low}
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Billable */}
          <div className="flex items-center justify-between py-2">
            <Label htmlFor="billable">{t.billable}</Label>
            <Switch
              id="billable"
              checked={isBillable}
              onCheckedChange={setIsBillable}
            />
          </div>

          {isBillable && (
            <div>
              <Label>
                {t.hourlyRate}
                {selectedClient && (
                  <span className="text-muted-foreground font-normal ml-1">
                    ({t.clientRate}: ${selectedClient.hourlyRate}/hr)
                  </span>
                )}
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder={t.clientRate}
                />
                <span className="text-muted-foreground">/hr</span>
              </div>
            </div>
          )}

          {/* Time Estimate */}
          <div>
            <Label>{t.timeEstimate} ({t.hours})</Label>
            <Input
              type="number"
              value={timeEstimate}
              onChange={(e) => setTimeEstimate(e.target.value)}
              placeholder="e.g., 4"
              step="0.5"
            />
          </div>

          {/* Tags */}
          <div>
            <Label>{t.tags}</Label>
            <div className="mt-1 flex flex-wrap gap-1 p-2 border border-input rounded-md min-h-9 items-center">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-xs">
                  <span className="max-w-[120px] truncate">{tag}</span>
                  <X
                    className="h-3 w-3 cursor-pointer shrink-0"
                    aria-label={`remove ${tag}`}
                    role="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
              <input
                data-testid="tag-input"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => addTag(tagInput)}
                placeholder={tags.length === 0 ? t.pressEnterToAddTag : t.addTag}
                className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              {t.cancel}
            </Button>
            <Button type="submit" className="flex-1" disabled={!title.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              {t.createTask}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskDialog;
