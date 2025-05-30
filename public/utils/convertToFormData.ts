export default function convertToFormData(obj: object, fd: FormData = new FormData(), prevKey: string | null = null) {
    if (!obj || typeof obj !== 'object') return fd;

    Object.entries(obj).forEach(([key, value]) => {
        const fieldName = prevKey ? `${prevKey}[${key}]` : key;
        if (value && typeof value === 'object' && !(value instanceof File || value instanceof FileList || value instanceof Date)) {
            convertToFormData(value, fd, fieldName);
        } else if (value instanceof FileList) {
            for (const file of value) {
                fd.append(fieldName, file);
            }
        } else {
            fd.append(fieldName, value ?? '');
        }
    });

    return fd;
}