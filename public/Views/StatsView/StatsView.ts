import Ajax from '@modules/ajax';
import MessengerComponent from '@components/MessengerComponent/MessengerComponent';
import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';
import { getLsItem } from '@utils/localStorage';
import router from '@router';


class StatsView {
    constructor() {}

    render() {
        const containerObj = new MainLayoutComponent().render({
            type: 'messenger',
        });

        return containerObj.container;
    }
}

export default new StatsView();
