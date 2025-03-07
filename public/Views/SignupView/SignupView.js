import SignupFormComponent from '../../Components/SignupFormComponent/SignupFormComponent.js';

export default class SignupView {
    constructor(menu) {
        this.menu = menu;
        this.formWrapper = document.createElement('div');
    }

    render() {
        const signupForm = new SignupFormComponent(this.formWrapper, this.menu);
        return this.formWrapper;
    }
}