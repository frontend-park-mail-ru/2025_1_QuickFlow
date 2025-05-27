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

type ContextMenuListenerType = 'click' | 'hover' | 'contextmenu';

interface ContextMenuConfig {
    data: Record<string, OptionConfig>;
    classes?: string;
    size?: 'default' | 'mini' | 'inherit';
    position?: string;
    listenersTypes?: ContextMenuListenerType[];
    onVisibilityToggle?: (isVisible: boolean) => void;
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

        this.handleEvents();

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

    private handleEvents() {
        if (!this.config?.listenersTypes?.length) {
            this.parent.addEventListener('click', (e) => this.toggle(e));

            this.parent.addEventListener('pointerover', (e) => this.show(e));
            this.parent.addEventListener('pointerout', (e) => this.hide(e));
            this.wrapper.addEventListener('pointerover', (e) => this.show(e));
            this.wrapper.addEventListener('pointerout', (e) => this.hide(e));
            return;
        }

        if (this.config.listenersTypes?.includes('click')) {
            this.parent.addEventListener('click', (e) => this.toggle(e));
        }

        if (this.config.listenersTypes?.includes('hover')) {
            this.parent.addEventListener('pointerover', (e) => this.show(e));
            this.parent.addEventListener('pointerout', (e) => this.hide(e));
            this.wrapper.addEventListener('pointerover', (e) => this.show(e));
            this.wrapper.addEventListener('pointerout', (e) => this.hide(e));
        }

        if (this.config.listenersTypes?.includes('contextmenu')) {
            document.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if ((e.target as HTMLElement).closest(`.${this.parent.classList[0]}`) !== this.parent) {
                    this.hide(e as PointerEvent, 0);
                    return;
                }
                this.toggle(e);
            });
            document.addEventListener('click', (e) => {
                this.hide(e as PointerEvent, 0);
            });
        }
    }

    private hide(e: PointerEvent, delay: number = 300) {
        const related = e.relatedTarget as HTMLElement;

        if (this.wrapper.contains(related) || this.parent.contains(related)) {
            return;
        }

        this.hideTimeout = setTimeout(() => {
            this.wrapper.classList.remove('context-menu_visible');
            this?.config?.onVisibilityToggle(false);
        }, delay);
    }

    private show(e) {
        clearTimeout(this.hideTimeout);
        this.wrapper.classList.add('context-menu_visible');
        this?.config?.onVisibilityToggle(true);
    }

    private toggle(e: MouseEvent) {
        if (this.wrapper.contains(e.target as HTMLElement)) {
            return;
        }

        clearTimeout(this.hideTimeout);
        this.wrapper.classList.toggle('context-menu_visible');
        
        this?.config?.onVisibilityToggle(
            this.wrapper.classList.contains('context-menu_visible')
        );
    }

    public getItem(name: string): HTMLElement {
        return this.wrapper.querySelector(`.context-menu__option[data-href="${name}"]`);
    }
}
