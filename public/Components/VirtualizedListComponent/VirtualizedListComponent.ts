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
    private virtualizeMargin: number;
    observer: IntersectionObserver;

    private itemsMap: Map<string, HTMLElement> = new Map();
    private storedItems: Map<string, { top: number; height: number }> = new Map();
    private topPadding = 0;
    private bottomPadding = 0;

    private topSpacer!: HTMLElement;
    private bottomSpacer!: HTMLElement;

    private topItems: Array<HTMLElement> = [];
    private bottomItems: Array<HTMLElement> = [];
    isInserting: boolean = false;
    private items: HTMLElement[];

    constructor(config: VirtualizedListConfig<T>) {
        this.container = config.container;
        this.itemSelector = config.itemSelector;
        this.virtualizeMargin = config.virtualizeMargin || 3500;
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
            rootMargin: `${this.virtualizeMargin / 2}px`,
            threshold: 0,
        });

        this.items = Array.from(
            this.container.querySelectorAll(this.itemSelector)
        ) as HTMLElement[];

        this.observe();
        document.addEventListener('scroll', this.onScroll.bind(this));
    }

    public pushElements(items: Array<HTMLElement>) {
        this.bottomSpacer.remove();
        this.container.append(this.bottomSpacer);

        this.items = this.items.concat(items);
        this.observe();
    }

    private observe() {
        this.items.forEach(item => this.observer.observe(item));
    }

    private onScroll() {
        if (this.isInserting) return;
        this.isInserting = true;

        setTimeout(() => {
            const scrollTop = document.documentElement.scrollTop;
            const containerRect = this.container.getBoundingClientRect();

            requestAnimationFrame(() => {
                this.observer.disconnect();

                if (
                    scrollTop < this.topPadding &&
                    this.topItems.length
                ) {
                    const returningPost = this.topItems.pop();
                    if (returningPost) {
                        this.topSpacer.after(returningPost);
                        const height = returningPost.offsetHeight;
                        this.topPadding -= height;
                        this.updateSpacers();

                        this.items.unshift(returningPost);
                    }
                }
                
                if (
                    scrollTop + this.container.clientHeight > containerRect.height - this.bottomPadding &&
                    this.bottomItems.length
                ) {
                    const returningPost = this.bottomItems.shift();
                    if (returningPost) {
                        const beforeBottomSpacer = this.bottomSpacer.previousElementSibling;
                        if (beforeBottomSpacer.classList.contains('extra-load-sentinel')) {
                            beforeBottomSpacer.before(returningPost);
                        } else {
                            this.bottomSpacer.before(returningPost);
                        }
                        const height = returningPost.offsetHeight;
                        this.bottomPadding -= height;
                        this.updateSpacers();

                        this.items.push(returningPost);
                    }
                }

                this.observe();
                this.isInserting = false;
            });
        }, 50);
    }

    private handleIntersect(entries: IntersectionObserverEntry[]) {
        for (const entry of entries) {
            const el = entry.target as HTMLElement;

            if (!entry.isIntersecting) {
                const top = el.offsetTop;
                const height = el.offsetHeight;

                requestAnimationFrame(() => {
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
                });
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
