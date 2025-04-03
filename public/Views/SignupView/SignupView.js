import SignupFormComponent from '../../Components/SignupFormComponent/SignupFormComponent.js';
import createElement from '../../utils/createElement.js';


export default class SignupView {
    constructor(menu, header) {
        this.menu = menu;
        this.header = header;

        this.formWrapper = null;
    }

    render() {
        new SignupFormComponent(this.formWrapper, this.menu, this.header);
        this.formWrapper = createElement({});

        return this.formWrapper;
    }
}
