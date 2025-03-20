export default function createElement({
    parent = null,
    attrs = {},
    tag = attrs.src ? 'img' : 'div',
    classes = [],
    text = '',
} = {}) {
    console.log(tag, attrs, classes);
    const element = document.createElement(tag);

    Object.keys(attrs).forEach(
        key => element.setAttribute(key, attrs[key])
    );

    classes.forEach(
        className => element.classList.add(className)
    );

    element.textContent = text;

    if (parent) {
        parent.appendChild(element);
    }

    return element;
}
