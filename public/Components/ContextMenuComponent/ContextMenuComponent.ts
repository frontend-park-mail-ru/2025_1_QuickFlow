import createElement from '@utils/createElement';
import insertIcon from '@utils/insertIcon';


const DEFAULT_IS_CRITICAL = false;
const DEFAULT_POSITION = 'below-end';
const DEFAULT_SIZE = 'default';


export default class ContextMenuComponent {
    private parent: HTMLElement;
    private config: Record<string, any>;

    wrapper: HTMLElement | any;

    constructor(parent: HTMLElement, config: Record<string, any>) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    public getItem(name: string): HTMLElement {
        return this.wrapper.querySelector(`.context-menu__option[data-href="${name}"]`);
    }

    render() {
        if (Object.keys(this.config.data).length === 0) return;

        this.wrapper = createElement({
            parent: this.parent,
            classes: [
                'context-menu',
                `context-menu_${this.config.size || DEFAULT_SIZE}`,
                this.config.classes,
                `context-menu_${this.config.position || DEFAULT_POSITION}`
            ]
        });

        Object.entries(this.config.data).forEach(([, option]: [string, any]) => {
            const { href, text, icon, isCritical, onClick } = option;

            const menuOption = createElement({
                parent: this.wrapper,
                classes: [
                    'context-menu__option',
                    (isCritical || DEFAULT_IS_CRITICAL) ?
                        'context-menu__option_critical' :
                        'context-menu__option'
                ],
                attrs: {'data-href': href}
            });

            if (onClick) {
                menuOption.addEventListener('click', (event: any) => {
                    event.preventDefault();
                    onClick();
                })
            }

            // createElement({
            //     parent: menuOption,
            //     classes: ['context-menu__icon'],
            //     attrs: {src: `/static/img/${icon}.svg`}
            // });

            insertIcon(menuOption, {
                name: icon,
                classes: ['context-menu__icon'],
            });

            createElement({
                parent: menuOption,
                classes: ['context-menu__text'],
                text
            });
        });
    }
}
