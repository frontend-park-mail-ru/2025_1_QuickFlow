export default function copyToClipboard(
    text: string,
    okCallback?: () => void,
    errorCallback?: () => void
): boolean {
    navigator.clipboard.writeText(text)
    .then(() => {
        if (okCallback) {
            okCallback();
        }
        return true;
    })
    .catch((error) => {
        console.error('CopyToClipboard Error:', error);
        if (errorCallback) {
            errorCallback();
        }
        return false;
    });
    
    return true;
}
