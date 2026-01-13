import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MessageSquare, CheckSquare, Trash2 } from 'lucide-react';
import type { Card } from '@/types';
import { cn, formatDate, getPriorityColor } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface BoardCardProps {
  card: Card;
  onClick: () => void;
  onDelete: () => void;
}

export function BoardCard({ card, onClick, onDelete }: BoardCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card', card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group cursor-pointer rounded-lg bg-white dark:bg-slate-700 p-2 sm:p-3 shadow-sm hover:shadow-md transition-shadow touch-manipulation',
        isDragging && 'opacity-50 shadow-lg'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {card.labels.slice(0, 3).map((label) => (
                <span
                  key={label.id}
                  className="h-1.5 w-8 rounded-full"
                  style={{ backgroundColor: label.color }}
                />
              ))}
              {card.labels.length > 3 && (
                <span className="text-xs text-slate-500">+{card.labels.length - 3}</span>
              )}
            </div>
          )}

          <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-2">{card.title}</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          onClick={handleDelete}
        >
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
        <span className={cn('h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full flex-shrink-0', getPriorityColor(card.priority))} />

        {card.dueDate && (
          <div className="flex items-center gap-0.5 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="hidden sm:inline">{formatDate(card.dueDate)}</span>
            <span className="sm:hidden">{new Date(card.dueDate).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}</span>
          </div>
        )}

        {card._count && card._count.comments > 0 && (
          <div className="flex items-center gap-0.5 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
            <MessageSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            {card._count.comments}
          </div>
        )}

        {card._count && card._count.checklists > 0 && (
          <div className="flex items-center gap-0.5 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
            <CheckSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            {card._count.checklists}
          </div>
        )}

        {card.assignee && (
          <Avatar className="ml-auto h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0">
            <AvatarImage src={card.assignee.avatar || undefined} />
            <AvatarFallback className="text-[8px] sm:text-xs">
              {card.assignee.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}
