import { useState, useEffect } from 'react';
import { Calendar, Tag, MessageSquare, CheckSquare, Plus, X, Trash2, UserPlus } from 'lucide-react';
import type { Card, Label as LabelType, WorkspaceMember } from '@/types';
import { cardApi } from '@/lib/api';
import { useLanguageStore } from '@/stores/language.store';
import { formatDate, getPriorityColor, cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';

const LABEL_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

interface CardModalProps {
  card: Card | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (cardId: string, data: Partial<Card>) => void;
  members: WorkspaceMember[];
}

export function CardModal({ card, open, onClose, onUpdate, members }: CardModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Card['comments']>([]);
  const [checklists, setChecklists] = useState<Card['checklists']>([]);
  const [labels, setLabels] = useState<LabelType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [showAddLabel, setShowAddLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0]);
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  const { t } = useLanguageStore();

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
      setPriority(card.priority);
      setDueDate(card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '');
      setAssigneeId(card.assigneeId);
      loadCardDetails(card.id);
    }
  }, [card]);

  const loadCardDetails = async (cardId: string) => {
    try {
      const { data } = await cardApi.getById(cardId);
      setComments(data.data.comments || []);
      setChecklists(data.data.checklists || []);
      setLabels(data.data.labels || []);
    } catch (error) {
      console.error('Failed to load card details:', error);
    }
  };

  const handleSave = async () => {
    if (!card) return;

    setIsLoading(true);
    try {
      await cardApi.update(card.id, {
        title,
        description: description || undefined,
        priority,
        dueDate: dueDate || undefined,
        assigneeId: assigneeId || undefined,
      });
      const assignee = members.find((m) => m.user.id === assigneeId)?.user || null;
      onUpdate(card.id, { title, description, priority, dueDate: dueDate || null, assigneeId, assignee });
      onClose();
    } catch (error) {
      console.error('Failed to update card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!card || !newComment.trim()) return;

    try {
      const { data } = await cardApi.addComment(card.id, newComment.trim());
      setComments([data.data, ...(comments || [])]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleAddChecklist = async () => {
    if (!card || !newChecklistTitle.trim()) return;

    try {
      const { data } = await cardApi.addChecklist(card.id, newChecklistTitle.trim());
      setChecklists([...(checklists || []), data.data]);
      setNewChecklistTitle('');
      setShowAddChecklist(false);
    } catch (error) {
      console.error('Failed to add checklist:', error);
    }
  };

  const handleToggleChecklist = async (checklistId: string) => {
    if (!card) return;

    try {
      const { data } = await cardApi.toggleChecklist(card.id, checklistId);
      setChecklists(checklists?.map((c) => (c.id === checklistId ? data.data : c)) || []);
    } catch (error) {
      console.error('Failed to toggle checklist:', error);
    }
  };

  const handleDeleteChecklist = async (checklistId: string) => {
    if (!card) return;

    try {
      await cardApi.deleteChecklist(card.id, checklistId);
      setChecklists(checklists?.filter((c) => c.id !== checklistId) || []);
    } catch (error) {
      console.error('Failed to delete checklist:', error);
    }
  };

  const handleAddLabel = async () => {
    if (!card || !newLabelName.trim()) return;

    try {
      const { data } = await cardApi.addLabel(card.id, newLabelName.trim(), newLabelColor);
      setLabels([...labels, data.data]);
      setNewLabelName('');
      setNewLabelColor(LABEL_COLORS[0]);
      setShowAddLabel(false);
    } catch (error) {
      console.error('Failed to add label:', error);
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    if (!card) return;

    try {
      await cardApi.deleteLabel(card.id, labelId);
      setLabels(labels.filter((l) => l.id !== labelId));
    } catch (error) {
      console.error('Failed to delete label:', error);
    }
  };

  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] md:w-full mx-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-8">
            <span className={cn('h-3 w-3 rounded-full', getPriorityColor(priority))} />
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg sm:text-xl font-semibold border-none p-0 focus-visible:ring-0"
            />
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:gap-6 py-4">
          <div className="grid gap-2">
            <Label>{t.card.description}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.card.descriptionPlaceholder}
              rows={3}
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {t.card.priority}
              </Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">{t.card.low}</SelectItem>
                  <SelectItem value="MEDIUM">{t.card.medium}</SelectItem>
                  <SelectItem value="HIGH">{t.card.high}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t.card.dueDate}
              </Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                {t.card.assignee}
              </Label>
              {!showAssigneePicker && (
                <Button size="sm" variant="ghost" onClick={() => setShowAssigneePicker(true)} className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  {t.card.changeAssignee}
                </Button>
              )}
            </div>

            {assigneeId ? (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={members.find((m) => m.user.id === assigneeId)?.user.avatar || undefined} />
                  <AvatarFallback>{members.find((m) => m.user.id === assigneeId)?.user.name.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{members.find((m) => m.user.id === assigneeId)?.user.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-auto"
                  onClick={() => setAssigneeId(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t.card.noAssignee}</p>
            )}

            {showAssigneePicker && (
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                {members.map((member) => (
                  <button
                    key={member.id}
                    className={cn(
                      'flex items-center gap-2 w-full p-2 rounded-lg hover:bg-muted text-left',
                      assigneeId === member.user.id && 'bg-muted'
                    )}
                    onClick={() => {
                      setAssigneeId(member.user.id);
                      setShowAssigneePicker(false);
                    }}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={member.user.avatar || undefined} />
                      <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{member.user.name}</span>
                  </button>
                ))}
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowAssigneePicker(false)}
                >
                  {t.common.cancel}
                </Button>
              </div>
            )}
          </div>

          {/* Labels */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {t.card.labels}
              </Label>
              {!showAddLabel && (
                <Button size="sm" variant="ghost" onClick={() => setShowAddLabel(true)} className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  {t.card.addLabel}
                </Button>
              )}
            </div>

            {showAddLabel && (
              <div className="space-y-2">
                <Input
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  placeholder={t.card.labelName}
                  className="h-8 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddLabel()}
                />
                <div className="flex flex-wrap gap-2">
                  {LABEL_COLORS.map((color) => (
                    <button
                      key={color}
                      className={cn(
                        'h-6 w-6 rounded-md transition-transform',
                        newLabelColor === color && 'ring-2 ring-offset-2 ring-primary scale-110'
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewLabelColor(color)}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddLabel} disabled={!newLabelName.trim()} className="h-8">
                    {t.common.add}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddLabel(false)} className="h-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {labels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {labels.map((label) => (
                  <div
                    key={label.id}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-white text-xs"
                    style={{ backgroundColor: label.color }}
                  >
                    <span>{label.name}</span>
                    <button
                      onClick={() => handleDeleteLabel(label.id)}
                      className="hover:bg-white/20 rounded p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checklists */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                {t.card.checklists}
              </Label>
              {!showAddChecklist && (
                <Button size="sm" variant="ghost" onClick={() => setShowAddChecklist(true)} className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  {t.card.addChecklist}
                </Button>
              )}
            </div>

            {showAddChecklist && (
              <div className="flex gap-2">
                <Input
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                  placeholder={t.card.checklistTitle}
                  className="h-8 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
                />
                <Button size="sm" onClick={handleAddChecklist} className="h-8">{t.common.add}</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddChecklist(false)} className="h-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {checklists?.map((checklist) => (
              <div key={checklist.id} className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <Checkbox
                      checked={checklist.isCompleted}
                      onCheckedChange={() => handleToggleChecklist(checklist.id)}
                    />
                    <span className={cn('text-sm font-medium', checklist.isCompleted && 'line-through text-muted-foreground')}>
                      {checklist.title}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteChecklist(checklist.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Comments */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {t.card.comments}
            </Label>

            <div className="flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t.card.writeComment}
                className="text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <Button onClick={handleAddComment} disabled={!newComment.trim()} size="sm">
                {t.common.add}
              </Button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {comments?.map((comment) => (
                <div key={comment.id} className="flex gap-2 p-2 sm:p-3 bg-muted rounded-lg">
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                    <AvatarImage src={comment.user.avatar || undefined} />
                    <AvatarFallback className="text-xs">{comment.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-xs sm:text-sm">{comment.user.name}</span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm mt-1 break-words">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            {t.common.cancel}
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? t.card.saving : t.card.saveChanges}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
