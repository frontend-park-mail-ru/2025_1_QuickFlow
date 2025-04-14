import createElement from '../../utils/createElement.js';

export default class RadioMenuComponent {
    #config
    #parent
    constructor(parent, config) {
        this.#parent = parent;
        this.#config = config;

        this.wrapper = null;
        this.pages = {};
        this.activePage = null;
        
        this.render();
    }

    render() {
        this.wrapper = createElement({
            parent: this.#parent,
            classes: ['radio-menu']
        });

        Object.entries(this.#config.items).forEach(([key, { title }], index) => {
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

            menuItem.addEventListener('click', (event) => {
                event.preventDefault();
                this.goToPage(event.target);
            });
        });
    }

    goToPage(menuItem) {
        if (this.activePage === menuItem) return;
        if (this.activePage) {
            this.activePage.classList.remove('radio-menu__item_active');
        }
        menuItem.classList.add('radio-menu__item_active');
        this.activePage = menuItem;

        const section = menuItem.dataset.section;
        if (this.#config.items[section].onClick) {
            this.#config.items[section].onClick();
        }
    }
}
