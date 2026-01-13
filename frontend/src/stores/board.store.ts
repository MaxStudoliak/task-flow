import { create } from 'zustand';
import type { Board, List, Card, SocketUser } from '@/types';

interface BoardState {
  board: Board | null;
  lists: List[];
  onlineUsers: SocketUser[];
  setBoard: (board: Board | null) => void;
  setLists: (lists: List[]) => void;
  addList: (list: List) => void;
  updateList: (listId: string, data: Partial<List>) => void;
  removeList: (listId: string) => void;
  reorderLists: (lists: List[]) => void;
  addCard: (listId: string, card: Card) => void;
  updateCard: (listId: string, cardId: string, data: Partial<Card>) => void;
  removeCard: (listId: string, cardId: string) => void;
  moveCard: (
    fromListId: string,
    toListId: string,
    cardId: string,
    newPosition: number
  ) => void;
  setOnlineUsers: (users: SocketUser[]) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  board: null,
  lists: [],
  onlineUsers: [],

  setBoard: (board) => set({ board }),

  setLists: (lists) => set({ lists }),

  addList: (list) =>
    set((state) => ({
      lists: [...state.lists, list],
    })),

  updateList: (listId, data) =>
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === listId ? { ...list, ...data } : list
      ),
    })),

  removeList: (listId) =>
    set((state) => ({
      lists: state.lists.filter((list) => list.id !== listId),
    })),

  reorderLists: (lists) => set({ lists }),

  addCard: (listId, card) =>
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === listId ? { ...list, cards: [...list.cards, card] } : list
      ),
    })),

  updateCard: (listId, cardId, data) =>
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              cards: list.cards.map((card) =>
                card.id === cardId ? { ...card, ...data } : card
              ),
            }
          : list
      ),
    })),

  removeCard: (listId, cardId) =>
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === listId
          ? { ...list, cards: list.cards.filter((card) => card.id !== cardId) }
          : list
      ),
    })),

  moveCard: (fromListId, toListId, cardId, newPosition) =>
    set((state) => {
      const lists = [...state.lists];
      const fromList = lists.find((l) => l.id === fromListId);
      const toList = lists.find((l) => l.id === toListId);

      if (!fromList || !toList) return state;

      const cardIndex = fromList.cards.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return state;

      const [card] = fromList.cards.splice(cardIndex, 1);
      card.listId = toListId;
      toList.cards.splice(newPosition, 0, card);

      fromList.cards.forEach((c, i) => (c.position = i));
      toList.cards.forEach((c, i) => (c.position = i));

      return { lists };
    }),

  setOnlineUsers: (users) => set({ onlineUsers: users }),
}));
