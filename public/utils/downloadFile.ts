export default async function downloadFile(url: string, filename?: string) {
    try {
        const response = await fetch(url, { mode: 'cors' });

        if (!response.ok) {
            throw new Error(`Ошибка загрузки файла: ${response.status}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;

        link.download = filename || url.split('/').pop() || 'download';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(blobUrl); // Освободить память
    } catch (err) {
        console.error('Не удалось скачать файл:', err);
    }
}
