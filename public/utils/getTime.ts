export default function getTime(ts: string | number | Date): string {
    const date = new Date(ts);
    const h = date.getHours();
    const m = date.getMinutes();
    return `${pad(h)}:${pad(m)}`;
}

function pad(value: number): string {
    return value < 10 ? '0' + value : value.toString();
}
