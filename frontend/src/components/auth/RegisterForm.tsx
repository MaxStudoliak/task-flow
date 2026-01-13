import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { useLanguageStore } from '@/stores/language.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register, isLoading } = useAuthStore();
  const { t } = useLanguageStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t.auth.passwordsNotMatch);
      return;
    }

    if (password.length < 6) {
      setError(t.auth.passwordTooShort);
      return;
    }

    try {
      await register(email, password, name);
      navigate('/dashboard');
    } catch {
      setError(t.auth.registrationFailed);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t.auth.createAccount}</CardTitle>
        <CardDescription>{t.auth.enterDetails}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">{t.auth.name}</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t.auth.confirmPassword}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t.auth.creatingAccount : t.auth.createAccount}
          </Button>
          <p className="text-sm text-muted-foreground">
            {t.auth.haveAccount}{' '}
            <Link to="/login" className="text-primary hover:underline">
              {t.auth.login}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
