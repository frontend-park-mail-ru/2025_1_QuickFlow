interface InsertSymConfig {
    maxLength: number;
}


export default function insertSym(textarea: HTMLTextAreaElement, emoji: string, config: InsertSymConfig) {
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const value = textarea.value;

    // Проверка на максимальную длину с учётом вставки
    if (value.length - (end - start) + emoji.length > config.maxLength) {
        return;
    }

    // Вставляем эмоджи на место выделения или курсора
    const newValue = value.slice(0, start) + emoji + value.slice(end);

    textarea.value = newValue;

    // Перемещаем курсор сразу после вставленного эмоджи
    const cursorPos = start + emoji.length;
    textarea.selectionStart = textarea.selectionEnd = cursorPos;

    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.focus();
}