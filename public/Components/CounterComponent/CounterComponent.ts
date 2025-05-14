import createElement from "@utils/createElement";

interface CounterConfig<T> {
    value: number;
}

export default class CounterComponent {
    private parent: HTMLElement;
    private config: CounterConfig<any>;

    constructor(parent: HTMLElement, config: CounterConfig<any>) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    private render() {
        createElement({
            parent: this.parent,
            classes: ["counter"],
            text: this.config.value,
        });
    }
}
