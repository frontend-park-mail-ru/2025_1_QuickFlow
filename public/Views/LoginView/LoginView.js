import LoginFormComponent from '../../Components/LoginFormComponent/LoginFormComponent.js';
import MainLayoutComponent from '../../Components/MainLayoutComponent/MainLayoutComponent.js';


class LoginView {
    constructor() {}

    render() {
        const containerObj = new MainLayoutComponent().render({
            type: 'auth',
        });

        new LoginFormComponent(containerObj.container);

        return containerObj.container;
    }
}

export default new LoginView();
