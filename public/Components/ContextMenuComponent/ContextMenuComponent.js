export default class ContextMenuComponent {
    constructor(container, config) {
        this.container = container;
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('context-menu');
        this.config = config;
        this.render();
    }

    render() {
        Object.entries(this.config.data).forEach(([, { href, text, icon, isCritical }],) => {
            const menuOption = document.createElement('div');
            menuOption.classList.add('menu-option');
            menuOption.dataset.href = href;
            this.wrapper.appendChild(menuOption);
            
            const iconElement = document.createElement('img');
            iconElement.src = `/static/img/${icon}.svg`;
            iconElement.classList.add('context-menu-icon');
            menuOption.appendChild(iconElement);

            const textElement = document.createElement('div');
            textElement.textContent = text;
            textElement.classList.add('context-menu-text');
            if (isCritical) {
                textElement.classList.add('critical');
            }
            menuOption.appendChild(textElement);
        });
        this.container.appendChild(this.wrapper);
    }
}
