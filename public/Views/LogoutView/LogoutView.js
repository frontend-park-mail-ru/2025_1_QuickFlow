import Ajax from '../../modules/ajax.js';

export default class LogoutView {
    constructor(menu) {
        this.menu = menu;
    }

    render() {
        Ajax.post({
            url: '/logout',
            callback: (status) => {
                let isUnauthorized = status === 200;
    
                if (!isUnauthorized) {
                    this.menu.goToPage(this.menu.menuElements.feed);
                    return;
                }
    
                this.menu.goToPage(this.menu.menuElements.login);
            }
        });
    
        return document.createElement('div');
    }
}
