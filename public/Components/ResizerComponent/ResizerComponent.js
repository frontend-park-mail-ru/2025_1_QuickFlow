import createElement from '../../utils/createElement.js';


export default class ResizerComponent {
    #parent
    #config
    #isMini
    constructor(parent, config) {
        this.#parent = parent;
        this.#config = config;

        this.container = null;
        this.#isMini = false;
        this.render();
    }

    render() {
        this.container = createElement({
            parent: this.#parent,
            classes: ['messenger-resizer'],
        });

        this.addFunctionality();
    }

    addFunctionality() {
        let isResizing = false;
        
        this.container.addEventListener('mousedown', () => {
            isResizing = true;
            document.body.classList.add('resize');
        });
    
        document.addEventListener('mousemove', (event) => {
            if (!isResizing) return;
    
            const newWidth = event.clientX - this.#parent.getBoundingClientRect().left;
            this.#parent.style.width = `${newWidth}px`;

            if (this.#config.toDefaultWidth && this.#config.toMiniWidth) {
                if (newWidth < this.#config.toMiniWidth) {
                    this.#parent.classList.add('mini');
                    this.#isMini = true;
                } else if (newWidth > this.#config.toDefaultWidth) {
                    this.#parent.classList.remove('mini');
                    this.#isMini = false;
                }
            }
        });
    
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.classList.remove('resize');
                if (this.#isMini) {
                    this.#config.onResized('mini');
                    return;
                }
                this.#config.onResized(this.#parent.style.width);
            }
        });
    }
}