import LoginFormComponent from '../../Components/LoginFormComponent/LoginFormComponent.js';

export default class LoginView {
    constructor(menu) {
        this.menu = menu;
        this.formWrapper = document.createElement('div');
    }

    render() {
        const loginForm = new LoginFormComponent(this.formWrapper, this.menu);
        return this.formWrapper;
    }
}
