import createElement from '../../utils/createElement.js';

const DEFAULT_IS_CRITICAL = false;

export default class ContextMenuComponent {
    #parent
    #config
    constructor(parent, config) {
        this.#parent = parent;
        this.#config = config;
        this.render();
    }

    render() {
        this.wrapper = createElement({
            parent: this.#parent,
            classes: ['context-menu']
        });

        Object.entries(this.#config.data).forEach(([, { href, text, icon, isCritical }],) => {
            const menuOption = createElement({
                parent: this.wrapper,
                classes: ['menu-option'],
                attrs: {'data-href': href}
            });

            createElement({
                parent: menuOption,
                classes: ['context-menu-icon'],
                attrs: {src: `/static/img/${icon}.svg`}
            });

            createElement({
                parent: menuOption,
                classes: ['context-menu-text', (isCritical || DEFAULT_IS_CRITICAL) ? 'critical' : null],
                text
            });
        });
    }
}
