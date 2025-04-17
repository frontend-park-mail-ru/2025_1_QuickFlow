import LoginFormComponent from '@components/LoginFormComponent/LoginFormComponent';
import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';
import createElement from '@utils/createElement';


class LoginView {
    constructor() {}

    render() {
        const containerObj = new MainLayoutComponent().render({
            type: 'auth',
        });

        const wrapper = createElement({
            parent: containerObj.container,
            classes: ['auth__wrapper'],
        });
        this.renderServiceInfo(wrapper);
        new LoginFormComponent(wrapper);

        return containerObj.container;
    }

    renderServiceInfo(wrapper) {
        const info = createElement({
            parent: wrapper,
            classes: ['auth__info'],
        });

        const infoHeader = createElement({
            parent: info,
            classes: ['auth__info-header'],
        });
        createElement({
            parent: infoHeader,
            classes: ['auth-form__logo'],
            attrs: {src: '/static/img/logo-icon.svg'}
        });
        createElement({
            tag: "h1",
            parent: infoHeader,
            text: "QuickFlow",
        });

        createElement({
            parent: info,
            text: "Сервис\nдля общения\nи поиска друзей",
        });
    }
}

export default new LoginView();
