import SignupFormComponent from '../../Components/SignupFormComponent/SignupFormComponent.js';
import MainLayoutComponent from '../../Components/MainLayoutComponent/MainLayoutComponent.js';


class SignupView {
    constructor() {}

    render() {
        const containerObj = new MainLayoutComponent().render({
            type: 'auth',
        });
        
        new SignupFormComponent(containerObj.container);

        return containerObj.container;
    }
}

export default new SignupView();
