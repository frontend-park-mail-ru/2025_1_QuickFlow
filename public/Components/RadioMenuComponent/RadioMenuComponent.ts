import createElement from '@utils/createElement';

export default class RadioMenuComponent {
    #config
    #parent

    wrapper: HTMLElement | null = null;
    pages: Record<string, any> = {};
    activePage: any = null;

    constructor(parent: HTMLElement, config: Record<string, any>) {
        this.#parent = parent;
        this.#config = config;

        this.render();
    }

    render() {
        this.wrapper = createElement({
            parent: this.#parent,
            classes: ['radio-menu']
        });

        Object.entries(this.#config.items).forEach(([key, option], index) => {
            const { title } = option as { title: string };
            const menuItem = createElement({
                parent: this.wrapper,
                classes: ['radio-menu__item'],
                text: title,
                attrs: { 'data-section': key },
            });

            if (
                key === this.#config.active ||
                (!this.#config.active && index === 0)
            ) {
                menuItem.classList.add('radio-menu__item_active');
                this.activePage = menuItem;
            }

            menuItem.addEventListener('click', (event: any) => {
                event.preventDefault();
                this.goToPage(event.target);
            });
        });
    }

    goToPage(menuItem: HTMLElement) {
        if (this.activePage === menuItem) return;
        if (this.activePage) {
            this.activePage.classList.remove('radio-menu__item_active');
        }
        
        menuItem.classList.add('radio-menu__item_active');
        this.activePage = menuItem;

        const section = menuItem.dataset.section;
        if (this.#config.items[section as string].onClick) {
            this.#config.items[section as string].onClick();
        }
    }
}
