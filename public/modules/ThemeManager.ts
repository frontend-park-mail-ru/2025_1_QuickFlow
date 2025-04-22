export default class ThemeManager {
    private static THEME_KEY = 'theme';

    static setTheme(theme: 'light' | 'dark' | 'auto', save: boolean = true) {
        document.documentElement.classList.remove('theme_light', 'theme_dark');
        document.documentElement.classList.add(`theme_${theme}`);

        if (save) {
            localStorage.setItem(ThemeManager.THEME_KEY, theme);
        }
    }

    static get theme(): string {
        const stored = localStorage.getItem(ThemeManager.THEME_KEY) as 'light' | 'dark' | null;
        switch (stored) {
            case 'light':
                return 'светлая';
            case 'dark':
                return 'тёмная';
            default:
                return 'системная';
        }
    }

    static toggleTheme() {
        const current = ThemeManager.getTheme();
        const next = current === 'light' ? 'dark' : 'light';
        ThemeManager.setTheme(next);
    }

    static getTheme(): 'light' | 'dark' | 'auto' {
        const stored = localStorage.getItem(ThemeManager.THEME_KEY) as 'light' | 'dark' | null;
        if (stored) return stored;

        // если нет сохранённой темы, смотрим системную
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
    }

    static applyStoredTheme() {
        const stored = localStorage.getItem(ThemeManager.THEME_KEY);
        if (!stored) {
            ThemeManager.listenToSystemChanges(); // следим за системой, если пользователь не задавал вручную
        }

        ThemeManager.setTheme(ThemeManager.getTheme(), false);
    }

    static listenToSystemChanges() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            const savedTheme = localStorage.getItem(ThemeManager.THEME_KEY);
            if (!savedTheme) {
                const newTheme = e.matches ? 'dark' : 'light';
                ThemeManager.setTheme(newTheme, false);
            }
        });
    }

    static resetToAuto() {
        localStorage.removeItem(ThemeManager.THEME_KEY);
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        ThemeManager.setTheme(systemTheme, false);
        ThemeManager.listenToSystemChanges();
    }    
}
