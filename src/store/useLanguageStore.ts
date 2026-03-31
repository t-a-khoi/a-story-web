import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language, getTranslation } from '@/lib/i18n';

interface LanguageState {
    language: Language;
    setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            language: 'vi',
            setLanguage: (lang) => set({ language: lang }),
        }),
        {
            name: 'a-story-language-storage',
        }
    )
);

export const useTranslation = () => {
    const language = useLanguageStore((state) => state.language);

    const t = (key: string) => {
        return getTranslation(language, key);
    };

    return { t, language };
};
