import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';
import ButtonComponent from '@components/UI/ButtonComponent/ButtonComponent';
import createElement from '@utils/createElement';
import router from '@router';


class NotFoundView {
    constructor() {}

    render() {
        const containerObj = new MainLayoutComponent().render({
            type: 'not-found',
        });
        
        createElement({
            parent: containerObj.container,
            classes: ['not-found__logo'],
            attrs: { src: '/static/img/logo-gray.svg' }
        });

        createElement({
            tag: 'h1',
            parent: containerObj.container,
            text: "Такой страницы нет"
        });

        new ButtonComponent(containerObj.container, {
            text: 'К ленте новостей',
            variant: 'primary',
            size: 'large',
            onClick: () => router.go({ path: '/feed' }),
        });

        return containerObj.container;
    }
}

export default new NotFoundView();
