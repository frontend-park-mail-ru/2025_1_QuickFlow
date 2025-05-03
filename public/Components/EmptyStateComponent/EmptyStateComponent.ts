import createElement from '@utils/createElement';
import insertIcon from '@utils/insertIcon';


export default class EmptyStateComponent {
    private parent: HTMLElement;
    private config: Record<string, any>;

    constructor(parent: HTMLElement, config: Record<string, any>) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    private render() {
        const emptyState = createElement({
            parent: this.parent,
            classes: ['empty-state'],
        });

        insertIcon(emptyState, {
            classes: ['empty-state__icon'],
            name: this.config.icon,
        });

        // createElement({
        //     parent: emptyState,
        //     classes: ['empty-state-icon'],
        //     attrs: { src: this.config.icon },
        // });

        createElement({
            parent: emptyState,
            classes: ['empty-state__text'],
            text: this.config.text,
        });
    }
}
