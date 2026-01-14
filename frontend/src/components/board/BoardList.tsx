import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Plus, Trash2, GripVertical } from 'lucide-react';
import type { List, Card as CardType } from '@/types';
import { useLanguageStore } from '@/stores/language.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BoardCard } from './BoardCard';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface BoardListProps {
  list: List;
  onAddCard: (listId: string, title: string) => void;
  onUpdateList: (listId: string, name: string) => void;
  onDeleteList: (listId: string) => void;
  onCardClick: (card: CardType) => void;
  onDeleteCard: (listId: string, cardId: string) => void;
}

export function BoardList({
  list,
  onAddCard,
  onUpdateList,
  onDeleteList,
  onCardClick,
  onDeleteCard,
}: BoardListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(list.name);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const { t } = useLanguageStore();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: list.id,
    data: { type: 'list', list },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 220ms cubic-bezier(0.2, 0, 0, 1)',
    willChange: 'transform',
  };

  const handleNameSubmit = () => {
    if (name.trim() && name !== list.name) {
      onUpdateList(list.id, name.trim());
    } else {
      setName(list.name);
    }
    setIsEditing(false);
  };

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onAddCard(list.id, newCardTitle.trim());
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex h-fit max-h-[calc(100vh-7rem)] sm:max-h-[calc(100vh-8rem)] w-full md:w-[260px] lg:w-72 md:flex-shrink-0 flex-col rounded-lg bg-slate-100 dark:bg-slate-800 ${isDragging ? 'opacity-50' : ''
        }`}
    >
      <div className="flex items-center justify-between p-2 sm:p-3 pb-0">
        <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded flex-shrink-0"
          >
            <GripVertical className="h-4 w-4 text-slate-500" />
          </button>
          {isEditing ? (
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
              className="h-7 text-sm bg-white dark:bg-slate-900"
              autoFocus
            />
          ) : (
            <h3
              className="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-1 rounded flex-1 truncate"
              onClick={() => setIsEditing(true)}
            >
              {list.name}
              <span className="ml-2 text-xs text-slate-500">({list.cards.length})</span>
            </h3>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onDeleteList(list.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t.board.deleteList}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2">
        <SortableContext items={list.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <BoardCard
              key={card.id}
              card={card}
              onClick={() => onCardClick(card)}
              onDelete={() => onDeleteCard(list.id, card.id)}
            />
          ))}
        </SortableContext>

        {isAddingCard ? (
          <div className="space-y-2">
            <Input
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder={t.board.enterCardTitle}
              className="text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCard();
                if (e.key === 'Escape') setIsAddingCard(false);
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddCard} className="text-xs h-7">
                {t.common.add}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsAddingCard(false)} className="text-xs h-7">
                {t.common.cancel}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs h-8"
            onClick={() => setIsAddingCard(true)}
          >
            <Plus className="mr-1 h-3 w-3" />
            {t.board.addCard}
          </Button>
        )}
      </div>
    </div>
  );
}
