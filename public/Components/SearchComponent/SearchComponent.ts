import Ajax from '@modules/ajax';
import InputComponent from '@components/UI/InputComponent/InputComponent';
import createElement from '@utils/createElement';


const DEBOUNCE_DELAY = 500;
const REQUEST_USERS_COUNT = 10;


export default class SearchComponent {
    private parent: HTMLElement;
    private config: Record<string, any>;
    private search: HTMLElement | null = null;
    private results: HTMLElement | null = null;

    constructor(parent: any, config: Record<string, any>) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    render() {
        this.search = createElement({
            parent: this.parent,
            classes: [
                'header__search-wrapper',
                ...this.config.classes
            ]
        });

        const input = new InputComponent(this.search, {
            type: 'search',
            placeholder: this.config.placeholder || 'Поиск',
            showRequired: false,
            classes: [...this.config.inputClasses],
        });

        input.addListener(() => {
            if (input.value === '') return this.showNotFound();

            input.input.onfocus = () => {
                if (!this.results) return;
                this.results.classList.remove('hidden');
            }

            document.addEventListener('mouseup', (event) => {
                if (!this.search || !this.results) return;

                const target = event.target as Node;

                if (!this.search.contains(target)) {
                    this.results.classList.add('hidden');
                }
            });

            Ajax.get({
                url: '/users/search',
                params: {
                    string: input.value,
                    users_count: REQUEST_USERS_COUNT,
                },
                callback: (status: number, users: any) => {
                    switch (status) {
                        case 200:
                            this.cdOk(users);
                            break;
                    }
                }
            });
        }, DEBOUNCE_DELAY);
    }

    showNotFound() {
        if (!this.results) return;

        this.results.innerHTML = '';
        createElement({
            parent: this.results,
            text: 'Ничего не найдено',
            classes: ['header__result_empty'],
        });
    }

    cdOk(users: any) {
        if (!this.results) {
            this.results = createElement({
                parent: this.search,
                classes: ['header__results'],
            });
        }

        if (
            !users ||
            !users.payload ||
            users.payload.length === 0
        ) return this.showNotFound();

        if (this.results) this.results.innerHTML = '';
        
        for (const user of users.payload) {
            createElement({
                tag: 'a',
                parent: this.results,
                text: `${user.firstname} ${user.lastname}`,
                classes: ['header__result'],
                attrs: { href: `/profiles/${user.username}` },
            });
        }
    }
}
