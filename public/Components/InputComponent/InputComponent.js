function createInput(type, placeholder, name) {
    const input = document.createElement('input');
    input.type = type;
    input.name = name;
    input.placeholder = placeholder;

    return input;
}

export default createInput;
