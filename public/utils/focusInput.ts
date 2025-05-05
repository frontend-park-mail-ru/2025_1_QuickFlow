export default function focusInput(input: HTMLInputElement | HTMLTextAreaElement, focusTimer: NodeJS.Timeout | null = null) {    
    clearFocusTimer(focusTimer);
    
    focusTimer = setTimeout(() => input.focus(), 0);
    input.setSelectionRange(input.value.length, input.value.length);
}

function clearFocusTimer(focusTimer: NodeJS.Timeout | null = null) {
    if (!focusTimer) return;
    
    clearTimeout(focusTimer);
    focusTimer = null;
}