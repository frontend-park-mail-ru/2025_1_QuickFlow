export function setLsItem(key: string, value: string) {
    try {
        localStorage.setItem(key, value);
    } catch {
        console.error('setLsItem exception');
    }
}

export function getLsItem(key: string, defaultValue: any) {
    let value = defaultValue;

    try {
        value = localStorage.getItem(key) || defaultValue;
    } catch {
        value = defaultValue;
    }

    return value;
}

export function removeLsItem(key: string) {
    try {
        localStorage.removeItem(key);
    } catch {
        console.error('removeLsItem exception');
    }
}