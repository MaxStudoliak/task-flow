import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, LogOut, User, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useLanguageStore } from '@/stores/language.store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { getInitials } from '@/lib/utils';

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { t } = useLanguageStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">TaskFlow</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="ml-auto hidden md:flex items-center space-x-2">
          <ThemeToggle />
          <LanguageToggle />

          {isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost">{t.dashboard.title}</Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
                      <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      {t.common.profile}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t.common.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">{t.auth.login}</Button>
              </Link>
              <Link to="/register">
                <Button>{t.auth.getStarted}</Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="ml-auto flex md:hidden items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container flex flex-col py-4 px-4 space-y-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 border-b pb-4 mb-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar || undefined} />
                    <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Link to="/dashboard" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {t.dashboard.title}
                  </Button>
                </Link>
                <Link to="/profile" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    {t.common.profile}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600"
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t.common.logout}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full">{t.auth.login}</Button>
                </Link>
                <Link to="/register" onClick={closeMobileMenu}>
                  <Button className="w-full">{t.auth.getStarted}</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
