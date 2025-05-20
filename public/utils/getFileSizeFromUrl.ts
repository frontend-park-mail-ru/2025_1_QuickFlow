export default async function getFileSizeFromUrl(url: string): Promise<number | null> {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentLength = response.headers.get('Content-Length');
        return contentLength ? parseInt(contentLength, 10) : null;
    } catch (error) {
        console.error('Ошибка при получении размера файла:', error);
        return null;
    }
}
