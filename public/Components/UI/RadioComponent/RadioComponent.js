export default class RadioComponent {
    constructor(container, config) {
        this.config = config;
        this.container = container;
        this.wrapper = null;
    }

    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('radio-wrapper');

        // Label (если задан)
        if (this.config.label) {
            const label = document.createElement('label');
            label.textContent = this.config.label;
            label.classList.add('input-label');
            if (this.config.showRequired === true) {
                const requiredMark = document.createElement('span');
                requiredMark.textContent = ' *';
                requiredMark.classList.add('required');
                label.appendChild(requiredMark);
            }
            this.wrapper.appendChild(label);
        }

        const choicesWrapper = document.createElement('div');
        choicesWrapper.classList.add('choices-wrapper');
        this.wrapper.appendChild(choicesWrapper);

        for (const key in this.config.radios) {
            const radioData = this.config.radios[key];
            const choice = document.createElement('div');
            choice.classList.add('choice');

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = this.config.name;
            radio.value = radioData.value;
            radio.id = radioData.id;
            radio.required = this.config.required || false;

            const label = document.createElement('label');
            label.textContent = radioData.label;
            label.htmlFor = radioData.id;

            choice.appendChild(radio);
            choice.appendChild(label);
            choicesWrapper.appendChild(choice);
        }
        this.container.appendChild(this.wrapper);
    }

    getChecked() {
        return this.wrapper.querySelector('input[type="radio"]:checked');
    }

    setChecked(value) {
        const radio = this.wrapper.querySelector(`input[type="radio"][value="${value}"]`);
        if (radio) {
            radio.checked = true;
        }
    }
}
