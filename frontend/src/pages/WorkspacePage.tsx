import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, ArrowLeft, Trash2 } from 'lucide-react';
import type { Workspace, Board } from '@/types';
import { workspaceApi, boardApi } from '@/lib/api';
import { useLanguageStore } from '@/stores/language.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const BOARD_COLORS = [
  '#0079bf',
  '#d29034',
  '#519839',
  '#b04632',
  '#89609e',
  '#cd5a91',
  '#4bbf6b',
  '#00aecc',
];

export function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [selectedColor, setSelectedColor] = useState(BOARD_COLORS[0]);
  const { t } = useLanguageStore();

  useEffect(() => {
    if (id) {
      loadWorkspace();
    }
  }, [id]);

  const loadWorkspace = async () => {
    try {
      const { data } = await workspaceApi.getById(id!);
      setWorkspace(data.data);
      setBoards(data.data.boards || []);
    } catch (error) {
      console.error('Failed to load workspace:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBoard = async () => {
    if (!newBoardName.trim() || !id) return;

    try {
      const { data } = await boardApi.create({
        name: newBoardName.trim(),
        workspaceId: id,
        background: selectedColor,
      });
      setBoards([...boards, data.data]);
      setIsCreateOpen(false);
      setNewBoardName('');
      setSelectedColor(BOARD_COLORS[0]);
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  const handleDeleteBoard = async (boardId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(t.workspace.deleteBoard)) return;

    try {
      await boardApi.delete(boardId);
      setBoards(boards.filter((b) => b.id !== boardId));
    } catch (error) {
      console.error('Failed to delete board:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="container py-8">
        <p>Workspace not found</p>
        <Link to="/dashboard">
          <Button variant="link">{t.workspace.backToDashboard}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-6 md:py-8 px-4">
      <div className="mb-6 md:mb-8">
        <Link to="/dashboard" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.workspace.backToDashboard}
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{workspace.name}</h1>
            <p className="text-sm md:text-base text-muted-foreground">{workspace.description || t.dashboard.noDescription}</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            {t.workspace.newBoard}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
        {boards.map((board) => (
          <Link key={board.id} to={`/board/${board.id}`}>
            <Card
              className="group h-32 transition-shadow hover:shadow-md relative overflow-hidden"
              style={{ backgroundColor: board.background || '#0079bf' }}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-white text-lg">{board.name}</CardTitle>
              </CardHeader>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-white/20"
                onClick={(e) => handleDeleteBoard(board.id, e)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          </Link>
        ))}

        <Card
          className="flex h-32 cursor-pointer items-center justify-center border-2 border-dashed transition-colors hover:border-primary hover:bg-accent"
          onClick={() => setIsCreateOpen(true)}
        >
          <div className="text-center">
            <Plus className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t.workspace.createNewBoard}</p>
          </div>
        </Card>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.workspace.createBoard}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="boardName">{t.workspace.boardName}</Label>
              <Input
                id="boardName"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="My Board"
              />
            </div>
            <div className="space-y-2">
              <Label>{t.workspace.backgroundColor}</Label>
              <div className="flex flex-wrap gap-2">
                {BOARD_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`h-10 w-10 rounded-md transition-transform ${
                      selectedColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleCreateBoard} disabled={!newBoardName.trim()}>
              {t.common.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
