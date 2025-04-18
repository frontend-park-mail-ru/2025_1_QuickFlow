export default function createElement({
    parent = null,
    attrs = {},
    tag = attrs.src ? 'img' : 'div',
    classes = [],
    text = '',
}: Record<string, any> = {}): HTMLElement {
    const element = document.createElement(tag);

    for (const attr in attrs) {
        element.setAttribute(attr, attrs[attr]);
    }

    const _classes =  Array.from(classes);
    if (_classes.length) element.classList.add(..._classes);

    if (text) {
        element.textContent = decodeHTMLEntities(text);
    }

    if (parent) {
        parent.appendChild(element);
    }

    return element;
}

function decodeHTMLEntities(str: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
}
