import { Globe } from 'lucide-react';
import { useLanguageStore } from '@/stores/language.store';
import { Language } from '@/lib/i18n/translations';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languageLabels: Record<Language, string> = {
  en: 'EN',
  uk: 'UA',
  ru: 'RU',
};

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguageStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 px-2">
          <Globe className="h-4 w-4" />
          <span className="text-xs font-medium">{languageLabels[language]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage('en')} className={language === 'en' ? 'bg-accent' : ''}>
          {t.language.english}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('uk')} className={language === 'uk' ? 'bg-accent' : ''}>
          {t.language.ukrainian}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('ru')} className={language === 'ru' ? 'bg-accent' : ''}>
          {t.language.russian}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
