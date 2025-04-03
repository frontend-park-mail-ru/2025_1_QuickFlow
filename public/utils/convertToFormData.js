export default function convertToFormData(obj, fd = new FormData(), prevKey = null) {
    if (!obj || typeof obj !== 'object') return fd;

    Object.entries(obj).forEach(([key, value]) => {
        const fieldName = prevKey ? `${prevKey}[${key}]` : key;
        if (value && typeof value === 'object' && !(value instanceof File || value instanceof Date)) {
            this.convertToFormData(value, fd, fieldName);
        } else {
            fd.append(fieldName, value ?? '');
        }
    });

    return fd;
}