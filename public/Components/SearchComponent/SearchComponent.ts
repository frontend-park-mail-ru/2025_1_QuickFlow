import Ajax from '@modules/ajax';
import InputComponent from '@components/UI/InputComponent/InputComponent';
import createElement from '@utils/createElement';
import API from '@utils/api';


const DEBOUNCE_DELAY = 500;
const REQUEST_USERS_COUNT = 10;


export default class SearchComponent {
    private parent: HTMLElement;
    private config: Record<string, any>;
    private search: HTMLElement | null = null;

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
                ...this.config?.classes
            ]
        });
        // if (this.config.classes) this.search.classList.add(...this.config.classes);

        const input = new InputComponent(this.search, {
            type: 'search',
            placeholder: this.config.placeholder || 'Поиск',
            showRequired: false,
            classes: [...this.config?.inputClasses],
        });

        // input.input.onfocus = () => {
        //     this.config.results.classList.remove('hidden');
        // }

        // document.addEventListener('mouseup', (event) => {
        //     if (!this.search.contains(event.target as Node)) {
        //         this.config.results.classList.add('hidden');
        //     }
        // });

        input.addListener(() => this.handleSearch(input), DEBOUNCE_DELAY);
    }

    private async handleSearch(input: InputComponent) {
        if (!input.value) this.config.results.classList.add('hidden');
        this.config.results.classList.remove('hidden');
        // if (!input.value) return this.showNotFound();

        const [status, friendsData] = await API.searchFriends(input.value, REQUEST_USERS_COUNT);
        
        switch (status) {
            case 200:
                this.cdOk(friendsData);
                break;
        }
    }

    showNotFound() {
        if (!this.config.results) return;

        this.config.results.innerHTML = '';
        createElement({
            parent: this.config.results,
            text: 'Ничего не найдено',
            classes: ['header__result_empty'],
        });
    }

    cdOk(users: any) {
        if (!this.config.results) return;

        if (
            !users ||
            !users.payload ||
            users.payload.length === 0
        ) return this.showNotFound();

        this.config.results.innerHTML = '';
        
        for (const user of users.payload) {
            this.config.renderResult(this.config.results, user);
        }
    }
}
