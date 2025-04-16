import LoginFormComponent from '@components/LoginFormComponent/LoginFormComponent';
import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';


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
