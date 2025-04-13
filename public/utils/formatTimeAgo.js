export default function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    // const now = new Date();

    const diffInSeconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    // const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return `${diffInSeconds} секунд${getEnding(diffInSeconds)} назад`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} минут${getEnding(diffInMinutes)} назад`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return diffInHours === 1 ? '1 час назад' : `${diffInHours} часов назад`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
        return 'Вчера';
    }
    if (diffInDays < 7) {
        return `${diffInDays} дней назад`;
    }

    const options = { day: 'numeric', month: 'long' };
    return date.toLocaleDateString('ru-RU', options);
}

function getEnding(number) {
    const lastDigit = number % 10;
    const lastTwoDigits = number % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return '';
    }

    if (lastDigit === 1) {
        return 'у';
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'ы';
    }

    return '';
}