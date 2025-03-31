export function setLsItem(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch {
        console.log('setLsItem exception');
    }
}

export function getLsItem(key, defaultValue) {
    let value = defaultValue;

    try {
        value = localStorage.getItem(key) || defaultValue;
    } catch {
        value = defaultValue;
    }

    return value;
}

export function removeLsItem(key) {
    try {
        localStorage.removeItem(key);
    } catch {
        console.log('removeLsItem exception');
    }
}