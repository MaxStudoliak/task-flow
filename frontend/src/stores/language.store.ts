import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations, Language, TranslationKeys } from '@/lib/i18n/translations';

interface LanguageState {
  language: Language;
  t: TranslationKeys;
  setLanguage: (language: Language) => void;
}

const getBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en';

  const browserLang = navigator.language.split('-')[0];
  if (browserLang === 'uk') return 'uk';
  if (browserLang === 'ru') return 'ru';
  return 'en';
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: getBrowserLanguage(),
      t: translations[getBrowserLanguage()],
      setLanguage: (language) => {
        set({ language, t: translations[language] });
      },
    }),
    {
      name: 'language-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.t = translations[state.language];
        }
      },
    }
  )
);
