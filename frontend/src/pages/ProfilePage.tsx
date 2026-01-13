import { useState } from 'react';
import { Mail, Calendar } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useLanguageStore } from '@/stores/language.store';
import { authApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { t } = useLanguageStore();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const { data } = await authApi.updateProfile({ name, avatar: avatar || undefined });
      setUser(data.data);
      setMessage({ type: 'success', text: t.profile.profileUpdated });
    } catch {
      setMessage({ type: 'error', text: t.profile.updateFailed });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container max-w-2xl py-6 px-4 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">{t.profile.title}</h1>
        <p className="text-muted-foreground text-sm md:text-base">{t.profile.subtitle}</p>
      </div>

      <div className="space-y-6">
        {/* User Info Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Avatar className="h-16 w-16 md:h-20 md:w-20">
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback className="text-xl md:text-2xl">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <CardTitle className="text-xl md:text-2xl">{user.name}</CardTitle>
                <CardDescription className="flex items-center justify-center sm:justify-start gap-1 mt-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{t.profile.memberSince}: {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">{t.profile.personalInfo}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {message && (
                <div
                  className={`rounded-md p-3 text-sm ${
                    message.type === 'success'
                      ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                      : 'bg-destructive/15 text-destructive'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">{t.auth.name}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t.auth.email}</Label>
                <Input id="email" value={user.email} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar">{t.profile.avatarUrl}</Label>
                <Input
                  id="avatar"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder={t.profile.avatarPlaceholder}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? t.profile.updating : t.profile.updateProfile}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
