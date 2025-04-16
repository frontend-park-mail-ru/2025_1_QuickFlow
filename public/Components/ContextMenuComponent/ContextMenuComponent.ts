import createElement from '@utils/createElement';


const DEFAULT_IS_CRITICAL = false;
const DEFAULT_POSITION = 'below-end';
const DEFAULT_SIZE = 'default';


export default class ContextMenuComponent {
    #parent
    #config
    wrapper: HTMLElement | any;
    constructor(parent: any, config: any) {
        this.#parent = parent;
        this.#config = config;

        this.render();
    }

    render() {
        if (Object.keys(this.#config.data).length === 0) return;

        this.wrapper = createElement({
            parent: this.#parent,
            classes: [
                'context-menu',
                `context-menu_${this.#config.size || DEFAULT_SIZE}`,
                this.#config.classes,
                `context-menu_${this.#config.position || DEFAULT_POSITION}`
            ]
        });

        Object.entries(this.#config.data).forEach(([, option]: [string, any]) => {
            const { href, text, icon, isCritical, onClick } = option;

            const menuOption = createElement({
                parent: this.wrapper,
                classes: ['context-menu__option'],
                attrs: {'data-href': href}
            });

            if (onClick) {
                menuOption.addEventListener('click', (event: any) => {
                    event.preventDefault();
                    onClick();
                })
            }

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
