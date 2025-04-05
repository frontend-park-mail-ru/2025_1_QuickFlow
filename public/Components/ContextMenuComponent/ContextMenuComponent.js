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
            classes: [
                'context-menu',
                this.#config.size ? `context-menu_${this.#config.size}` : 'context-menu',
                this.#config.classes
            ]
        });

        Object.entries(this.#config.data).forEach(([, { href, text, icon, isCritical }],) => {
            const menuOption = createElement({
                parent: this.wrapper,
                classes: ['context-menu__option'],
                attrs: {'data-href': href}
            });

            createElement({
                parent: menuOption,
                classes: ['context-menu__icon'],
                attrs: {src: `/static/img/${icon}.svg`}
            });

            createElement({
                parent: menuOption,
                classes: [
                    (isCritical || DEFAULT_IS_CRITICAL) ?
                    'context-menu__text_critical' :
                    'context-menu__text'
                ],
                text
            });
        });
    }
}
