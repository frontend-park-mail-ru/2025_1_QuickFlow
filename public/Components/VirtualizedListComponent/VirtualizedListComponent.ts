import createElement from "@utils/createElement";

interface VirtualizedListConfig<T> {
    container: HTMLElement;
    itemSelector: string;
    bufferSize?: number;
    virtualizeMargin?: number;
    getKey: (el: HTMLElement) => string;
    fetchRenderedItem: (key: string) => HTMLElement;
}

export default class VirtualizedListComponent<T> {
    private container: HTMLElement;
    private itemSelector: string;
    private bufferSize: number;
    private virtualizeMargin: number;
    private getKey: (el: HTMLElement) => string;
    private fetchRenderedItem: (key: string) => HTMLElement;
    private observer: IntersectionObserver;

    private itemsMap: Map<string, HTMLElement> = new Map();
    private storedItems: Map<string, { top: number; height: number }> = new Map();
    private topPadding = 0;
    private bottomPadding = 0;

    private topSpacer!: HTMLElement;
    private bottomSpacer!: HTMLElement;

    private topItems: Array<HTMLElement> = [];
    private bottomItems: Array<HTMLElement> = [];

    constructor(config: VirtualizedListConfig<T>) {
        this.container = config.container;
        this.itemSelector = config.itemSelector;
        this.bufferSize = config.bufferSize || 3;
        this.virtualizeMargin = config.virtualizeMargin || 3500;
        this.getKey = config.getKey;
        this.fetchRenderedItem = config.fetchRenderedItem;

        this.init();
    }

    private init() {
        this.topSpacer = createElement({
            classes: ['spacer', 'spacer_top'],
        });

        this.bottomSpacer = createElement({
            classes: ['spacer', 'spacer_bottom'],
        });

        this.container.prepend(this.topSpacer);
        this.container.append(this.bottomSpacer);

        this.observer = new IntersectionObserver(this.handleIntersect.bind(this), {
            root: null,
            rootMargin: `${this.virtualizeMargin}px`,
            threshold: 0,
        });

        this.observe();
    }

    public pushElements(items: Array<HTMLElement>) {
        this.bottomSpacer.remove();
        this.container.append(this.bottomSpacer);
        this.observe(items);
    }

    private observe(
        items: Array<HTMLElement> = Array.from(
            this.container.querySelectorAll(this.itemSelector)
        ) as HTMLElement[]
    ) {
        items.forEach(item => {
            const key = this.getKey(item);
            this.itemsMap.set(key, item);
            this.observer.observe(item);
        });

        this.observer.observe(this.topSpacer);
        this.observer.observe(this.bottomSpacer);
    }

    private handleIntersect(entries: IntersectionObserverEntry[]) {
        for (const entry of entries) {
            const el = entry.target as HTMLElement;

            if (el.classList.contains('spacer_top')) {
                if (
                    !entry.isIntersecting ||
                    !this.topItems.length
                ) continue;

                const returningPost = this.topItems.pop();

                this.topSpacer.after(returningPost);
                const height = returningPost.offsetHeight;
                this.topPadding -= height;
                this.updateSpacers();
                this.observer.observe(returningPost);

                continue;
            }
            
            if (el.classList.contains('spacer_bottom')) {
                if (
                    !entry.isIntersecting ||
                    !this.bottomItems.length
                ) continue;

                const returningPost = this.bottomItems.pop();

                this.bottomSpacer.previousSibling.before(returningPost);
                const height = returningPost.offsetHeight;
                this.bottomPadding -= height;
                this.updateSpacers();
                this.observer.observe(returningPost);

                continue;
            }

            if (!entry.isIntersecting) {
                const top = el.offsetTop;
                const height = el.offsetHeight;

                this.observer.unobserve(el);
                el.remove();

                if (top < -this.container.getBoundingClientRect().top) {
                    this.topPadding += height;
                    this.topItems.push(el);
                } else {
                    this.bottomPadding += height;
                    this.bottomItems.push(el);
                }

                this.updateSpacers();
            }
        };
    }

    private updateSpacers() {
        this.topSpacer.style.height = `${this.topPadding}px`;
        this.bottomSpacer.style.height = `${this.bottomPadding}px`;
    }

    public destroy() {
        this.observer.disconnect();
        this.itemsMap.clear();
        this.storedItems.clear();
        this.topSpacer.remove();
        this.bottomSpacer.remove();
    }
}
