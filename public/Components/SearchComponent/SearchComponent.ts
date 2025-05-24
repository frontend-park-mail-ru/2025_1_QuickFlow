import InputComponent from '@components/UI/InputComponent/InputComponent';
import createElement from '@utils/createElement';


const DEBOUNCE_DELAY = 500;
const RESULTS_ITEMS_COUNT = 25;


interface SearchConfig {
    classes: string[];
    isResultsChild?: boolean;
    results: HTMLElement;
    placeholder?: string;
    inputClasses?: string[];
    elementToHide?: HTMLElement;
    
    // renderEmptyState может быть либо функцией, либо массивом функций
    renderEmptyState: ((parent: HTMLElement) => void) | Array<(parent: HTMLElement) => void>;
    
    // renderResults — одиночная функция, которая рендерит список элементов
    renderResults?: (parent: HTMLElement, items: Record<string, any>[]) => void;
    
    // searchResults — либо одна функция, либо массив функций
    // Функция принимает строку и число (лимит) и возвращает Promise с [status: number, data: any]
    searchResults: 
        | ((query: string, limit: number) => Promise<[number, Record<string, any>]>)
        | Array<(query: string, limit: number) => Promise<[number, Record<string, any>]>>;
    
    // renderTitle — либо одна функция, либо массив функций
    renderTitle: ((parent: HTMLElement) => void) | Array<(parent: HTMLElement) => void>;
    
    // renderResult — либо одна функция, либо массив функций
    renderResult: ((parent: HTMLElement, data: Record<string, any>) => void) | Array<(parent: HTMLElement, data: Record<string, any>) => void>;
    
    resultsCount?: number;
}


export default class SearchComponent {
    private parent: HTMLElement;
    private config: SearchConfig;

    search: HTMLElement | null = null;

    constructor(parent: HTMLElement, config: SearchConfig) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    render() {
        this.search = createElement({
            parent: this.parent,
            classes: [
                'header__search-wrapper',
                ...this.config?.classes,
            ],
        });

        if (this.config?.isResultsChild) {
            this.config.results.remove();
            this.search.appendChild(this.config.results);
        }

        const input = new InputComponent(this.search, {
            type: 'search',
            placeholder: this.config.placeholder || 'Поиск',
            showRequired: false,
            classes: [...(Array.isArray(this.config?.inputClasses) ? this.config.inputClasses : [])],
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
        this.config.results.innerHTML = '';
    
        const isMultiple = Array.isArray(this.config.searchResults);
        const methods = isMultiple ? this.config.searchResults : [this.config.searchResults];
        const renderTitles = isMultiple ? this.config.renderTitle : [this.config.renderTitle];
        const renderResults = isMultiple ? this.config.renderResult : [this.config.renderResult];
        const renderEmptyStates = isMultiple ? this.config.renderEmptyState : [this.config.renderEmptyState];
    
        let hasResults = false;
    
        for (let i = 0; i < methods.length; i++) {
            const searchMethod = methods[i];
            const renderTitle = renderTitles[i];
            const renderResult = renderResults[i];
            const renderEmpty = renderEmptyStates[i];
    
            const [status, resultsData] = await searchMethod(
                input.value,
                this.config.resultsCount || RESULTS_ITEMS_COUNT
            );
    
            if (status === 200 && resultsData?.payload?.length > 0) {
                hasResults = true;
                this.renderSection(resultsData.payload, renderTitle, renderResult);
            } else {
                this.renderEmptySection(renderTitle, renderEmpty);
            }
        }
    
        if (!hasResults) {
            this.config.results.classList.add('empty');
        } else {
            this.config.results.classList.remove('empty');
        }
    }

    private renderSection(
        items: Record<string, any>[],
        renderTitle: (parent: HTMLElement) => void,
        renderItem: (parent: HTMLElement, data: Record<string, any>) => void
    ) {
        const section = createElement({
            parent: this.config.results,
            classes: ['search__section']
        });

        renderTitle(section);

        const list = createElement({
            parent: section,
            classes: ['search__list']
        });

        for (const item of items) {
            renderItem(list, item);
        }
    }

    private renderEmptySection(
        renderTitle: (parent: HTMLElement) => void,
        renderEmpty: (parent: HTMLElement) => void
    ) {
        const section = createElement({
            parent: this.config.results,
            classes: ['search__section']
        });

        renderTitle(section);
        renderEmpty(section);
    }

    showNotFound() {
        this.config.results.innerHTML = '';
    
        const renderEmptyState = this.config.renderEmptyState;
        if (!renderEmptyState) return;
    
        if (Array.isArray(renderEmptyState)) {
            for (const fn of renderEmptyState) {
                fn(this.config.results);
            }
        } else {
            renderEmptyState(this.config.results);
        }
    }
    

    renderResults(resultsList: any[]) {
        const renderResult = this.config.renderResult;

        for (const result of resultsList) {
            if (Array.isArray(renderResult)) {
                for (const fn of renderResult) {
                    fn(this.config.results, result);
                }
            } else {
                renderResult(this.config.results, result);
            }
        }
    }
}
