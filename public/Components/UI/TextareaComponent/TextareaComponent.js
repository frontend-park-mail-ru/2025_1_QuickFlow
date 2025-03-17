export default class TextareaComponent {
    constructor(container, config) {
        this.container = container;
        this.textarea = null;
        this.config = config || {};
        this.render();
    }

    render() {
        this.textarea = document.createElement('textarea');
        if (this.config.class) {
            this.textarea.classList.add(this.config.class);
        }
        this.textarea.placeholder = this.config.placeholder || '';
        this.container.appendChild(this.textarea);

        // if (this.config.btn) {
        //     this.textarea.addEventListener('input', this.updateBtnState.bind(this));
        // }
    }

    addListener(listener) {
        this.textarea.addEventListener('input', listener);
    }

    isValid() {
        return this.textarea.value.trim() !== '';
    }
}
