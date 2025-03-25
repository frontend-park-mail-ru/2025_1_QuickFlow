import Ajax from '../../modules/ajax.js';
import createElement from '../../utils/createElement.js';


export default class LogoutView {
    constructor(menu) {
        this.menu = menu;
    }

    render() {
        Ajax.post({
            url: '/logout',
            callback: (status) => {
                let isUnauthorized = status === 200;
                this.menu.goToPage(!isUnauthorized ? this.menu.menuElements.feed : this.menu.menuElements.login);
            }
        });
    
        return createElement({});
    }
}
