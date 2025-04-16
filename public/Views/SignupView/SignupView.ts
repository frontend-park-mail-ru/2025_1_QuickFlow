import SignupFormComponent from '@components/SignupFormComponent/SignupFormComponent';
import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';


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
