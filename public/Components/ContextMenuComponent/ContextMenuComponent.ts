import createElement from '@utils/createElement';
import insertIcon from '@utils/insertIcon';


const DEFAULT_IS_CRITICAL = false;
const DEFAULT_POSITION = 'below-end';
const DEFAULT_SIZE = 'default';


export interface OptionConfig {
    text: string;
    icon?: string;
    href?: string;
    isCritical?: boolean;
    onClick?: () => void;
}

interface ContextMenuConfig {
    data: Record<string, OptionConfig>;
    classes?: string;
    size?: 'default' | 'mini' | 'inherit';
    position?: string;
}


export default class ContextMenuComponent {
    private parent: HTMLElement;
    private config: ContextMenuConfig;

    private wrapper: HTMLElement;
    private hideTimeout: NodeJS.Timeout;

    constructor(parent: HTMLElement, config: ContextMenuConfig) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    private render() {
        if (!Object.keys(this.config.data).length) {
            return;
        }

        this.wrapper = createElement({
            parent: this.parent,
            classes: [
                'context-menu',
                `context-menu_${this.config.size || DEFAULT_SIZE}`,
                this.config.classes,
                `context-menu_${this.config.position || DEFAULT_POSITION}`
            ]
        });

        this.parent.addEventListener('click', (e) => this.toggle(e));
        this.parent.addEventListener('pointerover', (e) => this.show(e));
        this.parent.addEventListener('pointerout', (e) => this.hide(e));

        this.wrapper.addEventListener('pointerover', (e) => this.show(e));
        this.wrapper.addEventListener('pointerout', (e) => this.hide(e));

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

    private hide(e: PointerEvent) {
        const related = e.relatedTarget as HTMLElement;

        if (this.wrapper.contains(related) || this.parent.contains(related)) {
            return;
        }

        this.hideTimeout = setTimeout(() => {
            this.wrapper.classList.remove('context-menu_visible');                
        }, 300);
    }

    private show(e) {
        clearTimeout(this.hideTimeout);
        this.wrapper.classList.add('context-menu_visible');
    }

    private toggle(e: MouseEvent) {
        if (this.wrapper.contains(e.target as HTMLElement)) {
            return;
        }

        clearTimeout(this.hideTimeout);
        this.wrapper.classList.toggle('context-menu_visible');
    }

    public getItem(name: string): HTMLElement {
        return this.wrapper.querySelector(`.context-menu__option[data-href="${name}"]`);
    }
}
