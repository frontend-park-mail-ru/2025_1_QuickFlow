export default function getTimediff(ts: string, config: Record<string, any> = {}) {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const diff = Number(new Date()) - Number(new Date(ts));

    let value: number;
    let unit: string;

    if (diff < msPerMinute) {
        value = Math.round(diff / 1000);
        unit = config.mode === 'short' ? 'с' : pluralize(value, ['секунда', 'секунды', 'секунд']);
    } else if (diff < msPerHour) {
        value = Math.round(diff / msPerMinute);
        unit = config.mode === 'short' ? 'мин' : pluralize(value, ['минута', 'минуты', 'минут']);
    } else if (diff < msPerDay) {
        value = Math.round(diff / msPerHour);
        unit = config.mode === 'short' ? 'ч' : pluralize(value, ['час', 'часа', 'часов']);
    } else if (diff < msPerMonth) {
        value = Math.round(diff / msPerDay);
        unit = config.mode === 'short' ? 'д' : pluralize(value, ['день', 'дня', 'дней']);
    } else if (diff < msPerYear) {
        value = Math.round(diff / msPerMonth);
        unit = config.mode === 'short' ? 'мес' : pluralize(value, ['месяц', 'месяца', 'месяцев']);
    } else {
        value = Math.round(diff / msPerYear);
        unit = config.mode === 'short' ? pluralize(value, ['г', 'г', 'лет']) : pluralize(value, ['год', 'года', 'лет']);
    }

    return config.mode === 'short' ? `${value}${unit}` : `${value} ${unit} назад`;
}

function pluralize(count: number, forms: [string, string, string]) {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) {
        return forms[0]; // одна секунда
    } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
        return forms[1]; // две секунды
    } else {
        return forms[2]; // пять секунд
    }
}
