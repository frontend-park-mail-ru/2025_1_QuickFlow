import createElement from "@utils/createElement";


export default async function insertIcon(parent: HTMLElement, config: Record<string, any>) {
    if (!config.name) return;

    const icon = createElement({
        parent,
        classes: config.classes,
    });

    const res = await fetch(`/static/img/${config.name}.svg`);
    const svgHTML = await res.text();

    icon.innerHTML = svgHTML;

    const svg = icon.querySelector('svg');
    if (svg) {
        svg.setAttribute('fill', 'currentColor');
        svg.removeAttribute('height');
        svg.removeAttribute('width');
        svg.querySelectorAll('[fill]').forEach(element => {
            element.removeAttribute('fill');
        });
    }

    return icon;
}