import createElement from "../../../utils/createElement";


const TIME_VISIBLE = 2 * 1000;
const DEFAULT_SIZE = 'small';


export default class PopUpComponent {
    private parent: HTMLElement;
    private config: {
        icon?: string;
        text?: string;
        size?: string;
        isError?: boolean;
    };
    private popup: HTMLElement;
    private hideTimeout: number | null = null;
    private hover: boolean = false;

    constructor(parent: HTMLElement, config: Record<string, any>) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    async render() {
        this.popup = createElement({
            parent: this.parent,
            classes: [
                'popup',
                this.config?.isError ? 'popup_error' : 'popup',
            ],
        })

        await this.insertIcon();

        createElement({
            parent: this.popup,
            text: this.config?.text,
        })

        this.addHoverListeners();
        this.showWithDelay();
    }

    private showWithDelay() {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.popup.classList.add('popup_visible');
            });
        });
        this.setHideTimeout();
    }

    private setHideTimeout() {
        this.hideTimeout = window.setTimeout(() => {
            if (!this.hover) this.hide();
        }, TIME_VISIBLE);
    }

    private addHoverListeners() {
        this.popup.addEventListener('mouseenter', () => {
            this.hover = true;
            if (this.hideTimeout) {
                clearTimeout(this.hideTimeout);
                this.hideTimeout = null;
            }
        });

        this.popup.addEventListener('mouseleave', () => {
            this.hover = false;
            this.setHideTimeout();
        });
    }

    private hide() {
        this.popup.classList.remove('popup_visible');
        this.popup.classList.add('popup_hidden');

        setTimeout(() => {
            this.popup.remove();
        }, 300);
    }

    private async insertIcon() {
        if (!this.config.icon) return;
    
        const res = await fetch(`/static/img/${this.config.icon}.svg`);
        const svgHTML = await res.text();
    
        const icon = createElement({
            parent: this.popup,
            classes: [
                'popup__icon',
                this.config?.isError ? 'popup__icon_error' : 'popup__icon',
                `popup__icon_${this.config?.size || DEFAULT_SIZE}`
            ],
        });
    
        icon.innerHTML = svgHTML;
    
        const svg = icon.querySelector('svg');
        if (svg) {
            svg.setAttribute('fill', 'currentColor');
            svg.querySelectorAll('[fill]').forEach(element => {
                element.removeAttribute('fill');
            });
        }
    }
}
