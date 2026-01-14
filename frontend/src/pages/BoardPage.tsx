import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ArrowLeft, Plus, Users } from 'lucide-react';
import type { List, Card } from '@/types';
import { boardApi, listApi, cardApi } from '@/lib/api';
import { useBoardStore } from '@/stores/board.store';
import { useLanguageStore } from '@/stores/language.store';
import {
  joinBoard,
  leaveBoard,
  onSocketEvent,
  offSocketEvent,
  emitCardCreate,
  emitCardMove,
  emitCardDelete,
  emitListCreate,
  emitListDelete,
} from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BoardList } from '@/components/board/BoardList';
import { BoardCard } from '@/components/board/BoardCard';
import { CardModal } from '@/components/card/CardModal';

export function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const { board, lists, setBoard, setLists, addList, updateList, removeList, addCard, updateCard, removeCard, moveCard, onlineUsers, setOnlineUsers } = useBoardStore();
  const { t } = useLanguageStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'card' | 'list' | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(media.matches);
    update();
    // Safari fallback for older APIs
    if (media.addEventListener) media.addEventListener('change', update);
    else media.addListener(update);
    return () => {
      if (media.removeEventListener) media.removeEventListener('change', update);
      else media.removeListener(update);
    };
  }, []);

  const sensors = useSensors(
    // На мобильных используем TouchSensor, на десктопе — PointerSensor
    isMobile
      ? useSensor(TouchSensor, {
        activationConstraint: {
          delay: 150,
          tolerance: 5,
        },
      })
      : useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    if (id) {
      loadBoard();
      joinBoard(id);

      onSocketEvent('card:created', handleRemoteCardCreate);
      onSocketEvent('card:updated', handleRemoteCardUpdate);
      onSocketEvent('card:moved', handleRemoteCardMove);
      onSocketEvent('card:deleted', handleRemoteCardDelete);
      onSocketEvent('list:created', handleRemoteListCreate);
      onSocketEvent('list:updated', handleRemoteListUpdate);
      onSocketEvent('list:deleted', handleRemoteListDelete);
      onSocketEvent('users:online', setOnlineUsers);

      return () => {
        leaveBoard(id);
        offSocketEvent('card:created');
        offSocketEvent('card:updated');
        offSocketEvent('card:moved');
        offSocketEvent('card:deleted');
        offSocketEvent('list:created');
        offSocketEvent('list:updated');
        offSocketEvent('list:deleted');
        offSocketEvent('users:online');
      };
    }
  }, [id]);

  const loadBoard = async () => {
    try {
      const { data } = await boardApi.getById(id!);
      setBoard(data.data);
      setLists(data.data.lists || []);
    } catch (error) {
      console.error('Failed to load board:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoteCardCreate = useCallback((card: Card) => {
    addCard(card.listId, card);
  }, [addCard]);

  const handleRemoteCardUpdate = useCallback((card: Card) => {
    updateCard(card.listId, card.id, card);
  }, [updateCard]);

  const handleRemoteCardMove = useCallback((data: { card: Card; fromListId: string; toListId: string }) => {
    moveCard(data.fromListId, data.toListId, data.card.id, data.card.position);
  }, [moveCard]);

  const handleRemoteCardDelete = useCallback((data: { cardId: string; listId: string }) => {
    removeCard(data.listId, data.cardId);
  }, [removeCard]);

  const handleRemoteListCreate = useCallback((list: List) => {
    addList(list);
  }, [addList]);

  const handleRemoteListUpdate = useCallback((list: List) => {
    updateList(list.id, list);
  }, [updateList]);

  const handleRemoteListDelete = useCallback((data: { listId: string }) => {
    removeList(data.listId);
  }, [removeList]);

  const handleAddList = async () => {
    if (!newListName.trim() || !id) return;

    try {
      const { data } = await listApi.create({ name: newListName.trim(), boardId: id });
      addList({ ...data.data, cards: [] });
      emitListCreate(id, { ...data.data, cards: [] });
      setNewListName('');
      setIsAddingList(false);
    } catch (error) {
      console.error('Failed to create list:', error);
    }
  };

  const handleUpdateList = async (listId: string, name: string) => {
    try {
      await listApi.update(listId, { name });
      updateList(listId, { name });
    } catch (error) {
      console.error('Failed to update list:', error);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!id) return;
    try {
      await listApi.delete(listId);
      removeList(listId);
      emitListDelete(id, listId);
    } catch (error) {
      console.error('Failed to delete list:', error);
    }
  };

  const handleAddCard = async (listId: string, title: string) => {
    if (!id) return;
    try {
      const { data } = await cardApi.create({ title, listId });
      addCard(listId, data.data);
      emitCardCreate(id, data.data);
    } catch (error) {
      console.error('Failed to create card:', error);
    }
  };

  const handleDeleteCard = async (listId: string, cardId: string) => {
    if (!id) return;
    try {
      await cardApi.delete(cardId);
      removeCard(listId, cardId);
      emitCardDelete(id, cardId, listId);
    } catch (error) {
      console.error('Failed to delete card:', error);
    }
  };

  const handleUpdateCard = (cardId: string, data: Partial<Card>) => {
    const list = lists.find((l) => l.cards.some((c) => c.id === cardId));
    if (list) {
      updateCard(list.id, cardId, data);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveType(active.data.current?.type || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type !== 'card') return;

    const activeCard = activeData.card as Card;
    const activeListId = activeCard.listId;

    let overListId: string;
    if (overData?.type === 'card') {
      overListId = (overData.card as Card).listId;
    } else if (overData?.type === 'list') {
      overListId = (overData.list as List).id;
    } else {
      return;
    }

    if (activeListId !== overListId) {
      const overList = lists.find((l) => l.id === overListId);
      const newPosition = overData?.type === 'card'
        ? overList?.cards.findIndex((c) => c.id === over.id) ?? 0
        : overList?.cards.length ?? 0;

      moveCard(activeListId, overListId, activeCard.id, newPosition);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);

    if (!over || !id) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === 'list' && overData?.type === 'list') {
      const oldIndex = lists.findIndex((l) => l.id === active.id);
      const newIndex = lists.findIndex((l) => l.id === over.id);

      if (oldIndex !== newIndex) {
        const newLists = arrayMove(lists, oldIndex, newIndex);
        setLists(newLists);
        await listApi.updatePosition(active.id as string, newIndex);
      }
    }

    if (activeData?.type === 'card') {
      const card = activeData.card as Card;
      const targetList = lists.find((l) => l.cards.some((c) => c.id === card.id));

      if (targetList) {
        const newPosition = targetList.cards.findIndex((c) => c.id === card.id);
        await cardApi.move(card.id, { listId: targetList.id, position: newPosition });
        emitCardMove(id, { ...card, listId: targetList.id, position: newPosition }, card.listId, targetList.id);
      }
    }
  };

  const activeCard = activeType === 'card' ? lists.flatMap((l) => l.cards).find((c) => c.id === activeId) : null;
  const activeList = activeType === 'list' ? lists.find((l) => l.id === activeId) : null;

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="container py-8">
        <p>Board not found</p>
        <Link to="/dashboard">
          <Button variant="link">{t.workspace.backToDashboard}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen flex-col"
      style={{ backgroundColor: board.background || '#0079bf' }}
    >
      <div className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3 bg-black/20">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <Link to={`/workspace/${board.workspaceId}`}>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 px-2 md:px-3">
              <ArrowLeft className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">{t.common.back}</span>
            </Button>
          </Link>
          <h1 className="text-base md:text-xl font-bold text-white truncate">{board.name}</h1>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onlineUsers.length > 0 && (
            <div className="flex items-center gap-1 md:gap-2">
              <Users className="h-4 w-4 text-white/70 hidden sm:block" />
              <div className="flex -space-x-2">
                {onlineUsers.slice(0, 3).map((user) => (
                  <Avatar key={user.id} className="h-6 w-6 md:h-8 md:w-8 border-2 border-white">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}
                {onlineUsers.length > 3 && (
                  <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-slate-600 text-xs text-white border-2 border-white">
                    +{onlineUsers.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-hidden md:overflow-x-auto p-2 md:p-4">
          <div className="flex h-full flex-col md:flex-row gap-2 md:gap-4 min-w-0">
            <SortableContext
              items={lists.map((l) => l.id)}
              strategy={isMobile ? verticalListSortingStrategy : horizontalListSortingStrategy}
            >
              {lists.map((list) => (
                <BoardList
                  key={list.id}
                  list={list}
                  onAddCard={handleAddCard}
                  onUpdateList={handleUpdateList}
                  onDeleteList={handleDeleteList}
                  onCardClick={setSelectedCard}
                  onDeleteCard={handleDeleteCard}
                />
              ))}
            </SortableContext>

            <div className="w-full md:w-72 flex-shrink-0">
              {isAddingList ? (
                <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2 md:p-3 space-y-2">
                  <Input
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder={t.board.enterListTitle}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddList();
                      if (e.key === 'Escape') setIsAddingList(false);
                    }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddList}>
                      {t.common.add}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsAddingList(false)}>
                      {t.common.cancel}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full justify-start bg-white/20 text-white hover:bg-white/30"
                  onClick={() => setIsAddingList(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t.board.addList}
                </Button>
              )}
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeCard && (
            <BoardCard card={activeCard} onClick={() => { }} onDelete={() => { }} />
          )}
          {activeList && (
            <div className="w-72 rounded-lg bg-slate-100 dark:bg-slate-800 p-3 opacity-80">
              <h3 className="font-semibold">{activeList.name}</h3>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <CardModal
        card={selectedCard}
        open={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        onUpdate={handleUpdateCard}
        members={board.members || []}
      />
    </div>
  );
}
