import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LayoutGrid, Users } from 'lucide-react';
import type { Workspace } from '@/types';
import { workspaceApi } from '@/lib/api';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export function DashboardPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');
  const { t } = useLanguageStore();

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const { data } = await workspaceApi.getAll();
      setWorkspaces(data.data);
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;

    try {
      const { data } = await workspaceApi.create({
        name: newWorkspaceName.trim(),
        description: newWorkspaceDesc.trim() || undefined,
      });
      setWorkspaces([data.data, ...workspaces]);
      setIsCreateOpen(false);
      setNewWorkspaceName('');
      setNewWorkspaceDesc('');
    } catch (error) {
      console.error('Failed to create workspace:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container py-6 md:py-8 px-4">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t.dashboard.title}</h1>
          <p className="text-sm md:text-base text-muted-foreground">{t.dashboard.subtitle}</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t.dashboard.newWorkspace}
        </Button>
      </div>

      {workspaces.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12">
          <LayoutGrid className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">{t.dashboard.noWorkspaces}</h3>
          <p className="mb-4 text-muted-foreground">{t.dashboard.createFirst}</p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t.dashboard.createWorkspace}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <Link key={workspace.id} to={`/workspace/${workspace.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle>{workspace.name}</CardTitle>
                  <CardDescription>{workspace.description || t.dashboard.noDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <LayoutGrid className="h-4 w-4" />
                      {workspace._count?.boards || 0} {t.dashboard.boards}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {workspace.members.length} {t.dashboard.members}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.dashboard.createWorkspace}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.dashboard.workspaceName}</Label>
              <Input
                id="name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="My Workspace"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t.dashboard.workspaceDesc}</Label>
              <Input
                id="description"
                value={newWorkspaceDesc}
                onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                placeholder={t.dashboard.workspaceDescPlaceholder}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleCreateWorkspace} disabled={!newWorkspaceName.trim()}>
              {t.common.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
