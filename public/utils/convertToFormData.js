export default function convertToFormData(obj, fd = new FormData(), prevKey = '') {
    if (!obj || typeof obj !== 'object') return fd;

    Object.entries(obj).forEach(([key, value]) => {
        const fieldName = prevKey ? `${prevKey}.${key}` : key; // Используем точку вместо [ ]

        if (value instanceof File || value instanceof Date) {
            fd.append(fieldName, value);
        } else if (Array.isArray(value)) {
            // Корректная обработка массивов
            value.forEach((item, index) => {
                convertToFormData({ [index]: item }, fd, fieldName);
            });
        } else if (value && typeof value === 'object') {
            convertToFormData(value, fd, fieldName);
        } else {
            fd.append(fieldName, value ?? '');
        }
    });

    return fd;
}
