import EmptyStateComponent from '@components/EmptyStateComponent/EmptyStateComponent';
import InputComponent from '@components/UI/InputComponent/InputComponent';
import createElement from '@utils/createElement';


const DEBOUNCE_DELAY = 500;
const RESULTS_ITEMS_COUNT = 25;


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

        if (this.config?.isResultsChild) {
            this.config.results.remove();
            this.search.appendChild(this.config.results);
        }

        const input = new InputComponent(this.search, {
            type: 'search',
            placeholder: this.config.placeholder || 'Поиск',
            showRequired: false,
            classes: [...this.config?.inputClasses],
        });

        input.addListener(() => this.handleSearch(input), DEBOUNCE_DELAY);
    }

    private async handleSearch(input: InputComponent) {
        if (!input.value) {
            this.config?.elementToHide?.classList?.remove('hidden');
            return this.config.results.classList.add('hidden');
        }
        this.config?.elementToHide?.classList?.add('hidden');
        this.config.results.classList.remove('hidden');

        const [status, resultsData] = await this.config.searchResults(input.value, this.config.resultsCount || RESULTS_ITEMS_COUNT);
        
        switch (status) {
            case 200:
                this.renderResults(resultsData);
                break;
        }
    }

    showNotFound() {
        this.config.results.innerHTML = '';
        this.config.renderEmptyState(this.config.results);
    }

    renderResults(resultsData: any) {
        if (
            !resultsData ||
            !resultsData.payload ||
            resultsData.payload.length === 0
        ) return this.showNotFound();

        this.config.results.innerHTML = '';

        if (this.config.renderTitle) {
            this.config.renderTitle(this.config.results);
        } else {
            createElement({
                tag: 'h2',
                parent: this.config.results,
                classes: ['search__title'],
                text: this.config.title,
            });
        }
        
        for (const user of resultsData.payload) {
            this.config.renderResult(this.config.results, user);
        }
    }
}
