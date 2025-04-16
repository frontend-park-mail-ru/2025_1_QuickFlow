export default function getTimediff(ts: string, config: Record<string, any> = {}) {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const diff = Number(new Date()) - Number(new Date(ts));

    if (diff < msPerMinute) {
        return `${Math.round(diff / 1000)}${config.mode === 'short' ? 'с' : ' секунд назад'}`;
    } else if (diff < msPerHour) {
        return `${Math.round(diff / msPerMinute)}${config.mode === 'short' ? 'мин' : ' минут назад'}`;
    } else if (diff < msPerDay) {
        return `${Math.round(diff / msPerHour)}${config.mode === 'short' ? 'ч' : ' часов назад'}`;
    } else if (diff < msPerMonth) {
        return `${Math.round(diff / msPerDay)}${config.mode === 'short' ? 'д' : ' дней назад'}`;
    } else if (diff < msPerYear) {
        return `${Math.round(diff / msPerMonth)}${config.mode === 'short' ? 'мес' : ' месяцев назад'}`;
    }
    return `${Math.round(diff / msPerYear)}${config.mode === 'short' ? 'лет' : ' лет назад'}`; 
}
