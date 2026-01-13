import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { useLanguageStore } from '@/stores/language.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const { t } = useLanguageStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError(t.auth.invalidCredentials);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t.auth.welcomeBack}</CardTitle>
        <CardDescription>{t.auth.enterCredentials}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">{t.auth.email}</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t.auth.password}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t.auth.signingIn : t.auth.login}
          </Button>
          <p className="text-sm text-muted-foreground">
            {t.auth.noAccount}{' '}
            <Link to="/register" className="text-primary hover:underline">
              {t.auth.register}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
