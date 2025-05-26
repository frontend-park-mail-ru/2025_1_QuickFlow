import createElement from "@utils/createElement";

interface CounterConfig<T> {
    value: number;
    classes: string[];
}

export default class CounterComponent {
    private parent: HTMLElement;
    private config: CounterConfig<any>;

    public element: HTMLElement | null = null;

    constructor(parent: HTMLElement, config: CounterConfig<any>) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    private render() {
        if (!this.config.value) {
            return;
        }
        
        this.element = createElement({
            parent: this.parent,
            classes: ["counter", ...this.config.classes],
        });

        createElement({
            parent: this.element,
            classes: ['counter__value'],
            text: this.config.value.toString(),
        });
    }
}
