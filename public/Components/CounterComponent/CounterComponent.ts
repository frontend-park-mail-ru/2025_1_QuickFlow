import createElement from "@utils/createElement";

interface CounterConfig<T> {
    value: number;
    classes: Array<string>;
}

export default class CounterComponent {
    private parent: HTMLElement;
    private config: CounterConfig<any>;

    element: HTMLElement | null = null;

    constructor(parent: HTMLElement, config: CounterConfig<any>) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    private render() {
        this.element = createElement({
            parent: this.parent,
            classes: ["counter", ...this.config.classes],
        });

        createElement({
            parent: this.element,
            text: this.config.value.toString(),
        });
    }
}
