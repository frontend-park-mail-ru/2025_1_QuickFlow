import InputComponent from '@components/UI/InputComponent/InputComponent';
import createElement from '@utils/createElement';


const DEBOUNCE_DELAY = 500;
const RESULTS_ITEMS_COUNT = 25;


export default class SearchComponent {
    private parent: HTMLElement | SearchComponent;
    private config: Record<string, any>;

    private search: HTMLElement | null = null;
    private input: InputComponent | null = null;
    private isSecondary: boolean = false;

    constructor(parent: HTMLElement | SearchComponent, config: Record<string, any>) {
        this.parent = parent;
        this.config = config;

        if (this.parent instanceof SearchComponent) {
            this.isSecondary = true;
            this.search = this.parent.search;
            this.input = this.parent.input;
            this.config.results = this.parent.config.results;
            this.parent = this.parent.parent;
        }

        this.render();
    }

    render() {
        if (this.isSecondary) {
            // this.search = this.config.searchInstance.search;

            // if (this.config?.isResultsChild) {
            //     this.config.results.remove();
            //     this.search.appendChild(this.config.results);
            // }
    
            // const input = new InputComponent(this.search, {
            //     type: 'search',
            //     placeholder: this.config.placeholder || 'Поиск',
            //     showRequired: false,
            //     classes: [...this.config?.inputClasses],
            // });
    
            this.input.addListener(
                () => this.handleSearch(this.input),
                DEBOUNCE_DELAY
            );
        } else {
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
    
            this.input = new InputComponent(this.search, {
                type: 'search',
                placeholder: this.config.placeholder || 'Поиск',
                showRequired: false,
                classes: [...this.config?.inputClasses],
            });
    
            this.input.addListener(
                () => this.handleSearch(this.input),
                DEBOUNCE_DELAY
            );
        }
    }

    private async handleSearch(input: InputComponent) {
        if (!this.isSecondary) {
            if (!input.value) {
                this.config?.elementToHide?.classList?.remove('hidden');
                return this.config.results.classList.add('hidden');
            }
            this.config?.elementToHide?.classList?.add('hidden');
            this.config.results.classList.remove('hidden');
        }

        const [status, resultsData] = await this.config.searchResults(input.value, this.config.resultsCount || RESULTS_ITEMS_COUNT);
        
        // const [status, resultsData] = [200, []];

        switch (status) {
            case 200:
                this.renderResults(resultsData);
                break;
        }
    }

    showNotFound() {
        if (!this.isSecondary) {
            this.config.results.innerHTML = '';
        }
        this.config.renderEmptyState(this.config.results);
    }

    renderResults(resultsData: Record<string, any>) {
        if (
            !resultsData ||
            !resultsData.payload ||
            resultsData.payload.length === 0
        ) return this.showNotFound();

        if (!this.isSecondary) {
            this.config.results.innerHTML = '';
        }

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
        
        for (const result of resultsData.payload) {
            this.config.renderResult(this.config.results, result);
        }
    }
}
