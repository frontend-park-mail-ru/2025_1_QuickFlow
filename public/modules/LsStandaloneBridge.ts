const keysToSync = [
    'username'
];

function isStandaloneMode(): boolean {
    const isDisplayModeStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isNavigatorStandalone = (window.navigator as any).standalone === true;
    return isDisplayModeStandalone || isNavigatorStandalone;
}

function writeLocalStorageToCookies(): void {
    keysToSync.forEach((key) => {
        const value = localStorage.getItem(key);
        if (value !== null) {
            document.cookie = `${key}=${encodeURIComponent(value)}; path=/`;
        }
    });
}

function readCookiesToLocalStorage(): void {
    const cookies = document.cookie.split('; ').reduce<Record<string, string>>((acc, cookieStr) => {
        const [name, value] = cookieStr.split('=');
        acc[name] = decodeURIComponent(value);
        return acc;
    }, {});

    keysToSync.forEach((key) => {
        if (cookies[key]) {
            localStorage.setItem(key, cookies[key]);
            // очищаем cookie после использования
            document.cookie = `${key}=; Max-Age=0; path=/`;
        }
    });
}

function init(): void {
    if (isStandaloneMode()) {
        readCookiesToLocalStorage();
    } else {
        writeLocalStorageToCookies();
    }
}

export default { init };
