import SignupFormComponent from '@components/SignupFormComponent/SignupFormComponent';
import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';
import createElement from '@utils/createElement';
import { getLsItem } from '@utils/localStorage';
import API from '@utils/api';
import router from '@router';


class SignupView {
    constructor() {}

    async render() {
        // const [status, profileData] = await API.getProfile(getLsItem('username', ""));
        // if (status === 200) {
        //     router.go({ path: '/feed' });
        // }

        const [status, feedData] = await API.getFeed(1);
        if (status === 200) {
            return router.go({ path: '/feed' });
        }

        const containerObj = new MainLayoutComponent().render({
            type: 'auth',
        });

        const wrapper = createElement({
            parent: containerObj.container,
            classes: ['auth__wrapper'],
        });
        this.renderServiceInfo(wrapper);
        new SignupFormComponent(wrapper);

        return containerObj.container;
    }

    renderServiceInfo(wrapper: HTMLElement) {
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

export default new SignupView();
