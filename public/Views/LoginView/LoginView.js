import LoginFormComponent from '../../Components/LoginFormComponent/LoginFormComponent.js';
import createElement from '../../utils/createElement.js';


export default class LoginView {
    constructor(menu, header) {
        this.menu = menu;
        this.header = header;

        this.formWrapper = null;
    }

    render() {
        this.formWrapper = createElement({});
        new LoginFormComponent(this.formWrapper, this.menu, this.header);

        return this.formWrapper;
    }
}
