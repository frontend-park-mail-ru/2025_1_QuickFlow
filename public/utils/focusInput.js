export default function focusInput(input, focusTimer = null) {    
    clearFocusTimer(focusTimer);
    
    focusTimer = setTimeout(() => input.focus(), 0);
    input.setSelectionRange(input.value.length, input.value.length);
}

function clearFocusTimer(focusTimer) {
    if (!focusTimer) return;
    
    clearTimeout(focusTimer);
    focusTimer = null;
}