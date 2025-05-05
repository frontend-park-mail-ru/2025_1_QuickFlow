export default function convertDate(date: string, mode = 'tu') {
    const parts = date.split(
        mode === 'ts' ? '.' : '-',
    );
    if (mode === 'ts') {
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        return `${year}-${month}-${day}`;
    }
    const day = parts[2];
    const month = parts[1];
    const year = parts[0];
    return `${day}.${month}.${year}`;
}