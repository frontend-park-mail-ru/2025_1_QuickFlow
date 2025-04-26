import createElement from '@utils/createElement';


export default class MainLayoutComponent {
    static __instance: MainLayoutComponent;

    private main: HTMLElement | null = document.querySelector('main');
    private config: Record<string, any> = {};
    private parent: HTMLElement | null = document.getElementById('parent');
    
    container: HTMLElement | null = null;
    top: HTMLElement | null = null;
    left: HTMLElement | null = null;
    right: HTMLElement | null = null;

    constructor() {
        if (MainLayoutComponent.__instance) {
            return MainLayoutComponent.__instance;
        }

        MainLayoutComponent.__instance = this;
    }

    render(config: Record<string, any>) {
        this.config = config;
        if (this.main) this.main.innerHTML = '';
        this.resetClasses();

        this.container = createElement({
            parent: this.main,
            classes: ['container', `container_${this.config.type}`],
        });

        switch (this.config.type) {
            case 'feed':
                this.renderFeed();
                break;
            case 'profile': 
                this.renderProfile();
                break;
            case 'messenger':
                this.renderMessenger();
                break;
            case 'auth': 
                this.renderAuth();
                break;
            case 'scores': 
                this.renderScores();
                break;
            case 'not-found': 
                this.renderNotFound();
                break;
        }

        return this;
    }

    renderScores() {
        if (!this.parent || !this.main) return;

        this.parent.classList.add('parent_hidden-ui');
        this.main.classList.add('main_clear');
    }

    resetClasses() {
        if (!this.parent || !this.main) return;

        this.parent.className = 'parent container';
        this.main.className = 'main';
        if (this.container) this.container.className = 'container';
    }

    clear() {
        if (!this.container || !this.main) return;

        this.container.innerHTML = '';
        this.main.removeChild(this.container);
    }

    renderNotFound() {
        if (!this.parent || !this.main) return;

        this.parent.classList.add('parent_hidden-ui');
        this.main.classList.add('main_wide');
    }

    renderAuth() {
        if (!this.parent || !this.main) return;

        this.parent.classList.add('parent_hidden-ui');
        this.main.classList.add('main_wide');
    }

    renderMessenger() {
        if (!this.main) return;

        this.main.style.position = 'fixed';
    }

    renderProfile() {
        if (!this.main) return;

        this.main.style.position = 'absolute';

        this.top = createElement({
            parent: this.container,
            classes: ['container__row'],
        });

        const bottomRow = createElement({
            parent: this.container,
            classes: ['container__row'],
        });

        this.left = createElement({
            parent: bottomRow,
            classes: ['container__column', 'container__column_left'],
        });

        this.right = createElement({
            parent: bottomRow,
            classes: ['container__column', 'container__column_right'],
        });
    }

    renderFeed() {
        if (!this.main) return;

        this.main.style.position = 'absolute';
        
        this.left = createElement({
            parent: this.container,
            classes: ['container__column', 'container__column_left'],
        });

        this.right = createElement({
            parent: this.container,
            classes: ['container__column', 'container__column_right'],
        });
    }
}
