import { useState, useEffect } from 'react';
import { Calendar, Tag, User, MessageSquare } from 'lucide-react';
import type { Card } from '@/types';
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

interface CardModalProps {
  card: Card | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (cardId: string, data: Partial<Card>) => void;
}

export function CardModal({ card, open, onClose, onUpdate }: CardModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Card['comments']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguageStore();

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
      setPriority(card.priority);
      setDueDate(card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '');
      loadCardDetails(card.id);
    }
  }, [card]);

  const loadCardDetails = async (cardId: string) => {
    try {
      const { data } = await cardApi.getById(cardId);
      setComments(data.data.comments || []);
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
      });
      onUpdate(card.id, { title, description, priority, dueDate: dueDate || null });
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

  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] md:w-full mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className={cn('h-3 w-3 rounded-full', getPriorityColor(priority))} />
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-semibold border-none p-0 focus-visible:ring-0"
            />
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label>{t.card.description}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.card.descriptionPlaceholder}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {t.card.priority}
              </Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                <SelectTrigger>
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
              />
            </div>
          </div>

          {card.assignee && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t.card.assignedTo}</span>
              <Avatar className="h-6 w-6">
                <AvatarImage src={card.assignee.avatar || undefined} />
                <AvatarFallback>{card.assignee.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{card.assignee.name}</span>
            </div>
          )}

          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {t.card.comments}
            </Label>

            <div className="flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t.card.writeComment}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                {t.common.add}
              </Button>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto">
              {comments?.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-3 bg-muted rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user.avatar || undefined} />
                    <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? t.card.saving : t.card.saveChanges}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
