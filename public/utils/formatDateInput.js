export default function formatDateInput(input) {
    let value = input.value.replace(/\D/g, '');

    if (value.length > 8) {
        value = value.slice(0, 8);
    }

    if (value.length > 2 && value[2] !== '.') {
        value = value.slice(0, 2) + '.' + value.slice(2);
    }
    if (value.length > 5 && value[5] !== '.') {
        value = value.slice(0, 5) + '.' + value.slice(5);
    }

    input.value = value;
}