export default function createElement({
    parent = null,
    attrs = {},
    tag = attrs.src ? 'img' : 'div',
    classes = [],
    text = '',
} = {}) {
    const element = document.createElement(tag);

    for (const attr in attrs) {
        element.setAttribute(attr, attrs[attr]);
    }

    const _classes =  Array.from(classes);
    if (_classes.length) element.classList.add(..._classes);

    element.textContent = text;

    if (parent) {
        parent.appendChild(element);
    }

    return element;
}
