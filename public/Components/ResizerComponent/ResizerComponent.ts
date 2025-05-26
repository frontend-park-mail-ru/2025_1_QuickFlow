import createElement from '@utils/createElement';


export default class ResizerComponent {
    private parent: HTMLElement;
    private config: Record<string, any>;
    private isMini: boolean = false;

    container: HTMLElement | null = null;

    constructor(parent: HTMLElement, config: Record<string, any>) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    render() {
        this.container = createElement({
            parent: this.parent,
            classes: ['resizer'],
        });

        this.addFunctionality();
    }

    addFunctionality() {
        let isResizing = false;
        
        this.container?.addEventListener('mousedown', () => {
            isResizing = true;
            document.body.classList.add('resize');
        });
    
        document.addEventListener('mousemove', (event) => {
            if (!isResizing) return;
    
            const newWidth = event.clientX - this.parent.getBoundingClientRect().left;
            this.parent.style.width = `${newWidth}px`;

            if (this.config.toDefaultWidth && this.config.toMiniWidth) {
                if (newWidth < this.config.toMiniWidth) {
                    this.parent.classList.add(this.config.classMini);
                    this.isMini = true;
                } else if (newWidth > this.config.toDefaultWidth) {
                    this.parent.classList.remove(this.config.classMini);
                    this.isMini = false;
                }
            }
        });
    
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.classList.remove('resize');
                if (this.isMini) {
                    this.config.onResized(this.config.classMini);
                    return;
                }
                this.config.onResized(this.parent.style.width);
            }
        });
    }
}