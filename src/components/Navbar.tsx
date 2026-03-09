import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Globe, Menu, X, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const CatalanFlag = () => (
  <svg width="1.2em" height="0.85em" viewBox="0 0 20 14" className="inline-block rounded-[2px] align-middle">
    <rect width="20" height="14" fill="#FCDD09" />
    <rect y="1.56" width="20" height="1.56" fill="#DA121A" />
    <rect y="4.67" width="20" height="1.56" fill="#DA121A" />
    <rect y="7.78" width="20" height="1.56" fill="#DA121A" />
    <rect y="10.89" width="20" height="1.56" fill="#DA121A" />
  </svg>
);

const UI_LANGUAGES: { code: string; label: string; flag: string | null }[] = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ca', label: 'Català', flag: null },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

const Navbar = () => {
  const { user, userRole, isAdmin, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentLang = UI_LANGUAGES.find((l) => l.code === i18n.language) || UI_LANGUAGES[0];
  const initials = user?.email?.substring(0, 2).toUpperCase() || '?';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const dashboardLabel = userRole === 'tradesman' ? t('nav.myDashboard') : t('nav.myProfile');

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between gap-2 px-4 py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="font-display text-xl font-bold"><span className="text-primary">Confia</span><span className="text-secondary">Maresme</span></span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/" className="whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            {t('nav.directory')}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Globe className="h-4 w-4" />
                {currentLang.code === 'ca' ? <CatalanFlag /> : <span className="text-xs">{currentLang.flag}</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {UI_LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={i18n.language === lang.code ? 'bg-accent' : ''}
                >
                  <span className="mr-2">{lang.code === 'ca' ? <CatalanFlag /> : lang.flag}</span>
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 rounded-full px-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="truncate text-sm font-medium">{user.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{userRole || 'user'}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  {dashboardLabel}
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')} className="gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" /> Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  {t('nav.signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button size="sm">{t('nav.signIn')}</Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Globe className="h-4 w-4" />
                {currentLang.code === 'ca' ? <CatalanFlag /> : <span className="text-xs">{currentLang.flag}</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {UI_LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={i18n.language === lang.code ? 'bg-accent' : ''}
                >
                  <span className="mr-2">{lang.code === 'ca' ? <CatalanFlag /> : lang.flag}</span>
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-card px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium">{t('nav.directory')}</Link>
            {user ? (
              <>
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm text-muted-foreground">{user.email}</span>
                </div>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-sm font-medium">{dashboardLabel}</Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-1.5 text-sm font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" /> Admin Dashboard
                  </Link>
                )}
                <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="text-left text-sm font-medium text-destructive">{t('nav.signOut')}</button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-primary">{t('nav.signIn')}</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
